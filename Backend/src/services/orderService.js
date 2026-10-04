import crypto from 'crypto'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import PaymentAttempt from '../models/PaymentAttempt.js'
import AuditLog from '../models/AuditLog.js'
import { computeOrderTotals } from './pricing.js'
import { evaluateOrder } from '../policy/policyEngine.js'
import { getActivePolicyConfig } from '../policy/policyConfig.js'
import { getPaymentProvider } from '../payments/index.js'

class ApiError extends Error {
  constructor(statusCode, message, extra) {
    super(message)
    this.statusCode = statusCode
    this.extra = extra
  }
}

const PAYMENT_WINDOW_MINUTES = Number(process.env.PAYMENT_WINDOW_MINUTES || 30)

/**
 * Order lifecycle state machine.
 *
 * INVENTORY RESERVATION DESIGN DECISION (documented per the review request):
 * Stock is decremented ONCE, atomically, at order creation — that decrement
 * IS the reservation. It is deliberately NOT restored when a payment attempt
 * merely fails (payment_pending -> payment_failed), because a failed payment
 * is retryable and the customer may still complete it seconds later. If we
 * released stock on every failure, a second buyer could grab the last unit
 * during that window, and a subsequent successful retry on the first order
 * would oversell — exactly the race this was built to prevent.
 *
 * Stock is released in exactly two situations, both going through the same
 * idempotent releaseReservation() below:
 *   1. The order is explicitly cancelled (from payment_pending, payment_failed,
 *      paid, or confirmed).
 *   2. The payment window expires without a successful payment
 *      (see expireStaleOrders — intended to be invoked by a periodic job/cron
 *      in a real deployment; exposed here as an admin-triggerable endpoint
 *      since this project has no background job infrastructure).
 * Custom (isCustom) items never touch Product stock at all — they're made to
 * order — so reservation/release is a no-op for them by construction.
 */
const ALLOWED_TRANSITIONS = {
  payment_pending: ['paid', 'payment_failed', 'cancelled'],
  payment_failed: ['payment_pending', 'cancelled'], // retry, or give up
  paid: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: []
}

async function logAudit(correlationId, eventType, { actor, order, policyVersion, decision, metadata } = {}) {
  try {
    await AuditLog.create({ correlationId, eventType, actor, order, policyVersion, decision, metadata })
  } catch (e) {
    console.error('Audit log write failed:', e.message)
  }
}

/**
 * Atomically reserves stock for every catalog item (custom items are
 * skipped — they have no Product doc and no stock limit). If any
 * reservation fails partway through, everything reserved so far in this
 * call is rolled back immediately (this is a creation-time rollback, not
 * the lifecycle release described above — nothing has been persisted as an
 * order yet at this point, so there is no idempotency concern here).
 */
async function reserveStock(verifiedItems) {
  const reserved = []
  for (const item of verifiedItems) {
    if (item.isCustom) continue // made-to-order, no stock to reserve

    const updated = await Product.findOneAndUpdate(
      { _id: item.productId, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true }
    )
    if (!updated) {
      await Promise.all(reserved.map((r) => Product.updateOne({ _id: r.productId }, { $inc: { stock: r.quantity } })))
      return { ok: false, failedProductId: item.productId }
    }
    reserved.push(item)
  }
  return { ok: true }
}

/**
 * Releases a reserved order's stock back to the catalog — exactly once,
 * ever, for a given order. The atomic findOneAndUpdate with
 * reservationReleased: false as part of the filter is what prevents a
 * double-release: only the caller that successfully flips the flag from
 * false -> true is allowed to proceed to increment stock. A second,
 * concurrent or later call (e.g. cancel called twice, or cancel after an
 * expiry job already ran) finds no matching document and does nothing.
 */
async function releaseReservation(order, reason) {
  const claimed = await Order.findOneAndUpdate(
    { _id: order._id, reservationReleased: false },
    { $set: { reservationReleased: true } },
    { new: true }
  )
  if (!claimed) {
    return false // already released — not an error, just a no-op
  }
  await Promise.all(
    order.items
      .filter((i) => !i.isCustom)
      .map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.quantity } }))
  )
  return true
}

/**
 * Pure-ish evaluation step shared by createOrder() and the AI purchase-
 * proposal preview (ai/purchaseProposal.js): reprices items server-side,
 * runs the deterministic policy engine, and checks the optional daily
 * spending limit. Has NO side effects — no stock reservation, no order
 * document, no payment attempt — so it's safe to call just to preview a
 * decision before the user approves anything.
 */
export async function evaluateProposedOrder({ user, items, confirmed }) {
  const productIds = [...new Set(items.filter((i) => !i.isCustom).map((i) => i.productId))]
  const products = productIds.length ? await Product.find({ _id: { $in: productIds } }) : []
  const productsById = new Map(products.map((p) => [String(p._id), p]))

  const { verifiedItems, itemsPricePaise, shippingPricePaise, totalPricePaise } =
    computeOrderTotals(items, productsById)

  const policyConfig = await getActivePolicyConfig()
  const lineItemsForPolicy = verifiedItems.map((item) => ({
    amountPaise: item.unitPricePaise,
    quantity: item.quantity,
    category: item.category,
    stock: item.stock,
    isActive: true,
    userConfirmed: Boolean(confirmed),
    isDuplicateAttempt: false
  }))

  const policyDecision = evaluateOrder(
    lineItemsForPolicy,
    policyConfig,
    totalPricePaise,
    policyConfig.maximumOrderAmountPaise
  )

  let dailyLimitReason = null
  if (policyDecision.allowed && policyConfig.dailySpendingLimitPaise != null) {
    const since = new Date(); since.setHours(0, 0, 0, 0)
    const todaysOrders = await Order.find({
      user: user._id,
      status: { $in: ['paid', 'confirmed', 'shipped', 'delivered'] },
      createdAt: { $gte: since }
    }).select('totalPrice').lean()
    const spentTodayPaise = todaysOrders.reduce((sum, o) => sum + Math.round(o.totalPrice * 100), 0)

    if (spentTodayPaise + totalPricePaise > policyConfig.dailySpendingLimitPaise) {
      dailyLimitReason = `This order would bring today's spending to ₹${((spentTodayPaise + totalPricePaise) / 100).toFixed(2)}, over your ₹${(policyConfig.dailySpendingLimitPaise / 100).toFixed(2)} daily limit.`
    }
  }

  const finalDecision = dailyLimitReason
    ? { allowed: false, reasons: [...policyDecision.reasons, dailyLimitReason], checks: [...policyDecision.checks, '✗ Under daily spending limit'] }
    : policyDecision.allowed
      ? { allowed: true, reasons: [], checks: [...policyDecision.checks, policyConfig.dailySpendingLimitPaise != null ? '✓ Under daily spending limit' : null].filter(Boolean) }
      : policyDecision

  return { verifiedItems, itemsPricePaise, shippingPricePaise, totalPricePaise, policyDecision: finalDecision, policyConfig }
}

/**
 * Creates an order: validates + reprices items server-side (catalog lookup
 * for normal items, computeCustomItemPrice for customizer items), runs the
 * policy engine (including the daily spending limit), atomically reserves
 * stock, persists the order, and opens a payment attempt with the
 * configured provider. Idempotent on (user, idempotencyKey).
 */
export async function createOrder({ user, items, shippingAddress, paymentMethod, confirmed, idempotencyKey, source = 'direct' }) {
  const correlationId = idempotencyKey || crypto.randomUUID()

  if (idempotencyKey) {
    const existing = await Order.findOne({ user: user._id, idempotencyKey })
    if (existing) {
      return { order: existing, replayed: true }
    }
  }

  const { verifiedItems, itemsPricePaise, shippingPricePaise, totalPricePaise, policyDecision } =
    await evaluateProposedOrder({ user, items, confirmed })

  if (!policyDecision.allowed) {
    await logAudit(correlationId, 'order.policy_blocked', {
      actor: { userId: user._id, role: user.role },
      decision: policyDecision,
      metadata: { itemsPricePaise, totalPricePaise }
    })
    throw new ApiError(422, 'Order blocked by purchase policy', { reasons: policyDecision.reasons, checks: policyDecision.checks })
  }

  const reservation = await reserveStock(verifiedItems)
  if (!reservation.ok) {
    await logAudit(correlationId, 'order.stock_reservation_failed', {
      actor: { userId: user._id, role: user.role },
      metadata: { failedProductId: reservation.failedProductId }
    })
    throw new ApiError(409, 'One or more items went out of stock while placing your order')
  }
  await logAudit(correlationId, 'order.stock_reserved', {
    actor: { userId: user._id, role: user.role },
    metadata: { items: verifiedItems.map((i) => ({ productId: i.productId, isCustom: i.isCustom, quantity: i.quantity })) }
  })

  const paymentWindowExpiresAt = new Date(Date.now() + PAYMENT_WINDOW_MINUTES * 60 * 1000)

  let order
  try {
    order = await Order.create({
      user: user._id,
      idempotencyKey,
      source,
      items: verifiedItems.map((i) => ({
        product: i.isCustom ? undefined : i.productId,
        isCustom: i.isCustom,
        customConfig: i.isCustom ? i.customConfig : undefined,
        name: i.name,
        image: i.image,
        price: i.price,
        size: i.size,
        quantity: i.quantity
      })),
      shippingAddress,
      paymentMethod,
      itemsPrice: itemsPricePaise / 100,
      shippingPrice: shippingPricePaise / 100,
      totalPrice: totalPricePaise / 100,
      status: 'payment_pending',
      paymentWindowExpiresAt,
      policyDecision: { allowed: true, checks: policyDecision.checks, version: 1 }
    })
  } catch (err) {
    // Unique index on idempotencyKey caught a race between two identical
    // concurrent requests — THIS call's own stock reservation (made above,
    // before Order.create() ran) must be released; the other, successful
    // request already has its own valid reservation under the existing order.
    if (err.code === 11000 && idempotencyKey) {
      const existing = await Order.findOne({ user: user._id, idempotencyKey })
      await Promise.all(
        verifiedItems.filter((i) => !i.isCustom).map((i) => Product.updateOne({ _id: i.productId }, { $inc: { stock: i.quantity } }))
      )
      if (existing) return { order: existing, replayed: true }
      throw err
    }
    // Any other creation failure — release what this call reserved.
    await Promise.all(
      verifiedItems.filter((i) => !i.isCustom).map((i) => Product.updateOne({ _id: i.productId }, { $inc: { stock: i.quantity } }))
    )
    throw err
  }

  await logAudit(correlationId, 'order.created', {
    actor: { userId: user._id, role: user.role },
    order: order._id,
    metadata: { totalPricePaise, source }
  })

  const provider = getPaymentProvider()
  const paymentResult = await provider.createPayment({
    orderId: String(order._id),
    amountPaise: totalPricePaise,
    currency: 'INR'
  }, { id: String(user._id), email: user.email })

  const attempt = await PaymentAttempt.create({
    order: order._id,
    provider: provider.name,
    providerOrderId: paymentResult.providerOrderId,
    amountPaise: totalPricePaise,
    status: 'created'
  })

  order.paymentProvider = provider.name
  order.paymentProviderOrderId = paymentResult.providerOrderId
  await order.save()

  await logAudit(correlationId, 'payment.attempt_created', {
    actor: { userId: user._id, role: user.role },
    order: order._id,
    metadata: { provider: provider.name, attemptId: attempt._id }
  })

  return { order, paymentClientConfig: paymentResult.clientConfig, replayed: false }
}

/**
 * Verifies a payment attempt against the provider's own records (never the
 * client's say-so) and transitions the order accordingly.
 *
 * On failure, stock is deliberately NOT released — see the module-level
 * comment on ALLOWED_TRANSITIONS for why. The order simply moves to
 * payment_failed, still holding its reservation, until the customer retries
 * or cancels (or the payment window expires).
 */
export async function verifyOrderPayment({ order, user, payload }) {
  if (order.user.toString() !== user._id.toString() && user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized')
  }
  if (order.status !== 'payment_pending') {
    throw new ApiError(409, `Cannot verify payment for an order in '${order.status}' status`)
  }
  if (order.paymentWindowExpiresAt && order.paymentWindowExpiresAt < new Date()) {
    throw new ApiError(409, 'Payment window has expired for this order')
  }

  const attempt = await PaymentAttempt.findOne({ order: order._id }).sort({ createdAt: -1 })
  if (!attempt) {
    throw new ApiError(404, 'No payment attempt found for this order')
  }

  const provider = getPaymentProvider()
  const result = await provider.verifyPayment({ providerOrderId: attempt.providerOrderId, payload })

  const correlationId = order.idempotencyKey || String(order._id)

  if (result.verified) {
    attempt.status = 'verified'
    attempt.providerPaymentId = result.providerPaymentId
    attempt.verificationPayload = payload
    await attempt.save()

    order.status = 'paid'
    order.isPaid = true
    order.paidAt = new Date()
    order.paymentResult = { id: result.providerPaymentId, status: 'verified', updateTime: new Date().toISOString() }
    await order.save()

    await logAudit(correlationId, 'payment.verified', { actor: { userId: user._id, role: user.role }, order: order._id })
    await logAudit(correlationId, 'order.paid', { actor: { userId: user._id, role: user.role }, order: order._id })
  } else {
    attempt.status = 'failed'
    attempt.failureReason = result.failureReason
    await attempt.save()

    order.status = 'payment_failed'
    await order.save()
    // Stock intentionally NOT released here — see module comment.

    await logAudit(correlationId, 'payment.verification_failed', {
      actor: { userId: user._id, role: user.role },
      order: order._id,
      metadata: { failureReason: result.failureReason }
    })
  }

  return order
}

/**
 * Opens a fresh payment attempt for an order whose last attempt failed.
 * Stock is still reserved from order creation (never released on mere
 * failure), so this does not re-check or re-reserve it — it only needs to
 * confirm the reservation is still held (not released) and the payment
 * window hasn't expired.
 */
export async function retryOrderPayment({ order, user }) {
  if (order.user.toString() !== user._id.toString() && user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized')
  }
  if (order.status !== 'payment_failed') {
    throw new ApiError(409, `Cannot retry payment for an order in '${order.status}' status`)
  }
  if (order.reservationReleased) {
    throw new ApiError(409, 'This order\'s items were already released back to stock (likely due to expiry) — please place a new order')
  }
  if (order.paymentWindowExpiresAt && order.paymentWindowExpiresAt < new Date()) {
    throw new ApiError(409, 'Payment window has expired for this order — please place a new order')
  }

  const provider = getPaymentProvider()
  const totalPricePaise = Math.round(order.totalPrice * 100)
  const paymentResult = await provider.createPayment({
    orderId: String(order._id),
    amountPaise: totalPricePaise,
    currency: 'INR'
  }, { id: String(user._id), email: user.email })

  await PaymentAttempt.create({
    order: order._id,
    provider: provider.name,
    providerOrderId: paymentResult.providerOrderId,
    amountPaise: totalPricePaise,
    status: 'created'
  })

  order.status = 'payment_pending'
  order.paymentProvider = provider.name
  order.paymentProviderOrderId = paymentResult.providerOrderId
  await order.save()

  await logAudit(order.idempotencyKey || String(order._id), 'payment.attempt_created', {
    actor: { userId: user._id, role: user.role },
    order: order._id,
    metadata: { provider: provider.name, retry: true }
  })

  return { order, paymentClientConfig: paymentResult.clientConfig }
}

/**
 * Admin/guarded status transition. Rejects any transition not explicitly
 * allowed from the order's current status. Releasing stock on cancellation
 * goes through the same idempotent releaseReservation() used by the expiry
 * sweep, so cancelling an already-expired-and-released order is a safe no-op.
 */
export async function transitionOrderStatus({ order, nextStatus, actor }) {
  const allowedNext = ALLOWED_TRANSITIONS[order.status] || []
  if (!allowedNext.includes(nextStatus)) {
    throw new ApiError(400, `Cannot move order from '${order.status}' to '${nextStatus}'`)
  }

  if (nextStatus === 'cancelled') {
    await releaseReservation(order, 'cancelled')
  }

  order.status = nextStatus
  if (nextStatus === 'delivered') order.deliveredAt = new Date()
  await order.save()

  await logAudit(order.idempotencyKey || String(order._id), 'order.status_changed', {
    actor: { userId: actor._id, role: actor.role },
    order: order._id,
    metadata: { nextStatus }
  })

  return order
}

/**
 * Finds every order whose payment window has expired while still sitting in
 * payment_pending or payment_failed, cancels it, and releases its
 * reservation. In a real deployment this would be invoked by a scheduled
 * job (cron / queue consumer); here it's exposed as an admin-triggerable
 * endpoint (POST /api/orders/expire-stale) since there's no background job
 * infrastructure in this project.
 */
export async function expireStaleOrders() {
  const stale = await Order.find({
    status: { $in: ['payment_pending', 'payment_failed'] },
    paymentWindowExpiresAt: { $lt: new Date() }
  })

  const results = []
  for (const order of stale) {
    const released = await releaseReservation(order, 'expired')
    order.status = 'cancelled'
    await order.save()
    await logAudit(order.idempotencyKey || String(order._id), 'order.status_changed', {
      metadata: { nextStatus: 'cancelled', reason: 'payment_window_expired', stockReleased: released }
    })
    results.push({ orderId: String(order._id), stockReleased: released })
  }
  return results
}

export { ApiError }

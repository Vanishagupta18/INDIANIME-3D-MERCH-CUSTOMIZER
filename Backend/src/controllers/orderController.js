import asyncHandler from 'express-async-handler'
import Order from '../models/Order.js'
import { createOrder as createOrderService, verifyOrderPayment, retryOrderPayment, transitionOrderStatus, expireStaleOrders, ApiError } from '../services/orderService.js'

function handleServiceError(err, res) {
  if (err instanceof ApiError) {
    res.status(err.statusCode)
    throw new Error(err.message + (err.extra ? ` — ${JSON.stringify(err.extra)}` : ''))
  }
  throw err
}

// @POST /api/orders
// Body: { items: [{productId, quantity, size}], shippingAddress, paymentMethod, confirmed }
// Header (recommended): Idempotency-Key
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, confirmed } = req.body
  const idempotencyKey = req.headers['idempotency-key'] || req.body.idempotencyKey

  if (!items || items.length === 0) {
    res.status(400); throw new Error('No order items')
  }
  if (!shippingAddress) {
    res.status(400); throw new Error('Shipping address is required')
  }

  try {
    const { order, paymentClientConfig, replayed } = await createOrderService({
      user: req.user,
      items,
      shippingAddress,
      paymentMethod,
      confirmed,
      idempotencyKey
    })
    res.status(replayed ? 200 : 201).json({ success: true, order, payment: paymentClientConfig, replayed: Boolean(replayed) })
  } catch (err) {
    handleServiceError(err, res)
  }
})

// @POST /api/orders/:id/verify-payment
// Body: provider-specific verification payload (for simulation: { outcome: 'success' | 'failure' })
export const verifyPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) { res.status(404); throw new Error('Order not found') }

  try {
    const updated = await verifyOrderPayment({ order, user: req.user, payload: req.body })
    res.json({ success: true, order: updated })
  } catch (err) {
    handleServiceError(err, res)
  }
})

// @POST /api/orders/:id/retry-payment
// Opens a fresh payment attempt for an order stuck in 'payment_failed'.
export const retryPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) { res.status(404); throw new Error('Order not found') }

  try {
    const { order: updated, paymentClientConfig } = await retryOrderPayment({ order, user: req.user })
    res.json({ success: true, order: updated, payment: paymentClientConfig })
  } catch (err) {
    handleServiceError(err, res)
  }
})

// @GET /api/orders/my
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
  res.json({ success: true, orders })
})

// @GET /api/orders/:id
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email')
  if (!order) { res.status(404); throw new Error('Order not found') }
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized')
  }
  res.json({ success: true, order })
})

// @GET /api/orders (admin)
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
  res.json({ success: true, orders })
})

// @POST /api/orders/expire-stale (admin)
// Stand-in for a scheduled job: cancels orders whose payment window passed
// without a successful payment, and releases their stock (idempotently).
// In production, wire this to a cron trigger or queue consumer instead of
// an admin button.
export const expireStale = asyncHandler(async (req, res) => {
  const results = await expireStaleOrders()
  res.json({ success: true, expiredCount: results.length, results })
})

// @PUT /api/orders/:id/status (admin)
// Body: { status }
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) { res.status(404); throw new Error('Order not found') }

  try {
    const updated = await transitionOrderStatus({ order, nextStatus: req.body.status, actor: req.user })
    res.json({ success: true, order: updated })
  } catch (err) {
    handleServiceError(err, res)
  }
})

import asyncHandler from 'express-async-handler'
import crypto from 'crypto'
import AuditLog from '../models/AuditLog.js'
import { extractAndValidateIntent } from '../ai/index.js'
import { searchCatalog } from '../ai/catalogSearch.js'
import { rankCandidates } from '../ai/ranking.js'
import { evaluateProposedOrder, createOrder as createOrderService, ApiError } from '../services/orderService.js'

async function logAiAudit(correlationId, eventType, extra = {}) {
  try { await AuditLog.create({ correlationId, eventType, ...extra }) }
  catch (e) { console.error('AI audit log write failed:', e.message) }
}

// @POST /api/ai/shop
// Body: { message: string, previousIntent?: object, correlationId?: string }
// Read-only: understands the request and returns real, ranked catalog matches.
// Never creates a proposal or an order by itself.
export const shop = asyncHandler(async (req, res) => {
  const { message, previousIntent } = req.body
  if (!message || typeof message !== 'string') {
    res.status(400); throw new Error('message is required')
  }
  const correlationId = req.body.correlationId || crypto.randomUUID()

  const { intent, usedProvider, degraded } = await extractAndValidateIntent(message, previousIntent || null)
  await logAiAudit(correlationId, 'ai.intent_extracted', {
    actor: { userId: req.user._id, role: req.user.role },
    metadata: { message, intent, usedProvider, degraded }
  })

  const candidates = await searchCatalog(intent)
  await logAiAudit(correlationId, 'ai.catalog_searched', {
    actor: { userId: req.user._id, role: req.user.role },
    metadata: { candidateCount: candidates.length }
  })

  const ranked = rankCandidates(candidates, intent)
  const top = ranked.slice(0, 6).map(({ product, matchReason }) => ({
    productId: product._id,
    name: product.name,
    price: product.price,
    images: product.images,
    category: product.category,
    anime: product.anime,
    stock: product.stock,
    rating: product.rating,
    matchReason
  }))

  await logAiAudit(correlationId, 'ai.recommendation_returned', {
    actor: { userId: req.user._id, role: req.user.role },
    metadata: { returnedCount: top.length }
  })

  res.json({
    success: true,
    correlationId,
    intent,
    degraded, // true if the configured AI provider failed and this is a rule-based fallback result
    products: top
  })
})

// @POST /api/ai/purchase-proposal
// Body: { productId? , isCustom?, customConfig?, quantity, size? , correlationId? }
// Read-only preview: real server price + full policy evaluation, but
// creates nothing — no stock reservation, no order, no payment attempt.
export const purchaseProposal = asyncHandler(async (req, res) => {
  const { productId, isCustom, customConfig, quantity = 1, size, correlationId: cid } = req.body
  const correlationId = cid || crypto.randomUUID()

  const items = [isCustom
    ? { isCustom: true, customConfig, quantity }
    : { productId, quantity, size }
  ]

  try {
    const { verifiedItems, itemsPricePaise, shippingPricePaise, totalPricePaise, policyDecision, policyConfig } =
      await evaluateProposedOrder({ user: req.user, items, confirmed: false }) // confirmed:false on purpose — this is a PREVIEW

    await logAiAudit(correlationId, 'ai.proposal_created', {
      actor: { userId: req.user._id, role: req.user.role },
      order: null,
      decision: policyDecision,
      metadata: { totalPricePaise }
    })

    // Single response contract: `policy` lives INSIDE `proposal`, not as a
    // sibling of it. The frontend only ever stores `data.proposal` into
    // state (AIShop.jsx), so a sibling `policy` key was silently dropped —
    // that was the actual bug behind the "Cannot read properties of
    // undefined (reading 'checks')" crash. Nesting it here means
    // `data.proposal` is now the complete, self-sufficient object the UI
    // expects, with nothing left behind at the response's top level.
    res.json({
      success: true,
      correlationId,
      proposal: {
        items: verifiedItems.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity, size: i.size, isCustom: i.isCustom })),
        itemsPrice: itemsPricePaise / 100,
        shippingPrice: shippingPricePaise / 100,
        total: totalPricePaise / 100,
        maximumOrderAmount: policyConfig.maximumOrderAmountPaise / 100,
        // Note: policyDecision.allowed will always be false here if
        // confirmationRequired is on, since this preview intentionally sends
        // confirmed:false — that single "✗ User confirmation present" check
        // is EXPECTED to fail on a preview; the frontend treats that one
        // specific check as "awaiting approval", not as a hard block. All
        // other checks (budget/stock/quantity/category) are evaluated for real.
        policy: { allowed: policyDecision.allowed, checks: policyDecision.checks, reasons: policyDecision.reasons }
      }
    })
  } catch (err) {
    if (err instanceof ApiError) { res.status(err.statusCode); throw new Error(err.message) }
    throw err
  }
})

// @POST /api/ai/approve
// Body: { productId?, isCustom?, customConfig?, quantity, size?, shippingAddress, paymentMethod, correlationId? }
// The ONLY endpoint in the AI flow that actually creates an order — and it
// does so by calling the exact same createOrder() the regular checkout
// uses, with source: 'ai_agent' for audit/traceability. No separate
// AI-only order-creation code path exists.
export const approve = asyncHandler(async (req, res) => {
  const { productId, isCustom, customConfig, quantity = 1, size, shippingAddress, paymentMethod, correlationId: cid } = req.body
  const correlationId = cid || crypto.randomUUID()

  if (!shippingAddress) { res.status(400); throw new Error('Shipping address is required') }

  const items = [isCustom
    ? { isCustom: true, customConfig, quantity }
    : { productId, quantity, size }
  ]

  try {
    const { order, paymentClientConfig, replayed } = await createOrderService({
      user: req.user,
      items,
      shippingAddress,
      paymentMethod,
      confirmed: true, // explicit approval already happened client-side (Part 6's [APPROVE & PAY] button)
      idempotencyKey: correlationId,
      source: 'ai_agent'
    })
    res.status(replayed ? 200 : 201).json({ success: true, order, payment: paymentClientConfig, replayed: Boolean(replayed) })
  } catch (err) {
    if (err instanceof ApiError) { res.status(err.statusCode); throw new Error(err.message) }
    throw err
  }
})
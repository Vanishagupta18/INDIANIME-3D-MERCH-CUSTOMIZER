import express from 'express'
import rateLimit from 'express-rate-limit'
import { shop, purchaseProposal, approve } from '../controllers/aiController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Tighter limit than the global API limiter — AI calls (especially a
// configured LLM provider) are more expensive per-request than a normal
// CRUD call.
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many AI shopping requests, please slow down.' }
})

router.use(aiLimiter)
router.post('/shop', protect, shop)
router.post('/purchase-proposal', protect, purchaseProposal)
router.post('/approve', protect, approve)

export default router

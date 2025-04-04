import express from 'express'
import asyncHandler from 'express-async-handler'
import User from '../models/User.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Wishlist toggle
router.post('/wishlist/:productId', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  const idx = user.wishlist.indexOf(req.params.productId)
  if (idx === -1) {
    user.wishlist.push(req.params.productId)
  } else {
    user.wishlist.splice(idx, 1)
  }
  await user.save()
  res.json({ success: true, wishlist: user.wishlist })
}))

export default router
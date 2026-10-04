import express from 'express'
import {
  createOrder, verifyPayment, retryPayment, getMyOrders, getOrderById,
  getAllOrders, updateOrderStatus, expireStale
} from '../controllers/orderController.js'
import { protect, adminOnly } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', protect, createOrder)
router.post('/:id/verify-payment', protect, verifyPayment)
router.post('/:id/retry-payment', protect, retryPayment)
router.get('/my', protect, getMyOrders)
router.get('/:id', protect, getOrderById)
router.get('/', protect, adminOnly, getAllOrders)
router.post('/expire-stale', protect, adminOnly, expireStale)
router.put('/:id/status', protect, adminOnly, updateOrderStatus)

export default router

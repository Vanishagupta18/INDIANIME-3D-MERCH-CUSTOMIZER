import asyncHandler from 'express-async-handler'
import Order from '../models/Order.js'

// @POST /api/orders
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice } = req.body

  if (!items || items.length === 0) {
    res.status(400); throw new Error('No order items')
  }

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice
  })

  res.status(201).json({ success: true, order })
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

// @PUT /api/orders/:id/status (admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) { res.status(404); throw new Error('Order not found') }
  order.status = req.body.status
  if (req.body.status === 'delivered') order.deliveredAt = Date.now()
  await order.save()
  res.json({ success: true, order })
})
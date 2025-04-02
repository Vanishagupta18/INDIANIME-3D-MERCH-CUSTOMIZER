import asyncHandler from 'express-async-handler'
import Product from '../models/Product.js'

// @GET /api/products
export const getProducts = asyncHandler(async (req, res) => {
  const { category, anime, search, sort, minPrice, maxPrice, page = 1, limit = 12 } = req.query

  const filter = {}
  if (category) filter.category = category
  if (anime) filter.anime = { $regex: anime, $options: 'i' }
  if (search) filter.name = { $regex: search, $options: 'i' }
  if (minPrice || maxPrice) {
    filter.price = {}
    if (minPrice) filter.price.$gte = Number(minPrice)
    if (maxPrice) filter.price.$lte = Number(maxPrice)
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    'price-low': { price: 1 },
    'price-high': { price: -1 },
    rating: { rating: -1 }
  }

  const skip = (Number(page) - 1) * Number(limit)
  const total = await Product.countDocuments(filter)
  const products = await Product.find(filter)
    .sort(sortOptions[sort] || { createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))

  res.json({
    success: true,
    products,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    }
  })
})

// @GET /api/products/:id
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }
  res.json({ success: true, product })
})

// @POST /api/products (admin)
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body)
  res.status(201).json({ success: true, product })
})

// @PUT /api/products/:id (admin)
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true
  })
  if (!product) { res.status(404); throw new Error('Product not found') }
  res.json({ success: true, product })
})

// @DELETE /api/products/:id (admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) { res.status(404); throw new Error('Product not found') }
  res.json({ success: true, message: 'Product deleted' })
})

// @POST /api/products/:id/reviews
export const addReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) { res.status(404); throw new Error('Product not found') }

  const alreadyReviewed = product.reviews.find(
    r => r.user.toString() === req.user._id.toString()
  )
  if (alreadyReviewed) {
    res.status(400); throw new Error('You already reviewed this product')
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: Number(req.body.rating),
    comment: req.body.comment
  })
  product.updateRating()
  await product.save()
  res.status(201).json({ success: true, message: 'Review added' })
})
import asyncHandler from 'express-async-handler'
import { v4 as uuidv4 } from 'uuid'
import Design from '../models/Design.js'

// @POST /api/designs/save
export const saveDesign = asyncHandler(async (req, res) => {
  const shareId = uuidv4().split('-')[0]
  const design = await Design.create({
    user: req.user?._id || null,
    shareId,
    designData: req.body.designData,
    title: req.body.title || 'My Custom Design',
    isPublic: true
  })
  res.status(201).json({
    success: true,
    shareId: design.shareId,
    shareUrl: `/design/${design.shareId}`
  })
})

// @GET /api/designs/:shareId
export const getDesign = asyncHandler(async (req, res) => {
  const design = await Design.findOne({ shareId: req.params.shareId })
  if (!design) { res.status(404); throw new Error('Design not found') }
  design.views += 1
  await design.save()
  res.json({ success: true, design })
})

// @GET /api/designs/my
export const getMyDesigns = asyncHandler(async (req, res) => {
  const designs = await Design.find({ user: req.user._id }).sort({ createdAt: -1 })
  res.json({ success: true, designs })
})
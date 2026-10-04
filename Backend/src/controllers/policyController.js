import asyncHandler from 'express-async-handler'
import PolicyConfig from '../models/PolicyConfig.js'
import { DEFAULT_POLICY_CONFIG } from '../policy/policyConfig.js'

// @GET /api/policy (admin)
export const getPolicy = asyncHandler(async (req, res) => {
  const stored = await PolicyConfig.findOne({ singleton: 'default' })
  res.json({ success: true, policy: stored || { ...DEFAULT_POLICY_CONFIG, singleton: 'default', version: 0 } })
})

// @PUT /api/policy (admin)
// Body: any subset of {confirmationRequired, maximumAmountPaise, maximumOrderAmountPaise, maximumQuantity, allowedCategories}
export const updatePolicy = asyncHandler(async (req, res) => {
  const allowedFields = ['confirmationRequired', 'maximumAmountPaise', 'maximumOrderAmountPaise', 'maximumQuantity', 'allowedCategories']
  const update = {}
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) update[field] = req.body[field]
  }
  if (Object.keys(update).length === 0) {
    res.status(400); throw new Error('No valid policy fields provided')
  }

  const policy = await PolicyConfig.findOneAndUpdate(
    { singleton: 'default' },
    { $set: update, $setOnInsert: { singleton: 'default' }, $inc: { version: 1 } },
    { new: true, upsert: true }
  )
  res.json({ success: true, policy })
})

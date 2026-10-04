import mongoose from 'mongoose'

const policyConfigSchema = new mongoose.Schema({
  singleton: { type: String, default: 'default', unique: true },
  confirmationRequired: { type: Boolean, default: true },
  maximumAmountPaise: { type: Number, default: 10_000_00, min: 0 },
  maximumOrderAmountPaise: { type: Number, default: 25_000_00, min: 0 },
  maximumQuantity: { type: Number, default: 10, min: 1 },
  allowedCategories: [{ type: String, enum: ['tshirt', 'hoodie', 'cap', 'poster', 'accessory', 'custom-apparel'] }],
  // Optional rolling-24h spending cap, primarily meant for the AI shopping
  // agent (Part 5) — null means no daily limit is enforced. Checked at the
  // orchestration layer (orderService.js), not inside the pure policy
  // engine, since it requires a DB query of the user's recent paid orders.
  dailySpendingLimitPaise: { type: Number, default: null, min: 0 },
  version: { type: Number, default: 1 }
}, { timestamps: true })

export default mongoose.model('PolicyConfig', policyConfigSchema)

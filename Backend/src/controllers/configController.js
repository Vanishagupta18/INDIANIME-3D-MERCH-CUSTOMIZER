import asyncHandler from 'express-async-handler'
import { FREE_SHIPPING_THRESHOLD_PAISE, FLAT_SHIPPING_PAISE } from '../services/pricing.js'
import { CUSTOM_BASE_PRICE_PAISE, CUSTOM_FABRIC_OPTIONS, CUSTOM_PRINT_SIDE_OPTIONS, CUSTOM_SIZES } from '../services/customPricing.js'

// @GET /api/config/pricing-rules (public)
// The ONLY place the frontend should read shipping thresholds and custom-item
// pricing options from. Nothing here is a secret — this is the opposite of
// the earlier bug (three different hardcoded thresholds in three places).
export const getPricingRules = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    rules: {
      currency: 'INR',
      freeShippingThresholdPaise: FREE_SHIPPING_THRESHOLD_PAISE,
      flatShippingPaise: FLAT_SHIPPING_PAISE,
      custom: {
        basePricePaise: CUSTOM_BASE_PRICE_PAISE,
        fabrics: CUSTOM_FABRIC_OPTIONS,
        printSides: CUSTOM_PRINT_SIDE_OPTIONS,
        sizes: CUSTOM_SIZES
      }
    }
  })
})

import express from 'express'
import { getPricingRules } from '../controllers/configController.js'

const router = express.Router()
router.get('/pricing-rules', getPricingRules)

export default router

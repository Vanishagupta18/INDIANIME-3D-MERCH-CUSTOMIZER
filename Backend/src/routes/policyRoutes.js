import express from 'express'
import { getPolicy, updatePolicy } from '../controllers/policyController.js'
import { protect, adminOnly } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', protect, adminOnly, getPolicy)
router.put('/', protect, adminOnly, updatePolicy)

export default router

import express from 'express'
import { saveDesign, getDesign, getMyDesigns } from '../controllers/designController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/save', saveDesign)
router.get('/my', protect, getMyDesigns)
router.get('/:shareId', getDesign)

export default router
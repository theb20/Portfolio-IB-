import { Router } from 'express'
import { adminAuth } from '../middlewares/adminAuth.js'
import { createAvailabilityController, deleteAvailabilityController, listAvailabilityController } from '../controllers/availability.controller.js'

const router = Router()

router.get('/', listAvailabilityController)
router.post('/', adminAuth, createAvailabilityController)
router.delete('/:id', adminAuth, deleteAvailabilityController)

export default router

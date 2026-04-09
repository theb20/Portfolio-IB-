import { Router } from 'express'
import { createCheckoutSessionController } from '../controllers/checkout.controller.js'

const router = Router()

router.post('/session', createCheckoutSessionController)

export default router

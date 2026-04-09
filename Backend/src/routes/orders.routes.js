import { Router } from 'express'
import { createOrderController, listMyOrdersController, listOrdersController, patchOrderStatusController, sendPaymentLinkController } from '../controllers/orders.controller.js'
import { adminAuth } from '../middlewares/adminAuth.js'
import { userAuth } from '../middlewares/userAuth.js'

const router = Router()

router.get('/me', userAuth, listMyOrdersController)
router.post('/', userAuth, createOrderController)
router.get('/', adminAuth, listOrdersController)
router.patch('/:id/status', adminAuth, patchOrderStatusController)
router.post('/:id/payment-link', adminAuth, sendPaymentLinkController)

export default router

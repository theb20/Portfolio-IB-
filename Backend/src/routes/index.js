import { Router } from 'express'
import { healthController } from '../controllers/health.controller.js'
import adminRoutes from './admin.routes.js'
import messagesRoutes from './messages.routes.js'
import projectsRoutes from './projects.routes.js'
import productsRoutes from './products.routes.js'
import checkoutRoutes from './checkout.routes.js'
import ordersRoutes from './orders.routes.js'
import customersRoutes from './customers.routes.js'
import availabilityRoutes from './availability.routes.js'
import authRoutes from './auth.routes.js'
import contentRoutes from './content.routes.js'
import categoriesRoutes from './categories.routes.js'
import settingsRoutes from './settings.routes.js'
import promoCodesRoutes from './promoCodes.routes.js'

const router = Router()

router.get('/health', healthController)
router.use('/projects', projectsRoutes)
router.use('/messages', messagesRoutes)
router.use('/products', productsRoutes)
router.use('/checkout', checkoutRoutes)
router.use('/orders', ordersRoutes)
router.use('/customers', customersRoutes)
router.use('/availability', availabilityRoutes)
router.use('/admin', adminRoutes)
router.use('/auth', authRoutes)
router.use('/content', contentRoutes)
router.use('/categories', categoriesRoutes)
router.use('/settings', settingsRoutes)
router.use('/promo-codes', promoCodesRoutes)

export default router

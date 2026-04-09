import { Router } from 'express'
import { adminAuth } from '../middlewares/adminAuth.js'
import { createCustomerController, deleteCustomerController, listCustomersController, updateCustomerController } from '../controllers/customers.controller.js'

const router = Router()

router.use(adminAuth)
router.get('/', listCustomersController)
router.post('/', createCustomerController)
router.patch('/:id', updateCustomerController)
router.delete('/:id', deleteCustomerController)

export default router

import { Router } from 'express'
import { createProductController, deleteProductController, getProductController, listProductsController, updateProductController } from '../controllers/products.controller.js'
import { adminAuth } from '../middlewares/adminAuth.js'

const router = Router()

router.get('/', listProductsController)
router.get('/:id', getProductController)
router.post('/', adminAuth, createProductController)
router.patch('/:id', adminAuth, updateProductController)
router.delete('/:id', adminAuth, deleteProductController)

export default router

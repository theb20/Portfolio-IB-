import { Router } from 'express'
import {
  createCategoryController,
  deleteCategoryController,
  listCategoriesController,
  updateCategoryController,
} from '../controllers/categories.controller.js'
import { adminAuth } from '../middlewares/adminAuth.js'

const router = Router()

router.get('/', listCategoriesController)
router.post('/', adminAuth, createCategoryController)
router.patch('/:id', adminAuth, updateCategoryController)
router.delete('/:id', adminAuth, deleteCategoryController)

export default router

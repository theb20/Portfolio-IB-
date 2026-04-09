import { Router } from 'express'
import {
  createProjectController,
  deleteProjectController,
  getProjectBySlugController,
  listProjectsController,
  updateProjectController,
} from '../controllers/projects.controller.js'
import { adminAuth } from '../middlewares/adminAuth.js'

const router = Router()

router.get('/', listProjectsController)
router.post('/', adminAuth, createProjectController)
router.get('/:slug', getProjectBySlugController)
router.patch('/:slug', adminAuth, updateProjectController)
router.delete('/:slug', adminAuth, deleteProjectController)

export default router

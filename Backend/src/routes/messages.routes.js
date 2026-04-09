import { Router } from 'express'
import { createMessageController } from '../controllers/messages.controller.js'

const router = Router()

router.post('/', createMessageController)

export default router

import { Router } from 'express'
import { getContentSection, setContentSection } from '../services/content.service.js'
import { invalidateOwnerCache } from '../services/mailer.service.js'
import { adminAuth } from '../middlewares/adminAuth.js'

const router = Router()

router.get('/:section', async (req, res, next) => {
  try {
    const data = await getContentSection(req.params.section)
    if (data === null) return res.status(404).json({ error: 'Section inconnue' })
    res.json({ data })
  } catch (err) {
    next(err)
  }
})

router.patch('/:section', adminAuth, async (req, res, next) => {
  try {
    const updated = await setContentSection(req.params.section, req.body ?? {})
    if (updated === null) return res.status(404).json({ error: 'Section inconnue' })
    if (req.params.section === 'owner') invalidateOwnerCache()
    res.json({ data: updated })
  } catch (err) {
    next(err)
  }
})

export default router

import { Router } from 'express'
import { getDbPool } from '../config/db.js'
import { adminAuth } from '../middlewares/adminAuth.js'

const router = Router()

/* GET /api/settings/:key — public (deposit_rate lu par le front) */
router.get('/:key', async (req, res, next) => {
  try {
    const db = getDbPool()
    const [rows] = await db.query(
      'SELECT `value` FROM settings WHERE `key` = ? LIMIT 1',
      [req.params.key],
    )
    if (!rows[0]) return res.status(404).json({ error: 'Clé inconnue' })
    res.json({ key: req.params.key, value: rows[0].value })
  } catch (err) {
    next(err)
  }
})

/* PATCH /api/settings/:key — admin seulement */
router.patch('/:key', adminAuth, async (req, res, next) => {
  try {
    const { value } = req.body ?? {}
    if (value === undefined || value === null) {
      return res.status(400).json({ error: 'Champ value requis' })
    }
    const db = getDbPool()
    await db.query(
      `INSERT INTO settings (\`key\`, \`value\`) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`), updated_at = CURRENT_TIMESTAMP`,
      [req.params.key, String(value)],
    )
    res.json({ key: req.params.key, value: String(value) })
  } catch (err) {
    next(err)
  }
})

export default router

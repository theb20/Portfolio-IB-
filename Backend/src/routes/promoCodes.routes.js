import { Router } from 'express'
import { getDbPool } from '../config/db.js'
import { adminAuth } from '../middlewares/adminAuth.js'

const router = Router()

function rowToCode(row) {
  // expires_at peut être un objet Date (mysql2) ou une string — on normalise en YYYY-MM-DD
  let expiresAt = null
  if (row.expires_at) {
    const d = row.expires_at instanceof Date ? row.expires_at : new Date(row.expires_at)
    expiresAt = isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
  }
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    value: Number(row.value),
    minAmount: Number(row.min_amount),
    maxUses: row.max_uses ?? null,
    uses: row.uses,
    active: Boolean(row.active),
    expiresAt,
    createdAt: row.created_at,
  }
}

/* ── Public : valider un code (doit être AVANT /:id) ───── */

/* POST /api/promo-codes/validate — front panier */
router.post('/validate', async (req, res, next) => {
  try {
    const { code, subtotal = 0 } = req.body ?? {}
    if (!code) return res.status(400).json({ error: 'Code requis' })

    const db = getDbPool()
    const [rows] = await db.query(
      `SELECT * FROM promo_codes
       WHERE code = ? AND active = 1
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (max_uses IS NULL OR uses < max_uses)
       LIMIT 1`,
      [String(code).toUpperCase().trim()],
    )

    if (!rows[0]) return res.status(200).json({ valid: false, error: 'Code invalide ou expiré' })

    const promo = rowToCode(rows[0])
    const amount = Number(subtotal)

    if (promo.minAmount > 0 && amount < promo.minAmount) {
      return res.status(200).json({
        valid: false,
        error: `Montant minimum requis : ${promo.minAmount} €`,
      })
    }

    const discount =
      promo.type === 'percent'
        ? Math.round(amount * (promo.value / 100))
        : Math.min(Number(promo.value), amount)

    res.json({ valid: true, data: { ...promo, discount } })
  } catch (err) {
    next(err)
  }
})

/* ── Admin CRUD ─────────────────────────────────────────── */

/* GET /api/promo-codes — liste complète (admin) */
router.get('/', adminAuth, async (req, res, next) => {
  try {
    const db = getDbPool()
    const [rows] = await db.query(
      'SELECT * FROM promo_codes ORDER BY created_at DESC',
    )
    res.json({ data: rows.map(rowToCode) })
  } catch (err) {
    next(err)
  }
})

/* POST /api/promo-codes — créer un code (admin) */
router.post('/', adminAuth, async (req, res, next) => {
  try {
    const { code, type = 'percent', value, minAmount = 0, maxUses = null, active = true, expiresAt = null } = req.body ?? {}
    if (!code || value === undefined) {
      return res.status(400).json({ error: 'Champs code et value requis' })
    }
    const db = getDbPool()
    const [result] = await db.query(
      `INSERT INTO promo_codes (code, type, value, min_amount, max_uses, active, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        String(code).toUpperCase().trim(),
        type,
        Number(value),
        Number(minAmount),
        maxUses ? Number(maxUses) : null,
        active ? 1 : 0,
        expiresAt || null,
      ],
    )
    const [rows] = await db.query('SELECT * FROM promo_codes WHERE id = ? LIMIT 1', [result.insertId])
    res.status(201).json({ data: rowToCode(rows[0]) })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ce code existe déjà' })
    }
    next(err)
  }
})

/* PATCH /api/promo-codes/:id — modifier (admin) */
router.patch('/:id', adminAuth, async (req, res, next) => {
  try {
    const { code, type, value, minAmount, maxUses, active, expiresAt } = req.body ?? {}
    const db = getDbPool()

    const fields = []
    const params = []

    if (code !== undefined)      { fields.push('code = ?');       params.push(String(code).toUpperCase().trim()) }
    if (type !== undefined)      { fields.push('type = ?');       params.push(type) }
    if (value !== undefined)     { fields.push('value = ?');      params.push(Number(value)) }
    if (minAmount !== undefined) { fields.push('min_amount = ?'); params.push(Number(minAmount)) }
    if (maxUses !== undefined)   { fields.push('max_uses = ?');   params.push(maxUses ? Number(maxUses) : null) }
    if (active !== undefined)    { fields.push('active = ?');     params.push(active ? 1 : 0) }
    if (expiresAt !== undefined) { fields.push('expires_at = ?'); params.push(expiresAt || null) }

    if (!fields.length) return res.status(400).json({ error: 'Aucun champ à modifier' })

    params.push(req.params.id)
    await db.query(`UPDATE promo_codes SET ${fields.join(', ')} WHERE id = ?`, params)

    const [rows] = await db.query('SELECT * FROM promo_codes WHERE id = ? LIMIT 1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Code introuvable' })
    res.json({ data: rowToCode(rows[0]) })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ce code existe déjà' })
    }
    next(err)
  }
})

/* DELETE /api/promo-codes/:id — supprimer (admin) */
router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const db = getDbPool()
    await db.query('DELETE FROM promo_codes WHERE id = ?', [req.params.id])
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

export default router

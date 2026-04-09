import { Router } from 'express'
import jwt from 'jsonwebtoken'
import {
  listMessagesController,
  patchMessageStatusController,
  replyMessageController,
} from '../controllers/messages.controller.js'
import { adminAuth } from '../middlewares/adminAuth.js'
import { env } from '../config/env.js'
import { getDbPool } from '../config/db.js'

const router = Router()

/* ─── Cookie helpers ──────────────────────────────────────── */
function boSessionOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    path: '/',
    maxAge: 12 * 60 * 60 * 1000, // 12h
  }
}

/* ─── Routes publiques (pas de adminAuth) ─────────────────── */

// POST /admin/login  — email + mot de passe
router.post('/login', (req, res) => {
  if (!env.boJwtSecret) {
    return res.status(500).json({ error: 'BO_JWT_SECRET non configuré' })
  }
  if (!env.adminEmail || !env.adminPassword) {
    return res.status(500).json({ error: 'ADMIN_EMAIL / ADMIN_PASSWORD non configurés' })
  }

  const { email, password } = req.body ?? {}
  if (
    !email || !password ||
    email.trim() !== env.adminEmail ||
    password !== env.adminPassword
  ) {
    return res.status(401).json({ error: 'Identifiants invalides' })
  }

  const payload = { role: 'admin', email: env.adminEmail }

  // Cookie httpOnly pour les requêtes HTTP
  const sessionToken = jwt.sign(payload, env.boJwtSecret, { expiresIn: '12h' })
  res.cookie('bo_session', sessionToken, boSessionOptions())

  // Token sessionStorage pour WebSocket (même payload, durée plus courte)
  const wsToken = jwt.sign(payload, env.boJwtSecret, { expiresIn: '12h' })

  return res.json({ ok: true, wsToken })
})

// POST /admin/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('bo_session', { path: '/' })
  res.json({ ok: true })
})

/* ─── Routes protégées ────────────────────────────────────── */
router.use(adminAuth)

// GET /admin/me
router.get('/me', (req, res) => {
  const session = req.adminSession ?? { email: null, role: 'admin' }
  res.json({ data: { email: session.email, role: 'admin' } })
})

router.get('/check', (_req, res) => res.json({ ok: true }))

router.get('/stats', async (_req, res, next) => {
  try {
    const db = getDbPool()
    const [[[ordersRow], [customersRow], [productsRow], [messagesRow]]] = await Promise.all([
      db.query('SELECT COUNT(*) AS total FROM orders'),
      db.query('SELECT COUNT(*) AS total FROM customers'),
      db.query('SELECT COUNT(*) AS total FROM products'),
      db.query("SELECT COUNT(*) AS total FROM contact_messages WHERE status = 'new'"),
    ])
    const [monthlyRows] = await db.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
       FROM orders
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY month
       ORDER BY month ASC`,
    )
    res.json({
      data: {
        orders: Number(ordersRow.total),
        customers: Number(customersRow.total),
        products: Number(productsRow.total),
        newMessages: Number(messagesRow.total),
        monthly: monthlyRows.map((r) => ({ month: r.month, count: Number(r.count) })),
      },
    })
  } catch (err) {
    next(err)
  }
})

router.get('/messages', listMessagesController)
router.patch('/messages/:id/status', patchMessageStatusController)
router.post('/messages/:id/reply', replyMessageController)

router.get('/search', async (req, res, next) => {
  try {
    const q = String(req.query.q ?? '').trim().toLowerCase()
    if (!q || q.length < 2) return res.json({ data: { orders: [], products: [], messages: [] } })

    const db = getDbPool()
    const like = `%${q}%`

    const [[orderRows], [productRows], [messageRows]] = await Promise.all([
      db.query(
        `SELECT id, status, payload_json AS payloadJson, created_at AS createdAt
         FROM orders WHERE LOWER(payload_json) LIKE ? ORDER BY created_at DESC LIMIT 8`,
        [like],
      ),
      db.query(
        `SELECT id, name, brand, sku, status, price_day AS priceDay, image_url AS imageUrl
         FROM products WHERE LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(sku) LIKE ? LIMIT 8`,
        [like, like, like],
      ),
      db.query(
        `SELECT id, name, email, project, message, status, created_at AS createdAt
         FROM contact_messages WHERE LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(message) LIKE ? ORDER BY created_at DESC LIMIT 8`,
        [like, like, like],
      ),
    ])

    const parseJson = (v) => { try { return JSON.parse(v) } catch { return {} } }

    const orders = orderRows.map((r) => {
      const p = parseJson(r.payloadJson)
      return { id: String(r.id), status: r.status, createdAt: r.createdAt, customer: p.customer ?? {}, days: p.days }
    })

    res.json({ data: { orders, products: productRows, messages: messageRows } })
  } catch (err) {
    next(err)
  }
})

export default router

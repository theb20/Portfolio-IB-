import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

function parseCookies(header) {
  const out = {}
  const input = String(header ?? '')
  if (!input) return out
  for (const part of input.split(';')) {
    const idx = part.indexOf('=')
    if (idx < 0) continue
    const key = part.slice(0, idx).trim()
    const value = part.slice(idx + 1).trim()
    if (key) out[key] = decodeURIComponent(value)
  }
  return out
}

export function adminAuth(req, res, next) {
  // 1. Vérifier le cookie httpOnly bo_session (connexion via le formulaire)
  if (env.boJwtSecret) {
    const cookies = parseCookies(req.headers?.cookie)
    const token = cookies.bo_session
    if (token) {
      try {
        const payload = jwt.verify(token, env.boJwtSecret)
        if (payload?.role === 'admin') {
          req.adminSession = payload
          return next()
        }
      } catch {
        // token invalide, on continue vers la clé
      }
    }
  }

  // 2. Fallback : x-admin-key header (WebSocket + rétrocompatibilité)
  if (env.adminApiKey) {
    const candidate = req.header('x-admin-key')
    if (candidate && candidate === env.adminApiKey) {
      return next()
    }
  }

  return res.status(401).json({ error: 'Accès admin refusé' })
}

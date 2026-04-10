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
    if (!key) continue
    out[key] = decodeURIComponent(value)
  }
  return out
}

export function userAuth(req, res, next) {
  if (!env.jwtSecret) {
    return res.status(500).json({ error: 'JWT_SECRET non configurée sur le serveur' })
  }

  const cookies = parseCookies(req.headers?.cookie)
  const cookieToken = cookies.pid_session
  const authHeader = req.headers?.authorization ?? ''
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  const token = cookieToken || bearerToken

  if (!token) return res.status(401).json({ error: 'Non authentifié' })

  try {
    const payload = jwt.verify(token, env.jwtSecret)
    req.user = payload
    return next()
  } catch {
    return res.status(401).json({ error: 'Session invalide' })
  }
}

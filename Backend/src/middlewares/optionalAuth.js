import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function optionalAuth(req, _res, next) {
  if (env.jwtSecret) {
    const cookies = req.cookies ?? {}
    const token = cookies.pid_session
    console.log('[optionalAuth] cookie pid_session:', token ? 'présent' : 'absent')
    if (token) {
      try {
        req.user = jwt.verify(token, env.jwtSecret)
        console.log('[optionalAuth] user décodé:', req.user?.email)
      } catch (err) {
        console.warn('[optionalAuth] token invalide:', err?.message)
      }
    }
  } else {
    console.warn('[optionalAuth] JWT_SECRET non configuré')
  }
  next()
}

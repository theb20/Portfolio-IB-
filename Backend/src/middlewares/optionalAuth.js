import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function optionalAuth(req, _res, next) {
  if (env.jwtSecret) {
    const cookies = req.cookies ?? {}
    const cookieToken = cookies.pid_session
    const authHeader = req.headers?.authorization ?? ''
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    const token = cookieToken || bearerToken
    if (token) {
      try {
        req.user = jwt.verify(token, env.jwtSecret)
      } catch {
        // token invalide — on continue sans user
      }
    }
  }
  next()
}

import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function optionalAuth(req, _res, next) {
  if (env.jwtSecret) {
    const cookies = req.cookies ?? {}
    const token = cookies.pid_session
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

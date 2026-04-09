import { Router } from 'express'
import axios from 'axios'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

const router = Router()

function buildGoogleAuthUrl({ state }) {
  const redirectUri =
    env.google.redirectUri || `http://localhost:${env.port}/api/auth/google/callback`
  const params = new URLSearchParams({
    client_id: env.google.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
    secure: env.nodeEnv === 'production',
    path: '/',
  }
}

function isAllowedNext(url) {
  if (!url) return false
  if (env.nodeEnv === 'development') {
    return (
      url.startsWith('http://localhost:') ||
      url.startsWith('http://127.0.0.1:') ||
      url.startsWith('http://[::1]:')
    )
  }
  return url.startsWith(env.frontendUrl)
}

router.get('/google/start', (req, res) => {
  if (!env.google.clientId || !env.google.clientSecret) {
    return res.status(500).json({ error: 'Google OAuth non configuré (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)' })
  }
  if (!env.jwtSecret) {
    return res.status(500).json({ error: 'JWT_SECRET non configurée sur le serveur' })
  }

  const state = crypto.randomBytes(16).toString('hex')
  const next = typeof req.query?.next === 'string' ? req.query.next : ''

  res.cookie('oauth_state', state, { ...cookieOptions(), maxAge: 10 * 60 * 1000 })
  if (isAllowedNext(next)) {
    res.cookie('oauth_next', next, { ...cookieOptions(), maxAge: 10 * 60 * 1000 })
  }

  const url = buildGoogleAuthUrl({ state })

  // Si la requête vient d'un appel AJAX (pas d'une navigation browser),
  // retourner l'URL en JSON pour que le frontend navigue lui-même
  const acceptsJson = req.headers?.accept?.includes('application/json')
  if (acceptsJson) {
    return res.json({ url })
  }
  return res.redirect(url)
})

router.get('/google/callback', async (req, res) => {
  const code = typeof req.query?.code === 'string' ? req.query.code : ''
  const state = typeof req.query?.state === 'string' ? req.query.state : ''
  const stateCookie = req.cookies?.oauth_state
  const nextCookie = req.cookies?.oauth_next

  if (!code) return res.status(400).json({ error: 'Code manquant' })
  if (!state || !stateCookie || state !== stateCookie) return res.status(400).json({ error: 'State invalide' })

  const redirectUri =
    env.google.redirectUri || `http://localhost:${env.port}/api/auth/google/callback`

  try {
    const tokenRes = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        code,
        client_id: env.google.clientId,
        client_secret: env.google.clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    )

    const accessToken = tokenRes.data?.access_token
    if (!accessToken) return res.status(401).json({ error: 'Token Google invalide' })

    const userRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const googleUser = userRes.data ?? {}
    const sessionPayload = {
      sub: String(googleUser.sub ?? ''),
      email: googleUser.email ? String(googleUser.email) : null,
      name: googleUser.name ? String(googleUser.name) : null,
      picture: googleUser.picture ? String(googleUser.picture) : null,
      provider: 'google',
    }

    const token = jwt.sign(sessionPayload, env.jwtSecret, { expiresIn: '7d' })
    res.cookie('pid_session', token, { ...cookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 })
    res.clearCookie('oauth_state', { path: '/' })
    res.clearCookie('oauth_next', { path: '/' })

    const fallbackNext = `${env.frontendUrl.replace(/\/$/, '')}/checkout?auth=google`
    const next = typeof nextCookie === 'string' && isAllowedNext(nextCookie) ? nextCookie : fallbackNext
    return res.redirect(next)
  } catch (error) {
    return res.status(401).json({ error: 'Connexion Google échouée' })
  }
})

router.get('/me', (req, res) => {
  const token = req.cookies?.pid_session
  if (!token) return res.json({ user: null })
  if (!env.jwtSecret) return res.json({ user: null })
  try {
    const payload = jwt.verify(token, env.jwtSecret)
    return res.json({ user: payload })
  } catch {
    return res.json({ user: null })
  }
})

router.post('/logout', (_req, res) => {
  res.clearCookie('pid_session', { path: '/' })
  res.json({ ok: true })
})

export default router

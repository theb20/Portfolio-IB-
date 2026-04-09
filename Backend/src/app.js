import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import { env } from './config/env.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { notFound } from './middlewares/notFound.js'
import apiRoutes from './routes/index.js'
import stripeWebhookRouter from './routes/stripe.webhook.js'

const app = express()

const allowedOrigins = env.corsOrigin === '*' ? null : env.corsOrigin.split(',').map((s) => s.trim()).filter(Boolean)

app.use((req, _res, next) => {
  const header = String(req.headers?.cookie ?? '')
  const cookies = {}
  if (header) {
    for (const part of header.split(';')) {
      const idx = part.indexOf('=')
      if (idx < 0) continue
      const key = part.slice(0, idx).trim()
      const value = part.slice(idx + 1).trim()
      if (!key) continue
      cookies[key] = decodeURIComponent(value)
    }
  }
  req.cookies = cookies
  next()
})

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true)
      if (!allowedOrigins) return callback(null, true)

      const isAllowedExplicit = allowedOrigins.includes(origin)
      if (isAllowedExplicit) return callback(null, true)

      if (env.nodeEnv === 'development') {
        const isLocalhost =
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:') ||
          origin.startsWith('http://[::1]:')
        if (isLocalhost) return callback(null, true)
      }

      return callback(new Error(`CORS origin refusée: ${origin}`))
    },
    credentials: true,
  }),
)
app.use(morgan('dev'))

// Webhook Stripe — DOIT être monté avant express.json() (corps brut requis)
app.use('/api/stripe/webhook', stripeWebhookRouter)

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/', (_req, res) => {
  res.json({ service: 'portfolio-ib-api', docs: '/api/health' })
})
app.use('/api', apiRoutes)

app.use(notFound)
app.use(errorHandler)

export default app

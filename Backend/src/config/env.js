import dotenv from 'dotenv'

dotenv.config()

function toNumber(value, fallback) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: toNumber(process.env.PORT, 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  adminApiKey: process.env.ADMIN_API_KEY ?? '',
  adminEmail: process.env.ADMIN_EMAIL ?? '',
  adminPassword: process.env.ADMIN_PASSWORD ?? '',
  jwtSecret: process.env.JWT_SECRET ?? '',
  boJwtSecret: process.env.BO_JWT_SECRET ?? process.env.JWT_SECRET ?? '',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI ?? '',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
    successUrl: process.env.STRIPE_SUCCESS_URL ?? 'http://localhost:3000/order-success',
    cancelUrl: process.env.STRIPE_CANCEL_URL ?? 'http://localhost:3000/checkout',
  },
  smtp: {
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: toNumber(process.env.SMTP_PORT, 465),
    secure: process.env.SMTP_SECURE !== 'false',
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
  },
  ownerEmail: process.env.OWNER_EMAIL ?? '',
  ownerName: process.env.OWNER_NAME ?? 'Ibrahima Baby',
  fromEmail: process.env.FROM_EMAIL ?? '',
  fromName: process.env.FROM_NAME ?? 'IbrahimaB Location',
  mysql: {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: toNumber(process.env.DB_PORT, 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'portfolio_ib',
    connectionLimit: toNumber(process.env.DB_CONNECTION_LIMIT, 10),
  },
}

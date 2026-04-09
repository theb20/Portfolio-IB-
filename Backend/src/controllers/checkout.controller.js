import crypto from 'crypto'

export async function createCheckoutSessionController(req, res) {
  const { items, period } = req.body ?? {}
  const id = crypto.randomUUID()
  res.json({
    data: {
      id,
      provider: 'stripe',
      period: period ?? 'day',
      items: Array.isArray(items) ? items : [],
    },
  })
}

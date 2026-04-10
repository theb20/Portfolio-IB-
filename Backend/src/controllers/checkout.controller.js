import { createPaymentLinkService } from '../services/stripe.service.js'
import { listOrdersService } from '../services/orders.service.js'

export async function createCheckoutSessionController(req, res, next) {
  try {
    const { orderId } = req.body ?? {}
    if (!orderId) return res.status(400).json({ error: 'orderId requis' })

    const orders = await listOrdersService()
    const order = orders.find((o) => String(o.id) === String(orderId))
    if (!order) return res.status(404).json({ error: 'Commande introuvable' })

    const payment = await createPaymentLinkService(order)
    return res.json({ data: payment })
  } catch (err) {
    next(err)
  }
}

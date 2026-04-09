import { createOrderService, listMyOrdersService, listOrdersService, updateOrderStatusService } from '../services/orders.service.js'
import { findProductService } from '../services/products.service.js'
import { broadcastAdmin } from '../ws/socket.js'
import { sendOrderConfirmationToClient, sendNewOrderToOwner, sendStockExhaustedToOwner, sendPaymentLinkToClient } from '../services/mailer.service.js'
import { createPaymentLinkService } from '../services/stripe.service.js'
import { getDbPool } from '../config/db.js'

export async function createOrderController(req, res, next) {
  try {
    const body = req.body ?? {}
    const user = req.user ?? null
    const created = await createOrderService({
      ...body,
      customer: user
        ? {
            sub: user.sub ?? null,
            email: user.email ?? null,
            name: user.name ?? null,
            picture: user.picture ?? null,
            provider: user.provider ?? 'google',
          }
        : body.customer,
    })

    // Incrémenter uses si un code promo a été utilisé
    const promoCode = body.promoCode ?? null
    if (promoCode) {
      const db = getDbPool()
      await db.query(
        `UPDATE promo_codes SET uses = uses + 1
         WHERE code = ? AND active = 1
           AND (expires_at IS NULL OR expires_at > NOW())
           AND (max_uses IS NULL OR uses < max_uses)`,
        [String(promoCode).toUpperCase().trim()],
      ).catch(() => {}) // ne bloque pas la commande si ça échoue
    }

    broadcastAdmin('orders.new', created)
    res.status(201).json({ data: created })

    // Emails — fire and forget (ne bloquent pas la réponse)
    const items = Array.isArray(created.items) ? created.items : []
    Promise.all([
      sendOrderConfirmationToClient(created),
      sendNewOrderToOwner(created),
    ]).catch((e) => console.error('[orders] email error:', e?.message))

    // Vérifier si un produit est épuisé après cette commande
    for (const item of items) {
      if (!item?.id) continue
      findProductService(item.id)
        .then((product) => {
          if (product && (product.stockAvailable ?? 0) === 0) {
            sendStockExhaustedToOwner(product).catch(() => {})
          }
        })
        .catch(() => {})
    }
  } catch (err) {
    next(err)
  }
}

export async function listOrdersController(_req, res, next) {
  try {
    const rows = await listOrdersService()
    res.json({ data: rows })
  } catch (err) {
    next(err)
  }
}

export async function listMyOrdersController(req, res, next) {
  try {
    const userSub = req.user?.sub
    if (!userSub) return res.status(401).json({ error: 'Non authentifié' })
    const rows = await listMyOrdersService(userSub)
    res.json({ data: rows })
  } catch (err) {
    next(err)
  }
}

export async function sendPaymentLinkController(req, res, next) {
  try {
    const rows = await listOrdersService()
    const order = rows.find((r) => String(r.id) === String(req.params.id))
    if (!order) return res.status(404).json({ error: 'Commande introuvable' })
    if (!order.customer?.email) return res.status(400).json({ error: 'Le client n\'a pas d\'email' })

    const payment = await createPaymentLinkService(order)

    // Envoyer l'email au client — fire and forget
    sendPaymentLinkToClient(order, payment.url, payment.amountTotal).catch((e) =>
      console.error('[stripe] email error:', e?.message),
    )

    return res.json({
      data: {
        url: payment.url,
        sessionId: payment.sessionId,
        expiresAt: payment.expiresAt,
        amountTotal: payment.amountTotal,
        emailSentTo: order.customer.email,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function patchOrderStatusController(req, res, next) {
  try {
    const updated = await updateOrderStatusService(req.params.id, req.body?.status)
    if (!updated) return res.status(404).json({ error: 'Commande introuvable' })
    broadcastAdmin('orders.update', updated)
    res.json({ data: updated })
  } catch (err) {
    next(err)
  }
}

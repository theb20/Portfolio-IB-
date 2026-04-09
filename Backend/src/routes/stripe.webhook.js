import { Router } from 'express'
import express from 'express'
import Stripe from 'stripe'
import { env } from '../config/env.js'
import { updateOrderStatusService, listOrdersService } from '../services/orders.service.js'
import { sendInvoiceToClient } from '../services/mailer.service.js'
import { broadcastAdmin } from '../ws/socket.js'

const router = Router()

// Stripe exige le corps brut (non parsé) pour vérifier la signature
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']

  if (!env.stripe.webhookSecret) {
    console.warn('[stripe webhook] STRIPE_WEBHOOK_SECRET non configuré — webhook ignoré')
    return res.sendStatus(200)
  }

  let event
  try {
    const stripe = new Stripe(env.stripe.secretKey, { apiVersion: '2024-04-10' })
    event = stripe.webhooks.constructEvent(req.body, sig, env.stripe.webhookSecret)
  } catch (err) {
    console.error('[stripe webhook] Signature invalide:', err?.message)
    return res.status(400).send(`Webhook error: ${err?.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const orderId = session.metadata?.order_id

    if (!orderId) {
      console.warn('[stripe webhook] checkout.session.completed sans order_id')
      return res.sendStatus(200)
    }

    try {
      // Mettre la commande en "confirmed"
      const updated = await updateOrderStatusService(orderId, 'confirmed')
      if (updated) {
        broadcastAdmin('orders.update', updated)
      }

      // Récupérer la commande complète pour la facture
      const orders = await listOrdersService()
      const order = orders.find((o) => String(o.id) === String(orderId))

      if (order) {
        sendInvoiceToClient(order, session.id).catch((e) =>
          console.error('[stripe webhook] erreur envoi facture:', e?.message),
        )
      }
    } catch (err) {
      console.error('[stripe webhook] erreur traitement:', err?.message)
      // On répond 200 quand même pour éviter les re-tentatives Stripe sur des erreurs internes
    }
  }

  res.sendStatus(200)
})

export default router

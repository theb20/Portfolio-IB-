import Stripe from 'stripe'
import { env } from '../config/env.js'

function getStripe() {
  if (!env.stripe.secretKey || env.stripe.secretKey.startsWith('sk_test_XXXX')) {
    throw new Error('STRIPE_SECRET_KEY non configurée dans .env')
  }
  return new Stripe(env.stripe.secretKey, { apiVersion: '2024-04-10' })
}

/**
 * Crée une Stripe Checkout Session pour une commande et retourne l'URL de paiement.
 */
export async function createPaymentLinkService(order) {
  const stripe = getStripe()

  const items = Array.isArray(order.items) ? order.items : []
  const days = Number(order.days) || 1
  const customer = order.customer ?? {}

  if (!items.length) throw new Error('La commande ne contient aucun article')

  // Construire les line_items Stripe
  const lineItems = items.map((item) => {
    const priceDay = Number(item?.priceDay) || 0
    const priceWeek = Number(item?.priceWeek) || 0
    const qty = Number(item?.qty) || 1

    let unitPrice
    if (days >= 7 && priceWeek > 0) {
      const weeks = Math.floor(days / 7)
      const rem = days % 7
      unitPrice = Math.round((weeks * priceWeek + rem * priceDay) * 100) // centimes
    } else {
      unitPrice = Math.round(priceDay * days * 100) // centimes
    }

    return {
      price_data: {
        currency: 'eur',
        unit_amount: unitPrice,
        product_data: {
          name: `${item.name ?? item.id} (${days}j)`,
          description: `Location — ${days} jour${days > 1 ? 's' : ''}`,
        },
      },
      quantity: qty,
    }
  })

  // Ajouter le dépôt de garantie (20%)
  const subtotal = lineItems.reduce((sum, li) => sum + li.price_data.unit_amount * li.quantity, 0)
  const deposit = Math.round(subtotal * 0.2)
  lineItems.push({
    price_data: {
      currency: 'eur',
      unit_amount: deposit,
      product_data: {
        name: 'Dépôt de garantie (20%)',
        description: 'Restitué en fin de location',
      },
    },
    quantity: 1,
  })

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    customer_email: customer.email ?? undefined,
    metadata: {
      order_id: String(order.id ?? ''),
      customer_name: String(customer.name ?? ''),
      customer_email: String(customer.email ?? ''),
      days: String(days),
    },
    success_url: `${env.stripe.successUrl}?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: env.stripe.cancelUrl,
    expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // expire dans 24h
  })

  return {
    url: session.url,
    sessionId: session.id,
    expiresAt: new Date(session.expires_at * 1000).toISOString(),
    amountTotal: (session.amount_total ?? 0) / 100,
  }
}

import nodemailer from 'nodemailer'
import { env } from '../config/env.js'
import { getContentSection } from './content.service.js'

/* ─── Cache profil propriétaire (5 min) ──────────────────── */
let _ownerCache = null
let _ownerCacheAt = 0
const OWNER_TTL = 5 * 60 * 1000

async function getOwner() {
  if (_ownerCache && Date.now() - _ownerCacheAt < OWNER_TTL) return _ownerCache
  try {
    const profile = await getContentSection('owner')
    _ownerCache = profile ?? {}
    _ownerCacheAt = Date.now()
  } catch {
    _ownerCache = {}
  }
  return _ownerCache
}

/** Invalide le cache (appeler après chaque sauvegarde du profil) */
export function invalidateOwnerCache() {
  _ownerCache = null
  _ownerCacheAt = 0
}

/* ─── Transporter SMTP ───────────────────────────────────── */
let _transporter = null

function getTransporter() {
  if (_transporter) return _transporter
  if (!env.smtp.user || !env.smtp.pass) return null
  _transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  })
  return _transporter
}

async function send({ to, subject, html, text, owner }) {
  const transporter = getTransporter()
  if (!transporter) {
    console.warn('[mailer] SMTP non configuré — email ignoré:', subject)
    return
  }
  const fromName = owner?.name || env.fromName
  const fromEmail = owner?.email || env.fromEmail || env.smtp.user
  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
      text,
    })
  } catch (err) {
    console.error('[mailer] Erreur envoi email:', err?.message)
  }
}

/* ─── Helpers formatage ──────────────────────────────────── */
function formatItems(items = []) {
  return items
    .map((i) => `• ${i.name ?? i.id} × ${i.qty ?? 1} — €${(i.priceDay ?? 0) * (i.qty ?? 1)} / jour`)
    .join('\n')
}

function formatItemsHtml(items = []) {
  return items
    .map(
      (i) => `<tr>
        <td style="padding:6px 12px 6px 0;border-bottom:1px solid #f0f0f0">${i.name ?? i.id}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;text-align:center">×${i.qty ?? 1}</td>
        <td style="padding:6px 0 6px 8px;border-bottom:1px solid #f0f0f0;text-align:right">€${i.priceDay ?? 0}/j</td>
      </tr>`,
    )
    .join('')
}

function computeTotal(items = [], days = 1) {
  const subtotal = items.reduce((sum, i) => {
    const qty = Number(i?.qty) || 1
    const priceDay = Number(i?.priceDay) || 0
    const priceWeek = Number(i?.priceWeek) || 0
    if (days >= 7 && priceWeek > 0) {
      const weeks = Math.floor(days / 7)
      const rem = days % 7
      return sum + (weeks * priceWeek + rem * priceDay) * qty
    }
    return sum + priceDay * days * qty
  }, 0)
  return { subtotal, deposit: Math.round(subtotal * 0.2), total: subtotal + Math.round(subtotal * 0.2) }
}

/* ─── Template base ──────────────────────────────────────── */
function wrap(title, body, owner = {}) {
  const name = owner.name || env.fromName
  const contactEmail = owner.email || env.ownerEmail
  const phone = owner.phone || ''
  const website = owner.website || ''
  const logoUrl = owner.logoUrl || ''
  const siret = owner.siret || ''
  const year = new Date().getFullYear()

  const socials = owner.socials ?? {}
  const activeSocialLinks = Object.entries(socials)
    .filter(([, v]) => v?.trim())
    .slice(0, 3)
    .map(([k, v]) => {
      const handle = String(v).replace(/^@/, '')
      const bases = { instagram: 'https://instagram.com/', youtube: 'https://youtube.com/', tiktok: 'https://tiktok.com/@', vimeo: 'https://vimeo.com/', twitter: 'https://x.com/', linkedin: 'https://linkedin.com/in/', facebook: 'https://facebook.com/', behance: 'https://behance.net/' }
      const url = (bases[k] ?? '') + handle
      return url ? `<a href="${url}" style="color:#999;text-decoration:none">${k.charAt(0).toUpperCase() + k.slice(1)}</a>` : ''
    })
    .filter(Boolean)

  const footerLinks = [
    contactEmail ? `<a href="mailto:${contactEmail}" style="color:#999;text-decoration:none">${contactEmail}</a>` : '',
    phone ? `<span>${phone}</span>` : '',
    website ? `<a href="${website}" style="color:#999;text-decoration:none">${website.replace(/^https?:\/\//, '')}</a>` : '',
    ...activeSocialLinks,
  ].filter(Boolean).join(' · ')

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:'Helvetica Neue',Arial,sans-serif;color:#333">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06)">
        <!-- Header -->
        <tr><td style="background:#111;padding:20px 32px">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                ${logoUrl ? `<img src="${logoUrl}" alt="${name}" style="height:36px;display:block;margin-bottom:4px">` : ''}
                <p style="margin:0;color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.3px">${name}</p>
                ${siret ? `<p style="margin:2px 0 0;color:#ffffff60;font-size:11px">SIRET ${siret}</p>` : ''}
              </td>
            </tr>
          </table>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px">
          <h2 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#111">${title}</h2>
          ${body}
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f5f5f5;padding:16px 32px;font-size:12px;color:#999;text-align:center;line-height:1.8">
          ${footerLinks ? `<p style="margin:0 0 4px">${footerLinks}</p>` : ''}
          <p style="margin:0">© ${year} ${name}${siret ? ` · SIRET ${siret}` : ''}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

/* ══════════════════════════════════════════════════
   EMAIL 1 — Confirmation client (commande reçue)
══════════════════════════════════════════════════ */
export async function sendOrderConfirmationToClient(order) {
  const customer = order.customer ?? {}
  const email = customer.email
  if (!email) return

  const owner = await getOwner()
  const items = Array.isArray(order.items) ? order.items : []
  const days = Number(order.days) || 1
  const totals = computeTotal(items, days)
  const contactEmail = owner.email || env.ownerEmail

  const html = wrap(
    `Commande #${order.id} reçue ✓`,
    `<p style="margin:0 0 8px;color:#555">Bonjour <strong>${customer.name ?? 'cher client'}</strong>,</p>
    <p style="margin:0 0 24px;color:#555;line-height:1.6">
      Votre demande de location a bien été reçue. ${owner.name || 'Ibrahima'} vous contactera sous 24h pour confirmer les modalités de remise du matériel.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr>
        <th style="text-align:left;padding:8px 12px 8px 0;border-bottom:2px solid #111;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:.05em">Article</th>
        <th style="text-align:center;padding:8px;border-bottom:2px solid #111;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:.05em">Qté</th>
        <th style="text-align:right;padding:8px 0;border-bottom:2px solid #111;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:.05em">Prix</th>
      </tr>
      ${formatItemsHtml(items)}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr><td style="padding:4px 0;color:#777">Durée</td><td style="text-align:right;padding:4px 0">${days} jour${days > 1 ? 's' : ''}</td></tr>
      <tr><td style="padding:4px 0;color:#777">Sous-total</td><td style="text-align:right;padding:4px 0">€${totals.subtotal}</td></tr>
      <tr><td style="padding:4px 0;color:#777">Dépôt (20%)</td><td style="text-align:right;padding:4px 0">€${totals.deposit}</td></tr>
      <tr><td style="padding:8px 0 0;font-weight:700;font-size:16px;border-top:2px solid #111">Total</td><td style="text-align:right;padding:8px 0 0;font-weight:700;font-size:16px;border-top:2px solid #111">€${totals.total}</td></tr>
    </table>
    <p style="margin:0;color:#999;font-size:13px;line-height:1.6">
      Des questions ? Répondez directement à cet email ou contactez ${owner.name || 'Ibrahima'} sur <a href="mailto:${contactEmail}" style="color:#111">${contactEmail}</a>
    </p>`,
    owner,
  )

  await send({
    to: email,
    subject: `Commande #${order.id} reçue — ${owner.name || env.fromName}`,
    html,
    text: `Commande #${order.id} reçue\n\nBonjour ${customer.name ?? ''},\n\nVotre demande de location a bien été enregistrée.\n\nArticles:\n${formatItems(items)}\n\nDurée: ${days} jour(s)\nTotal: €${totals.total}\n\n${owner.name || 'Ibrahima'} vous contactera sous 24h.`,
    owner,
  })
}

/* ══════════════════════════════════════════════════
   EMAIL 2 — Nouvelle commande → propriétaire
══════════════════════════════════════════════════ */
export async function sendNewOrderToOwner(order) {
  const owner = await getOwner()
  const ownerEmail = owner.email || env.ownerEmail
  if (!ownerEmail) return

  const customer = order.customer ?? {}
  const items = Array.isArray(order.items) ? order.items : []
  const days = Number(order.days) || 1
  const totals = computeTotal(items, days)

  const html = wrap(
    `🛒 Nouvelle commande #${order.id}`,
    `<p style="margin:0 0 24px;color:#555">Une nouvelle demande de location vient d'être passée.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;background:#f9f9f9;border-radius:8px">
      <tr><td style="padding:16px">
        <p style="margin:0 0 6px;font-weight:700;font-size:15px">${customer.name ?? '—'}</p>
        <p style="margin:0 0 4px;color:#666;font-size:13px">${customer.email ?? '—'}</p>
        <p style="margin:0;color:#999;font-size:12px">Via ${customer.provider ?? 'Google'}</p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr>
        <th style="text-align:left;padding:8px 12px 8px 0;border-bottom:2px solid #111;font-size:12px;color:#999;text-transform:uppercase">Article</th>
        <th style="text-align:center;padding:8px;border-bottom:2px solid #111;font-size:12px;color:#999;text-transform:uppercase">Qté</th>
        <th style="text-align:right;padding:8px 0;border-bottom:2px solid #111;font-size:12px;color:#999;text-transform:uppercase">Prix/j</th>
      </tr>
      ${formatItemsHtml(items)}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr><td style="padding:4px 0;color:#777">Durée</td><td style="text-align:right;padding:4px 0">${days} jour${days > 1 ? 's' : ''}</td></tr>
      <tr><td style="padding:4px 0;color:#777">Sous-total</td><td style="text-align:right;padding:4px 0">€${totals.subtotal}</td></tr>
      <tr><td style="padding:4px 0;color:#777">Dépôt</td><td style="text-align:right;padding:4px 0">€${totals.deposit}</td></tr>
      <tr><td style="padding:8px 0 0;font-weight:700;font-size:16px;border-top:2px solid #111">Total</td><td style="text-align:right;padding:8px 0 0;font-weight:700;font-size:16px;border-top:2px solid #111">€${totals.total}</td></tr>
    </table>
    <a href="mailto:${customer.email}" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
      Répondre au client
    </a>`,
    owner,
  )

  await send({
    to: ownerEmail,
    subject: `🛒 Nouvelle commande #${order.id} — ${customer.name ?? 'Client'} — €${totals.total}`,
    html,
    text: `Nouvelle commande #${order.id}\nClient: ${customer.name} (${customer.email})\nDurée: ${days}j\nArticles:\n${formatItems(items)}\nTotal: €${totals.total}`,
    owner,
  })
}

/* ══════════════════════════════════════════════════
   EMAIL 3a — Réponse au contact → visiteur
══════════════════════════════════════════════════ */
export async function sendReplyToContact(msg, replyText) {
  const email = msg.email
  if (!email || !replyText?.trim()) return

  const owner = await getOwner()
  const contactEmail = owner.email || env.ownerEmail
  const signature = owner.signature || ''

  const html = wrap(
    `Réponse à votre message`,
    `<p style="margin:0 0 8px;color:#555">Bonjour <strong>${msg.name ?? 'cher visiteur'}</strong>,</p>
    <p style="margin:0 0 24px;color:#555;line-height:1.6">Merci pour votre message. Voici ma réponse :</p>

    <div style="background:#fff;border-left:3px solid #111;padding:16px 20px;margin-bottom:24px;border-radius:0 8px 8px 0">
      <p style="margin:0;font-size:14px;line-height:1.8;color:#333;white-space:pre-wrap">${String(replyText).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
    </div>

    ${signature ? `<p style="margin:0 0 16px;font-size:13px;color:#555;white-space:pre-wrap">${String(signature).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : ''}

    ${msg.message ? `
    <div style="background:#f9f9f9;border-radius:8px;padding:14px 16px;margin-bottom:20px">
      <p style="margin:0 0 6px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.05em">Votre message initial</p>
      <p style="margin:0;font-size:13px;color:#777;line-height:1.6;white-space:pre-wrap">${String(msg.message).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
    </div>` : ''}

    <p style="margin:0;color:#999;font-size:12px;line-height:1.6">
      Pour répondre, écrivez directement à <a href="mailto:${contactEmail}" style="color:#111">${contactEmail}</a>
    </p>`,
    owner,
  )

  await send({
    to: email,
    subject: `Réponse à votre message — ${owner.name || env.fromName}`,
    html,
    text: `Bonjour ${msg.name ?? ''},\n\n${replyText}\n\n${signature ? signature + '\n\n' : ''}---\nVotre message initial :\n${msg.message ?? ''}\n\n${owner.name || env.fromName} — ${contactEmail}`,
    owner,
  })
}

/* ══════════════════════════════════════════════════
   EMAIL 3b — Message contact → propriétaire
══════════════════════════════════════════════════ */
export async function sendContactMessageToOwner(msg) {
  const owner = await getOwner()
  const ownerEmail = owner.email || env.ownerEmail
  if (!ownerEmail) return

  const html = wrap(
    `✉️ Nouveau message de ${msg.name ?? 'Visiteur'}`,
    `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;background:#f9f9f9;border-radius:8px">
      <tr><td style="padding:16px">
        <p style="margin:0 0 6px;font-weight:700;font-size:15px">${msg.name ?? '—'}</p>
        <p style="margin:0 0 4px"><a href="mailto:${msg.email}" style="color:#111">${msg.email ?? '—'}</a></p>
        ${msg.project ? `<p style="margin:4px 0 0;color:#888;font-size:13px">Projet : ${msg.project}</p>` : ''}
      </td></tr>
    </table>
    <div style="background:#fff;border:1px solid #eee;border-radius:8px;padding:20px;white-space:pre-wrap;font-size:14px;line-height:1.7;color:#333">
      ${String(msg.message ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
    </div>
    <div style="margin-top:20px">
      <a href="mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.project ?? 'Votre message')}" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
        Répondre
      </a>
    </div>`,
    owner,
  )

  await send({
    to: ownerEmail,
    subject: `✉️ ${msg.name ?? 'Nouveau message'}${msg.project ? ` — ${msg.project}` : ''} — ${owner.website || 'ibrahimab.fr'}`,
    html,
    text: `Nouveau message de ${msg.name} (${msg.email})\n\n${msg.message}`,
    owner,
  })
}

/* ══════════════════════════════════════════════════
   EMAIL 4 — Stock épuisé → propriétaire
══════════════════════════════════════════════════ */
export async function sendStockExhaustedToOwner(product) {
  const owner = await getOwner()
  const ownerEmail = owner.email || env.ownerEmail
  if (!ownerEmail) return

  const html = wrap(
    `⚠️ Stock épuisé : ${product.name}`,
    `<p style="margin:0 0 16px;color:#555">Le stock de ce produit est maintenant à zéro — toutes les unités sont en location.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;background:#fff3cd;border:1px solid #ffc107;border-radius:8px">
      <tr><td style="padding:16px">
        <p style="margin:0 0 4px;font-weight:700;font-size:16px">${product.name}</p>
        ${product.brand ? `<p style="margin:0 0 4px;color:#666;font-size:13px">${product.brand}${product.sku ? ` · ${product.sku}` : ''}</p>` : ''}
        <p style="margin:8px 0 0;font-size:13px;color:#856404">Stock total : ${product.stock} — Disponible : 0</p>
      </td></tr>
    </table>
    <p style="margin:0;color:#777;font-size:13px">Tu peux modifier le stock ou le statut du produit depuis le backoffice.</p>`,
    owner,
  )

  await send({
    to: ownerEmail,
    subject: `⚠️ Stock épuisé : ${product.name}`,
    html,
    text: `Stock épuisé : ${product.name}\nToutes les unités sont en location (stock: ${product.stock}).`,
    owner,
  })
}

/* ══════════════════════════════════════════════════
   EMAIL 5 — Facture après paiement Stripe → client
══════════════════════════════════════════════════ */
export async function sendInvoiceToClient(order, sessionId) {
  const customer = order.customer ?? {}
  const email = customer.email
  if (!email) return

  const owner = await getOwner()
  const items = Array.isArray(order.items) ? order.items : []
  const days = Number(order.days) || 1
  const totals = computeTotal(items, days)
  const invoiceDate = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  const contactEmail = owner.email || env.ownerEmail

  const ownerBlock = [
    owner.name,
    owner.siret ? `SIRET : ${owner.siret}` : '',
    owner.location,
    owner.phone,
    contactEmail,
  ].filter(Boolean).join(' · ')

  const html = wrap(
    `Facture #${order.id}`,
    `<!-- En-tête légal prestataire / client -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
      <tr>
        <td style="vertical-align:top;padding-right:16px">
          <p style="margin:0 0 2px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.05em">Prestataire</p>
          <p style="margin:0;font-weight:700;font-size:14px;color:#111">${owner.name || env.fromName}</p>
          ${owner.siret ? `<p style="margin:2px 0 0;font-size:12px;color:#777">SIRET : ${owner.siret}</p>` : ''}
          ${owner.location ? `<p style="margin:2px 0 0;font-size:12px;color:#777">${owner.location}</p>` : ''}
          ${owner.phone ? `<p style="margin:2px 0 0;font-size:12px;color:#777">${owner.phone}</p>` : ''}
          ${contactEmail ? `<p style="margin:2px 0 0;font-size:12px;color:#777">${contactEmail}</p>` : ''}
        </td>
        <td style="vertical-align:top;text-align:right">
          <p style="margin:0 0 2px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.05em">Facturé à</p>
          <p style="margin:0;font-weight:700;font-size:14px;color:#111">${customer.name ?? '—'}</p>
          <p style="margin:2px 0 0;font-size:12px;color:#777">${customer.email ?? ''}</p>
          <p style="margin:14px 0 2px;font-size:11px;color:#999">Date</p>
          <p style="margin:0 0 8px;font-size:13px;color:#111">${invoiceDate}</p>
          <span style="display:inline-block;background:#dcfce7;color:#15803d;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase">✓ Payée</span>
        </td>
      </tr>
    </table>

    <div style="height:1px;background:#e5e5e5;margin-bottom:24px"></div>

    <!-- Lignes articles -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr>
        <th style="text-align:left;padding:8px 12px 8px 0;border-bottom:2px solid #111;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.05em">Article</th>
        <th style="text-align:center;padding:8px;border-bottom:2px solid #111;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.05em">Qté</th>
        <th style="text-align:right;padding:8px 0;border-bottom:2px solid #111;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.05em">P.U.</th>
        <th style="text-align:right;padding:8px 0 8px 8px;border-bottom:2px solid #111;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.05em">Total</th>
      </tr>
      ${items.map((i) => {
        const qty = Number(i?.qty) || 1
        const priceDay = Number(i?.priceDay) || 0
        const priceWeek = Number(i?.priceWeek) || 0
        let unitPrice
        if (days >= 7 && priceWeek > 0) {
          const weeks = Math.floor(days / 7)
          const rem = days % 7
          unitPrice = weeks * priceWeek + rem * priceDay
        } else {
          unitPrice = priceDay * days
        }
        return `<tr>
          <td style="padding:10px 12px 10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333">
            ${i.name ?? i.id}
            <span style="display:block;font-size:11px;color:#999;margin-top:2px">Location ${days} jour${days > 1 ? 's' : ''}</span>
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;text-align:center;color:#555;font-size:13px">×${qty}</td>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;color:#555;font-size:13px">€${unitPrice}</td>
          <td style="padding:10px 0 10px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;font-size:13px;color:#111">€${unitPrice * qty}</td>
        </tr>`
      }).join('')}
      <tr>
        <td colspan="3" style="padding:10px 12px 10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#555">Dépôt de garantie (20%)</td>
        <td style="padding:10px 0 10px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:13px;color:#555">€${totals.deposit}</td>
      </tr>
    </table>

    <!-- Totaux -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
      <tr>
        <td width="55%"></td>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:4px 0;color:#777;font-size:13px">Sous-total location</td><td style="text-align:right;font-size:13px">€${totals.subtotal}</td></tr>
            <tr><td style="padding:4px 0;color:#777;font-size:13px">Dépôt (remboursable)</td><td style="text-align:right;font-size:13px">€${totals.deposit}</td></tr>
            <tr>
              <td style="padding:10px 0 4px;font-weight:700;font-size:16px;border-top:2px solid #111;color:#111">Total réglé</td>
              <td style="text-align:right;padding:10px 0 4px;font-weight:700;font-size:16px;border-top:2px solid #111;color:#111">€${totals.total}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Référence paiement -->
    <div style="background:#f9f9f9;border-radius:8px;padding:12px 16px;margin-bottom:20px">
      <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.05em">Référence paiement Stripe</p>
      <p style="margin:0;font-family:monospace;font-size:11px;color:#555;word-break:break-all">${sessionId ?? '—'}</p>
    </div>

    <!-- Instructions retrait -->
    <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:10px;padding:18px 20px;margin-bottom:20px">
      <p style="margin:0 0 8px;font-weight:700;font-size:13px;color:#1e40af">📦 Comment récupérer votre matériel</p>
      <p style="margin:0 0 6px;font-size:13px;color:#1e3a8a;line-height:1.7">Présentez-vous avec :</p>
      <ul style="margin:0 0 10px;padding-left:18px;font-size:13px;color:#1e3a8a;line-height:1.9">
        <li>Cette facture (imprimée ou sur votre téléphone)</li>
        <li>Une pièce d'identité valide</li>
      </ul>
      <div style="background:#dbeafe;border-radius:6px;padding:8px 12px">
        <p style="margin:0;font-size:12px;color:#1e40af;line-height:1.6">
          ⚠️ <strong>Bon de retrait valable 3 mois</strong> à compter de la date de prise en charge.
          Passé ce délai, la réservation sera annulée.
        </p>
      </div>
    </div>

    ${owner.signature ? `<p style="margin:0 0 12px;font-size:13px;color:#555;white-space:pre-wrap">${String(owner.signature).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : ''}

    <p style="margin:0;color:#999;font-size:12px;line-height:1.6">
      Des questions ? <a href="mailto:${contactEmail}" style="color:#111">${contactEmail}</a>${owner.phone ? ` · ${owner.phone}` : ''}
    </p>`,
    owner,
  )

  await send({
    to: email,
    subject: `Facture #${order.id} — Paiement reçu — ${owner.name || env.fromName}`,
    html,
    text: `Facture #${order.id} — PAYÉE\n\n${ownerBlock}\n\nBonjour ${customer.name ?? ''},\n\nVotre paiement a bien été reçu.\n\nArticles:\n${formatItems(items)}\nDurée: ${days} jour(s)\nSous-total: €${totals.subtotal}\nDépôt: €${totals.deposit}\nTotal: €${totals.total}\n\nRéf. Stripe: ${sessionId ?? '—'}\n\nBon de retrait valable 3 mois. Présentez cette facture + pièce d'identité en magasin.\n\nMerci !`,
    owner,
  })
}

/* ══════════════════════════════════════════════════
   EMAIL 6 — Lien de paiement Stripe → client
══════════════════════════════════════════════════ */
export async function sendPaymentLinkToClient(order, paymentUrl, amountTotal) {
  const customer = order.customer ?? {}
  const email = customer.email
  if (!email) return

  const owner = await getOwner()

  const html = wrap(
    `💳 Votre lien de paiement — Commande #${order.id}`,
    `<p style="margin:0 0 8px;color:#555">Bonjour <strong>${customer.name ?? 'cher client'}</strong>,</p>
    <p style="margin:0 0 24px;color:#555;line-height:1.6">
      Votre commande a été confirmée. Cliquez sur le bouton ci-dessous pour procéder au paiement sécurisé via Stripe.
    </p>

    <div style="background:#f9f9f9;border-radius:10px;padding:20px;margin-bottom:24px;text-align:center">
      <p style="margin:0 0 4px;font-size:13px;color:#999">Montant total à régler</p>
      <p style="margin:0;font-size:32px;font-weight:700;color:#111">€${amountTotal}</p>
    </div>

    <div style="text-align:center;margin-bottom:24px">
      <a href="${paymentUrl}" style="display:inline-block;background:#635bff;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:-0.2px">
        Payer maintenant →
      </a>
    </div>

    <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:14px;margin-bottom:20px">
      <p style="margin:0;font-size:12px;color:#856404">
        ⚠️ Ce lien est valable <strong>24 heures</strong>. Passé ce délai, contactez ${owner.name || 'Ibrahima'} pour un nouveau lien.
      </p>
    </div>

    <p style="margin:0;color:#999;font-size:12px;line-height:1.6">
      Ou copiez ce lien dans votre navigateur :<br>
      <span style="word-break:break-all;color:#635bff">${paymentUrl}</span>
    </p>`,
    owner,
  )

  await send({
    to: email,
    subject: `💳 Lien de paiement — Commande #${order.id} — €${amountTotal}`,
    html,
    text: `Lien de paiement pour votre commande #${order.id}\n\nMontant: €${amountTotal}\n\nPayez ici: ${paymentUrl}\n\nLien valable 24h.`,
    owner,
  })
}

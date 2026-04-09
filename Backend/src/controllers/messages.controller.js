import {
  getMessages,
  setMessageStatus,
  submitMessage,
} from '../services/messages.service.js'
import { broadcastAdmin } from '../ws/socket.js'
import { sendContactMessageToOwner, sendReplyToContact } from '../services/mailer.service.js'

export async function createMessageController(req, res, next) {
  try {
    const { name, email, project, message } = req.body
    const created = await submitMessage({ name, email, project, message })
    broadcastAdmin('messages.new', created)

    // Email notification — fire and forget
    sendContactMessageToOwner({ name, email, project, message }).catch((e) =>
      console.error('[messages] email error:', e?.message),
    )

    return res.status(201).json({ data: created })
  } catch (error) {
    next(error)
  }
}

export async function listMessagesController(_req, res, next) {
  try {
    const rows = await getMessages()
    res.json({ data: rows })
  } catch (error) {
    next(error)
  }
}

export async function replyMessageController(req, res, next) {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'id invalide' })
    }
    const replyText = req.body?.replyText?.trim()
    if (!replyText) return res.status(400).json({ error: 'replyText requis' })

    // Récupérer le message pour avoir l'email/nom du contact
    const rows = await getMessages()
    const msg = rows.find((r) => Number(r.id) === id)
    if (!msg) return res.status(404).json({ error: 'Message introuvable' })
    if (!msg.email) return res.status(400).json({ error: 'Ce message n\'a pas d\'email' })

    // Envoyer la réponse — fire and forget
    sendReplyToContact(msg, replyText).catch((e) =>
      console.error('[messages] reply email error:', e?.message),
    )

    // Marquer comme lu automatiquement
    await setMessageStatus(id, 'read')
    broadcastAdmin('messages.update', { id, status: 'read' })

    return res.json({ ok: true })
  } catch (error) {
    next(error)
  }
}

export async function patchMessageStatusController(req, res, next) {
  try {
    const id = Number(req.params.id)
    const { status } = req.body
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'id invalide' })
    }
    if (!['new', 'read', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'status invalide' })
    }
    const updated = await setMessageStatus(id, status)
    if (!updated) return res.status(404).json({ error: 'Message introuvable' })
    broadcastAdmin('messages.update', { id, status })
    return res.json({ data: { id, status } })
  } catch (error) {
    next(error)
  }
}

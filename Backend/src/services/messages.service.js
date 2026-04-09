import {
  normalizeMessageInput,
  normalizeMessageRow,
} from '../models/message.model.js'
import {
  createMessage,
  findAllMessages,
  updateMessageStatus,
} from '../repositories/messages.repository.js'
import { createHttpError } from '../utils/httpError.js'

export async function submitMessage(payload) {
  const input = normalizeMessageInput(payload)
  const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)
  if (!input.name || !input.email || !input.message) {
    throw createHttpError(400, 'name, email et message sont requis')
  }
  if (!hasValidEmail) {
    throw createHttpError(400, 'email invalide')
  }
  const id = await createMessage(input)
  return { id, ...input, status: 'new' }
}

export async function getMessages() {
  const rows = await findAllMessages()
  return rows.map(normalizeMessageRow)
}

export async function setMessageStatus(id, status) {
  return updateMessageStatus(id, status)
}

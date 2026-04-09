import { getDbPool } from '../config/db.js'

export async function createMessage(input) {
  const db = getDbPool()
  const [result] = await db.query(
    `INSERT INTO contact_messages (name, email, project, message, status)
     VALUES (?, ?, ?, ?, 'new')`,
    [input.name, input.email, input.project ?? null, input.message],
  )
  return result.insertId
}

export async function findAllMessages() {
  const db = getDbPool()
  const [rows] = await db.query(
    `SELECT id, name, email, project, message, status, created_at AS createdAt
     FROM contact_messages
     ORDER BY created_at DESC, id DESC`,
  )
  return rows
}

export async function updateMessageStatus(id, status) {
  const db = getDbPool()
  const [result] = await db.query(
    `UPDATE contact_messages
     SET status = ?
     WHERE id = ?`,
    [status, id],
  )
  return result.affectedRows > 0
}

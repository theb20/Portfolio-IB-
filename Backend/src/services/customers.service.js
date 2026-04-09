import { getDbPool } from '../config/db.js'

export async function listCustomersService() {
  const db = getDbPool()
  const [rows] = await db.query(
    `SELECT id, name, email, phone, company, created_at AS createdAt
     FROM customers
     ORDER BY created_at DESC, id DESC`,
  )
  return rows.map((r) => ({
    id: String(r.id),
    name: String(r.name ?? ''),
    email: r.email ?? '',
    phone: r.phone ?? '',
    company: r.company ?? '',
    createdAt: r.createdAt ?? undefined,
  }))
}

export async function createCustomerService(payload) {
  const db = getDbPool()
  const input = {
    name: String(payload?.name ?? 'Client'),
    email: payload?.email != null ? String(payload.email) : '',
    phone: payload?.phone != null ? String(payload.phone) : '',
    company: payload?.company != null ? String(payload.company) : '',
    documentsJson: JSON.stringify(payload?.documents ?? []),
  }

  const [result] = await db.query(
    `INSERT INTO customers (name, email, phone, company, documents_json)
     VALUES (?, ?, ?, ?, ?)`,
    [input.name, input.email || null, input.phone || null, input.company || null, input.documentsJson],
  )

  return {
    id: String(result.insertId),
    name: input.name,
    email: input.email,
    phone: input.phone,
    company: input.company,
    createdAt: new Date().toISOString(),
  }
}

export async function updateCustomerService(id, payload) {
  const db = getDbPool()
  const [existingRows] = await db.query(
    `SELECT id, name, email, phone, company, documents_json AS documentsJson, created_at AS createdAt
     FROM customers
     WHERE id = ?
     LIMIT 1`,
    [id],
  )
  const existing = existingRows[0]
  if (!existing) return null

  const next = {
    name: payload?.name != null ? String(payload.name) : String(existing.name ?? ''),
    email: payload?.email != null ? String(payload.email) : String(existing.email ?? ''),
    phone: payload?.phone != null ? String(payload.phone) : String(existing.phone ?? ''),
    company: payload?.company != null ? String(payload.company) : String(existing.company ?? ''),
    documentsJson:
      payload?.documents != null ? JSON.stringify(payload.documents ?? []) : JSON.stringify(existing.documentsJson ?? []),
  }

  await db.query(
    `UPDATE customers
     SET name = ?, email = ?, phone = ?, company = ?, documents_json = ?
     WHERE id = ?`,
    [next.name, next.email || null, next.phone || null, next.company || null, next.documentsJson, id],
  )

  return {
    id: String(existing.id),
    name: next.name,
    email: next.email,
    phone: next.phone,
    company: next.company,
    createdAt: existing.createdAt ?? undefined,
  }
}

export async function deleteCustomerService(id) {
  const db = getDbPool()
  const [result] = await db.query(`DELETE FROM customers WHERE id = ?`, [id])
  return result.affectedRows > 0
}

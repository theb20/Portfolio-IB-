import { getDbPool } from '../config/db.js'

function toSqlDate(value) {
  if (!value) return null
  const d = new Date(String(value))
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

export async function listAvailabilityService() {
  const db = getDbPool()
  const [rows] = await db.query(
    `SELECT id, product_id AS productId, start_date AS startDate, end_date AS endDate, note, created_at AS createdAt
     FROM availability_blocks
     ORDER BY created_at DESC, id DESC`,
  )
  return rows.map((r) => ({
    id: String(r.id),
    productId: String(r.productId ?? ''),
    startDate: r.startDate ?? '',
    endDate: r.endDate ?? '',
    note: r.note ?? '',
    createdAt: r.createdAt ?? undefined,
  }))
}

export async function createAvailabilityService(payload) {
  const db = getDbPool()
  const input = {
    productId: String(payload?.productId ?? ''),
    startDate: toSqlDate(payload?.startDate),
    endDate: toSqlDate(payload?.endDate),
    note: payload?.note != null ? String(payload.note) : '',
  }

  const [result] = await db.query(
    `INSERT INTO availability_blocks (product_id, start_date, end_date, note)
     VALUES (?, ?, ?, ?)`,
    [input.productId, input.startDate, input.endDate, input.note || null],
  )

  return {
    id: String(result.insertId),
    productId: input.productId,
    startDate: input.startDate ?? '',
    endDate: input.endDate ?? '',
    note: input.note,
    createdAt: new Date().toISOString(),
  }
}

export async function deleteAvailabilityService(id) {
  const db = getDbPool()
  const [result] = await db.query(`DELETE FROM availability_blocks WHERE id = ?`, [id])
  return result.affectedRows > 0
}

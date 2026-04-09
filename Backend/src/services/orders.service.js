import { getDbPool } from '../config/db.js'

function parseJson(value) {
  if (value == null) return null
  if (typeof value === 'object') return value
  try {
    return JSON.parse(String(value))
  } catch {
    return null
  }
}

export async function createOrderService(payload) {
  const db = getDbPool()
  const payloadJson = JSON.stringify(payload ?? {})
  const [result] = await db.query(
    `INSERT INTO orders (status, payload_json)
     VALUES ('pending', ?)`,
    [payloadJson],
  )

  return {
    ...(payload ?? {}),
    id: String(result.insertId),
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
}

export async function listOrdersService() {
  const db = getDbPool()
  const [rows] = await db.query(
    `SELECT id, status, payload_json AS payloadJson, created_at AS createdAt
     FROM orders
     ORDER BY created_at DESC, id DESC`,
  )
  return rows.map((r) => {
    const payload = parseJson(r.payloadJson) ?? {}
    return {
      ...payload,
      id: String(r.id),
      status: String(r.status ?? 'pending'),
      createdAt: r.createdAt ?? undefined,
    }
  })
}

export async function listMyOrdersService(userSub) {
  const db = getDbPool()
  const [rows] = await db.query(
    `SELECT id, status, payload_json AS payloadJson, created_at AS createdAt
     FROM orders
     ORDER BY created_at DESC, id DESC`,
  )
  return rows
    .map((r) => {
      const payload = parseJson(r.payloadJson) ?? {}
      return {
        ...payload,
        id: String(r.id),
        status: String(r.status ?? 'pending'),
        createdAt: r.createdAt ?? undefined,
      }
    })
    .filter((r) => r.customer?.sub === userSub)
}

export async function updateOrderStatusService(id, status) {
  const db = getDbPool()
  const [result] = await db.query(`UPDATE orders SET status = ? WHERE id = ?`, [
    String(status ?? 'pending'),
    id,
  ])
  if (result.affectedRows <= 0) return null

  const [rows] = await db.query(
    `SELECT id, status, payload_json AS payloadJson, created_at AS createdAt
     FROM orders
     WHERE id = ?
     LIMIT 1`,
    [id],
  )
  const row = rows[0]
  if (!row) return null
  const payload = parseJson(row.payloadJson) ?? {}
  return {
    ...payload,
    id: String(row.id),
    status: String(row.status ?? 'pending'),
    createdAt: row.createdAt ?? undefined,
  }
}

import crypto from 'node:crypto'
import { getDbPool } from '../config/db.js'

function toNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function parseJson(value) {
  if (value == null) return null
  if (typeof value === 'object') return value
  try { return JSON.parse(String(value)) } catch { return null }
}

function mapProductRow(row) {
  if (!row) return null
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    category: String(row.category ?? ''),
    brand: row.brand ? String(row.brand) : null,
    sku: row.sku ? String(row.sku) : null,
    description: row.description ? String(row.description) : null,
    imageUrl: row.imageUrl ?? row.image_url ?? null,
    specs: parseJson(row.specsJson ?? row.specs_json) ?? {},
    priceDay: toNumber(row.priceDay ?? row.price_day, 0),
    priceWeek: toNumber(row.priceWeek ?? row.price_week, 0),
    deposit: toNumber(row.deposit, 0),
    replacementValue: toNumber(row.replacementValue ?? row.replacement_value, 0),
    stock: toNumber(row.stock, 1),
    stockAvailable: toNumber(row.stockAvailable ?? row.stock, 1),
    status: String(row.status ?? 'active'),
    createdAt: row.createdAt ?? row.created_at ?? undefined,
    updatedAt: row.updatedAt ?? row.updated_at ?? undefined,
  }
}

// Compute how many units of each product are currently "out" (confirmed/in_progress orders)
async function computeRentedStock(db) {
  try {
    const [rows] = await db.query(
      `SELECT payload_json AS payloadJson FROM orders WHERE status IN ('confirmed','in_progress')`,
    )
    const rented = {}
    for (const row of rows) {
      const payload = parseJson(row.payloadJson) ?? {}
      const items = Array.isArray(payload.items) ? payload.items : []
      for (const item of items) {
        const id = String(item?.id ?? '')
        const qty = toNumber(item?.qty, 1)
        if (!id) continue
        rented[id] = (rented[id] ?? 0) + qty
      }
    }
    return rented
  } catch {
    return {}
  }
}

const SELECT_COLS = `
  id, name, category, brand, sku, description,
  image_url AS imageUrl,
  specs_json AS specsJson,
  price_day AS priceDay, price_week AS priceWeek,
  deposit, replacement_value AS replacementValue,
  stock, status,
  created_at AS createdAt, updated_at AS updatedAt
`

export async function listProductsService() {
  const db = getDbPool()
  const [rows] = await db.query(
    `SELECT ${SELECT_COLS} FROM products ORDER BY created_at DESC, id ASC`,
  )
  const rented = await computeRentedStock(db)
  return rows.map((r) => {
    const product = mapProductRow(r)
    product.stockAvailable = Math.max(0, product.stock - (rented[product.id] ?? 0))
    return product
  })
}

export async function findProductService(id) {
  const db = getDbPool()
  const [rows] = await db.query(
    `SELECT ${SELECT_COLS} FROM products WHERE id = ? LIMIT 1`,
    [id],
  )
  if (!rows[0]) return null
  const product = mapProductRow(rows[0])
  const rented = await computeRentedStock(db)
  product.stockAvailable = Math.max(0, product.stock - (rented[product.id] ?? 0))
  return product
}

export async function createProductService(payload) {
  const db = getDbPool()
  const id = String(payload?.id ?? crypto.randomUUID())
  const item = {
    id,
    name: String(payload?.name ?? 'Sans nom'),
    category: String(payload?.category ?? 'cameras'),
    brand: payload?.brand ? String(payload.brand) : null,
    sku: payload?.sku ? String(payload.sku) : null,
    description: payload?.description ? String(payload.description) : null,
    imageUrl: payload?.imageUrl ? String(payload.imageUrl) : null,
    specsJson: payload?.specs ? JSON.stringify(payload.specs) : null,
    priceDay: toNumber(payload?.priceDay, 0),
    priceWeek: toNumber(payload?.priceWeek, 0),
    deposit: toNumber(payload?.deposit, 0),
    replacementValue: toNumber(payload?.replacementValue, 0),
    stock: toNumber(payload?.stock, 1),
    status: ['active', 'inactive', 'maintenance'].includes(payload?.status) ? payload.status : 'active',
  }

  await db.query(
    `INSERT INTO products
       (id, name, category, brand, sku, description, image_url, specs_json,
        price_day, price_week, deposit, replacement_value, stock, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.id, item.name, item.category, item.brand, item.sku,
      item.description, item.imageUrl, item.specsJson,
      item.priceDay, item.priceWeek, item.deposit, item.replacementValue,
      item.stock, item.status,
    ],
  )

  return { ...item, specs: parseJson(item.specsJson) ?? {}, stockAvailable: item.stock }
}

export async function updateProductService(id, payload) {
  const prev = await findProductService(id)
  if (!prev) return null

  const fields = []
  const values = []

  const str = (key, col) => {
    if (payload?.[key] !== undefined) { fields.push(`${col} = ?`); values.push(payload[key] != null ? String(payload[key]) : null) }
  }
  const num = (key, col) => {
    if (payload?.[key] !== undefined) { fields.push(`${col} = ?`); values.push(toNumber(payload[key], 0)) }
  }
  const enm = (key, col, allowed) => {
    if (payload?.[key] !== undefined && allowed.includes(payload[key])) { fields.push(`${col} = ?`); values.push(payload[key]) }
  }

  str('name', 'name')
  str('category', 'category')
  str('brand', 'brand')
  str('sku', 'sku')
  str('description', 'description')
  str('imageUrl', 'image_url')
  num('priceDay', 'price_day')
  num('priceWeek', 'price_week')
  num('deposit', 'deposit')
  num('replacementValue', 'replacement_value')
  num('stock', 'stock')
  enm('status', 'status', ['active', 'inactive', 'maintenance'])

  if (payload?.specs !== undefined) {
    fields.push('specs_json = ?')
    values.push(payload.specs != null ? JSON.stringify(payload.specs) : null)
  }

  if (!fields.length) return prev

  const db = getDbPool()
  values.push(id)
  await db.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values)

  return findProductService(id)
}

export async function deleteProductService(id) {
  const db = getDbPool()
  const [result] = await db.query(`DELETE FROM products WHERE id = ?`, [id])
  return result.affectedRows > 0
}

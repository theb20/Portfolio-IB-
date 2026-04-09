import crypto from 'node:crypto'
import { getDbPool } from '../config/db.js'

export async function listCategoriesService() {
  const db = getDbPool()
  try {
    const [rows] = await db.query(
      `SELECT id, slug, label, sort_order AS sortOrder, created_at AS createdAt
       FROM categories
       ORDER BY sort_order ASC, created_at ASC`,
    )
    return rows.map((r) => ({
      id: String(r.id),
      slug: String(r.slug ?? ''),
      label: String(r.label ?? ''),
      sortOrder: Number(r.sortOrder ?? 0),
      createdAt: r.createdAt ?? undefined,
    }))
  } catch {
    // Table may not exist yet — return fallback list
    return [
      { id: 'cameras', slug: 'cameras', label: 'Caméras', sortOrder: 0 },
      { id: 'lenses', slug: 'lenses', label: 'Optiques', sortOrder: 1 },
      { id: 'lights', slug: 'lights', label: 'Lumière', sortOrder: 2 },
      { id: 'audio', slug: 'audio', label: 'Audio', sortOrder: 3 },
      { id: 'kits', slug: 'kits', label: 'Packs tournage', sortOrder: 4 },
    ]
  }
}

export async function createCategoryService(payload) {
  const db = getDbPool()
  const id = String(payload?.id ?? crypto.randomUUID())
  const slug = String(payload?.slug ?? '').trim().toLowerCase().replace(/\s+/g, '-')
  const label = String(payload?.label ?? 'Sans titre').trim()
  const sortOrder = Number(payload?.sortOrder ?? 0)

  await db.query(
    `INSERT INTO categories (id, slug, label, sort_order) VALUES (?, ?, ?, ?)`,
    [id, slug, label, sortOrder],
  )
  return { id, slug, label, sortOrder }
}

export async function updateCategoryService(id, payload) {
  const db = getDbPool()
  const fields = []
  const values = []

  if (payload?.slug != null) {
    fields.push('slug = ?')
    values.push(String(payload.slug).trim().toLowerCase().replace(/\s+/g, '-'))
  }
  if (payload?.label != null) {
    fields.push('label = ?')
    values.push(String(payload.label).trim())
  }
  if (payload?.sortOrder != null) {
    fields.push('sort_order = ?')
    values.push(Number(payload.sortOrder))
  }

  if (!fields.length) return null

  values.push(id)
  await db.query(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, values)

  const [rows] = await db.query(
    `SELECT id, slug, label, sort_order AS sortOrder FROM categories WHERE id = ? LIMIT 1`,
    [id],
  )
  const row = rows[0]
  if (!row) return null
  return {
    id: String(row.id),
    slug: String(row.slug ?? ''),
    label: String(row.label ?? ''),
    sortOrder: Number(row.sortOrder ?? 0),
  }
}

export async function deleteCategoryService(id) {
  const db = getDbPool()
  const [result] = await db.query(`DELETE FROM categories WHERE id = ?`, [id])
  return result.affectedRows > 0
}

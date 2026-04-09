import { getDbPool } from '../config/db.js'
import { toProjectInsertParams } from '../models/project.model.js'

export async function findAllProjects() {
  const db = getDbPool()
  const [rows] = await db.query(
    `SELECT id, slug, title, year, role, description, tags_json AS tagsJson, image, video_url AS videoUrl, created_at AS createdAt
     FROM projects
     ORDER BY created_at DESC, id DESC`,
  )
  return rows
}

export async function findProjectBySlug(slug) {
  const db = getDbPool()
  const [rows] = await db.query(
    `SELECT id, slug, title, year, role, description, tags_json AS tagsJson, image, video_url AS videoUrl, created_at AS createdAt
     FROM projects
     WHERE slug = ?
     LIMIT 1`,
    [slug],
  )
  return rows[0] ?? null
}

export async function createProject(input) {
  const db = getDbPool()
  const [result] = await db.query(
    `INSERT INTO projects (slug, title, year, role, description, tags_json, image, video_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    toProjectInsertParams(input),
  )
  return result.insertId
}

export async function updateProject(slug, input) {
  const db = getDbPool()
  const [result] = await db.query(
    `UPDATE projects
     SET title = ?, year = ?, role = ?, description = ?, tags_json = ?, image = ?, video_url = ?
     WHERE slug = ?`,
    [input.title, input.year, input.role, input.description, JSON.stringify(input.tags ?? []), input.image, input.videoUrl, slug],
  )
  if (result.affectedRows <= 0) return null
  return findProjectBySlug(input.slug ?? slug)
}

export async function deleteProject(slug) {
  const db = getDbPool()
  const [result] = await db.query(`DELETE FROM projects WHERE slug = ?`, [slug])
  return result.affectedRows > 0
}

import { defaultProjects } from '../data/defaultProjects.js'
import {
  normalizeProjectInput,
  normalizeProjectRow,
} from '../models/project.model.js'
import {
  createProject,
  deleteProject,
  findAllProjects,
  findProjectBySlug,
  updateProject,
} from '../repositories/projects.repository.js'
import { createHttpError } from '../utils/httpError.js'

export async function getProjects() {
  try {
    const rows = await findAllProjects()
    if (!rows.length) return defaultProjects
    return rows.map(normalizeProjectRow)
  } catch {
    return defaultProjects
  }
}

export async function getProject(slug) {
  try {
    const row = await findProjectBySlug(slug)
    if (!row) {
      return defaultProjects.find((project) => project.slug === slug) ?? null
    }
    return normalizeProjectRow(row)
  } catch {
    return defaultProjects.find((project) => project.slug === slug) ?? null
  }
}

export async function patchProject(slug, payload) {
  const existing = await getProject(slug)
  if (!existing) throw createHttpError(404, 'Projet introuvable')
  const input = normalizeProjectInput({ ...existing, ...payload, slug: existing.slug })
  const updated = await updateProject(slug, input)
  if (!updated) throw createHttpError(404, 'Projet introuvable')
  return normalizeProjectRow(updated)
}

export async function removeProject(slug) {
  const deleted = await deleteProject(slug)
  if (!deleted) throw createHttpError(404, 'Projet introuvable')
  return true
}

export async function addProject(payload) {
  const input = normalizeProjectInput(payload)
  if (!input.slug || !input.title || !input.description) {
    throw createHttpError(400, 'slug, title et description sont requis')
  }
  try {
    const id = await createProject(input)
    return { id, ...input }
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') {
      throw createHttpError(409, 'Un projet existe déjà avec ce slug')
    }
    throw error
  }
}

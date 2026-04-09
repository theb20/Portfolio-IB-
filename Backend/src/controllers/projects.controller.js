import { addProject, getProject, getProjects, patchProject, removeProject } from '../services/projects.service.js'

export async function listProjectsController(_req, res, next) {
  try {
    const items = await getProjects()
    res.json({ data: items })
  } catch (error) {
    next(error)
  }
}

export async function getProjectBySlugController(req, res, next) {
  try {
    const item = await getProject(req.params.slug)
    if (!item) return res.status(404).json({ error: 'Projet introuvable' })
    res.json({ data: item })
  } catch (error) {
    next(error)
  }
}

export async function updateProjectController(req, res, next) {
  try {
    const updated = await patchProject(req.params.slug, req.body ?? {})
    res.json({ data: updated })
  } catch (error) {
    next(error)
  }
}

export async function deleteProjectController(req, res, next) {
  try {
    await removeProject(req.params.slug)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
}

export async function createProjectController(req, res, next) {
  try {
    const { slug, title, year, role, description, tags, image, videoUrl } = req.body
    const created = await addProject({
      slug,
      title,
      year: year ?? null,
      role: role ?? null,
      description,
      tags: Array.isArray(tags) ? tags : [],
      image: image ?? null,
      videoUrl: videoUrl ?? null,
    })
    return res.status(201).json({ data: created })
  } catch (error) {
    next(error)
  }
}

import {
  createCategoryService,
  deleteCategoryService,
  listCategoriesService,
  updateCategoryService,
} from '../services/categories.service.js'
import { broadcastAdmin } from '../ws/socket.js'

export async function listCategoriesController(_req, res, next) {
  try {
    const items = await listCategoriesService()
    res.json({ data: items })
  } catch (err) {
    next(err)
  }
}

export async function createCategoryController(req, res, next) {
  try {
    const created = await createCategoryService(req.body ?? {})
    broadcastAdmin('categories.new', created)
    res.status(201).json({ data: created })
  } catch (err) {
    next(err)
  }
}

export async function updateCategoryController(req, res, next) {
  try {
    const updated = await updateCategoryService(req.params.id, req.body ?? {})
    if (!updated) return res.status(404).json({ error: 'Catégorie introuvable' })
    broadcastAdmin('categories.update', updated)
    res.json({ data: updated })
  } catch (err) {
    next(err)
  }
}

export async function deleteCategoryController(req, res, next) {
  try {
    const ok = await deleteCategoryService(req.params.id)
    if (!ok) return res.status(404).json({ error: 'Catégorie introuvable' })
    broadcastAdmin('categories.delete', { id: req.params.id })
    res.status(204).end()
  } catch (err) {
    next(err)
  }
}

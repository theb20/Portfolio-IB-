import { createProductService, deleteProductService, findProductService, listProductsService, updateProductService } from '../services/products.service.js'
import { broadcastAdmin } from '../ws/socket.js'

export async function listProductsController(_req, res, next) {
  try {
    const items = await listProductsService()
    res.json({ data: items })
  } catch (err) {
    next(err)
  }
}

export async function getProductController(req, res, next) {
  try {
    const item = await findProductService(req.params.id)
    if (!item) return res.status(404).json({ error: 'Produit introuvable' })
    res.json({ data: item })
  } catch (err) {
    next(err)
  }
}

export async function createProductController(req, res, next) {
  try {
    const created = await createProductService(req.body ?? {})
    broadcastAdmin('products.new', created)
    res.status(201).json({ data: created })
  } catch (err) {
    next(err)
  }
}

export async function updateProductController(req, res, next) {
  try {
    const updated = await updateProductService(req.params.id, req.body ?? {})
    if (!updated) return res.status(404).json({ error: 'Produit introuvable' })
    broadcastAdmin('products.update', updated)
    res.json({ data: updated })
  } catch (err) {
    next(err)
  }
}

export async function deleteProductController(req, res, next) {
  try {
    const ok = await deleteProductService(req.params.id)
    if (!ok) return res.status(404).json({ error: 'Produit introuvable' })
    broadcastAdmin('products.delete', { id: req.params.id })
    res.status(204).end()
  } catch (err) {
    next(err)
  }
}

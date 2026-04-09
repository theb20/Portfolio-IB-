import { createCustomerService, deleteCustomerService, listCustomersService, updateCustomerService } from '../services/customers.service.js'
import { broadcastAdmin } from '../ws/socket.js'

export async function listCustomersController(_req, res, next) {
  try {
    const rows = await listCustomersService()
    res.json({ data: rows })
  } catch (err) {
    next(err)
  }
}

export async function createCustomerController(req, res, next) {
  try {
    const created = await createCustomerService(req.body ?? {})
    broadcastAdmin('customers.new', created)
    res.status(201).json({ data: created })
  } catch (err) {
    next(err)
  }
}

export async function updateCustomerController(req, res, next) {
  try {
    const updated = await updateCustomerService(req.params.id, req.body ?? {})
    if (!updated) return res.status(404).json({ error: 'Client introuvable' })
    broadcastAdmin('customers.update', updated)
    res.json({ data: updated })
  } catch (err) {
    next(err)
  }
}

export async function deleteCustomerController(req, res, next) {
  try {
    const ok = await deleteCustomerService(req.params.id)
    if (!ok) return res.status(404).json({ error: 'Client introuvable' })
    broadcastAdmin('customers.delete', { id: req.params.id })
    res.status(204).end()
  } catch (err) {
    next(err)
  }
}

import { createAvailabilityService, deleteAvailabilityService, listAvailabilityService } from '../services/availability.service.js'
import { broadcastAdmin } from '../ws/socket.js'

export async function listAvailabilityController(_req, res, next) {
  try {
    const rows = await listAvailabilityService()
    res.json({ data: rows })
  } catch (err) {
    next(err)
  }
}

export async function createAvailabilityController(req, res, next) {
  try {
    const created = await createAvailabilityService(req.body ?? {})
    broadcastAdmin('availability.new', created)
    res.status(201).json({ data: created })
  } catch (err) {
    next(err)
  }
}

export async function deleteAvailabilityController(req, res, next) {
  try {
    const ok = await deleteAvailabilityService(req.params.id)
    if (!ok) return res.status(404).json({ error: 'Blocage introuvable' })
    broadcastAdmin('availability.delete', { id: req.params.id })
    res.status(204).end()
  } catch (err) {
    next(err)
  }
}

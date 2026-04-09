function asRequiredString(value) {
  return String(value ?? '').trim()
}

function asOptionalString(value) {
  if (value === undefined || value === null) return null
  const normalized = String(value).trim()
  return normalized ? normalized : null
}

export function normalizeMessageInput(input) {
  return {
    name: asRequiredString(input.name),
    email: asRequiredString(input.email).toLowerCase(),
    project: asOptionalString(input.project),
    message: asRequiredString(input.message),
  }
}

export function normalizeMessageRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    project: row.project,
    message: row.message,
    status: row.status,
    createdAt: row.createdAt,
  }
}

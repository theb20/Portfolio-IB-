function safeParseTags(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function asOptionalString(value) {
  if (value === undefined || value === null) return null
  const normalized = String(value).trim()
  return normalized ? normalized : null
}

export function normalizeProjectRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    year: row.year,
    role: row.role,
    description: row.description,
    tags: safeParseTags(row.tagsJson),
    image: row.image,
    videoUrl: row.videoUrl,
    createdAt: row.createdAt,
  }
}

export function normalizeProjectInput(input) {
  const slug = String(input.slug ?? '').trim()
  const title = String(input.title ?? '').trim()
  const description = String(input.description ?? '').trim()
  const tags = Array.isArray(input.tags)
    ? input.tags.map((tag) => String(tag).trim()).filter(Boolean)
    : []

  return {
    slug,
    title,
    description,
    year: asOptionalString(input.year),
    role: asOptionalString(input.role),
    tags,
    image: asOptionalString(input.image),
    videoUrl: asOptionalString(input.videoUrl),
  }
}

export function toProjectInsertParams(input) {
  return [
    input.slug,
    input.title,
    input.year,
    input.role,
    input.description,
    JSON.stringify(input.tags),
    input.image,
    input.videoUrl,
  ]
}

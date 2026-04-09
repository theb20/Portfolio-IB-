import axios from 'axios'

const apiBaseUrl =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:4000/api'

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function fetchProjects() {
  const { data } = await api.get('/projects')
  return data?.data ?? []
}

export async function fetchProjectBySlug(slug) {
  const { data } = await api.get(`/projects/${slug}`)
  return data?.data ?? null
}

export async function submitContactMessage(payload) {
  const { data } = await api.post('/messages', payload)
  return data?.data
}

export async function fetchProducts() {
  const { data } = await api.get('/products')
  return data?.data ?? []
}

export async function fetchProduct(id) {
  const { data } = await api.get(`/products/${id}`)
  return data?.data ?? null
}

export async function createOrder(payload) {
  const { data } = await api.post('/orders', payload)
  return data?.data ?? null
}

export async function fetchContent(section) {
  const { data } = await api.get(`/content/${section}`)
  return data?.data ?? null
}

export async function fetchMyOrders() {
  const { data } = await api.get('/orders/me')
  return data?.data ?? []
}

export async function logout() {
  await api.post('/auth/logout')
}

export async function fetchDepositRate() {
  try {
    const { data } = await api.get('/settings/deposit_rate')
    const n = parseFloat(data?.value)
    return Number.isFinite(n) && n >= 0 ? n : 20
  } catch {
    return 20
  }
}

export async function validatePromoCode(code, subtotal) {
  const { data } = await api.post('/promo-codes/validate', { code, subtotal })
  if (!data?.valid) throw new Error(data?.error ?? 'Code invalide ou expiré.')
  return data?.data ?? null
}

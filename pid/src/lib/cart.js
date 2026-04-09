const KEY = 'pid_cart'

const EVENT = 'pid_cart'

function cartCount(items) {
  return (items ?? []).reduce((sum, i) => sum + (Number(i?.qty) || 0), 0)
}

function emitCartEvent(detail) {
  try {
    window.dispatchEvent(new CustomEvent(EVENT, { detail }))
  } catch {
    return
  }
}

export function getCart() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCart(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    return
  }
}

export function addToCart(product, qty = 1) {
  const list = getCart()
  const idx = list.findIndex((i) => i.id === product.id)
  if (idx >= 0) {
    list[idx].qty += qty
  } else {
    list.push({ id: product.id, name: product.name, priceDay: product.priceDay, priceWeek: product.priceWeek, qty })
  }
  saveCart(list)
  emitCartEvent({
    action: 'add',
    item: { id: product?.id, name: product?.name, qty: qty },
    count: cartCount(list),
    cart: list,
  })
  return list
}

export function updateQty(id, qty) {
  const list = getCart().map((i) => (i.id === id ? { ...i, qty } : i)).filter((i) => i.qty > 0)
  saveCart(list)
  emitCartEvent({ action: 'update', count: cartCount(list), cart: list })
  return list
}

export function removeFromCart(id) {
  const list = getCart().filter((i) => i.id !== id)
  saveCart(list)
  emitCartEvent({ action: 'remove', id, count: cartCount(list), cart: list })
  return list
}

export function clearCart() {
  saveCart([])
  emitCartEvent({ action: 'clear', count: 0, cart: [] })
}

function normalizeDays(value) {
  if (typeof value === 'number') {
    const n = Math.floor(value)
    return Number.isFinite(n) && n > 0 ? n : 1
  }
  if (value === 'week') return 7
  return 1
}

function computeItemTotal(item, days) {
  const qty = Number(item?.qty) || 0
  const priceDay = Number(item?.priceDay) || 0
  const priceWeek = Number(item?.priceWeek) || 0
  if (qty <= 0) return 0

  if (days >= 7 && priceWeek > 0) {
    const fullWeeks = Math.floor(days / 7)
    const remainingDays = days % 7
    return (fullWeeks * priceWeek + remainingDays * priceDay) * qty
  }

  return priceDay * days * qty
}

export function computeTotals(items, duration = 1, { depositRate = 20, discount = 0 } = {}) {
  const days = normalizeDays(duration)
  const subtotal = items.reduce((sum, i) => sum + computeItemTotal(i, days), 0)
  const discounted = Math.max(0, subtotal - discount)
  const deposit = Math.round(discounted * (depositRate / 100))
  return { days, subtotal, discount, discounted, deposit, total: discounted + deposit }
}

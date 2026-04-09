import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router'
import { computeTotals, getCart, removeFromCart, updateQty } from '../lib/cart.js'
import { fetchDepositRate, validatePromoCode } from '../lib/api.js'
import { ArrowLeft, ChevronDown, Minus, Plus, ShoppingBag, X } from 'lucide-react'

/* ── helpers ─────────────────────────────────────────────── */
function clampDays(v) {
  const n = Math.floor(Number(v))
  return Number.isFinite(n) && n > 0 ? n : 1
}

function lineTotal(item, days) {
  const qty = Number(item?.qty) || 0
  const priceDay = Number(item?.priceDay) || 0
  const priceWeek = Number(item?.priceWeek) || 0
  if (qty <= 0) return 0
  if (days >= 7 && priceWeek > 0) {
    return (Math.floor(days / 7) * priceWeek + (days % 7) * priceDay) * qty
  }
  return priceDay * days * qty
}

const DAY_PRESETS = [1, 2, 3, 5, 7, 14]

/* ── CartPage ────────────────────────────────────────────── */
export default function CartPage() {
  const [items, setItems]         = useState(() => getCart())
  const [days, setDays]           = useState(1)
  const [daysInput, setDaysInput] = useState('1')
  const [selected, setSelected]   = useState(() => new Set())
  const [promoOpen, setPromoOpen] = useState(true)

  // dépôt dynamique
  const [depositRate, setDepositRate] = useState(20)

  // code promo
  const [promoInput, setPromoInput] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null) // { code, type, value, discount }

  /* charger le taux depuis le backend au montage */
  useEffect(() => {
    fetchDepositRate().then(setDepositRate)
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pid_checkout_days')
      if (raw) { const n = clampDays(raw); setDays(n); setDaysInput(String(n)) }
    } catch { /**/ }
  }, [])

  useEffect(() => {
    try { localStorage.setItem('pid_checkout_days', String(days)) } catch { /**/ }
  }, [days])

  useEffect(() => {
    const onStorage = () => setItems(getCart())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    setSelected(new Set(items.map((i) => i.id)))
  }, [])

  const allSelected = items.length > 0 && items.every((i) => selected.has(i.id))

  // ── Calculs (définis avant les handlers qui en dépendent) ─────
  const subtotalRaw = useMemo(
    () => items.reduce((sum, i) => {
      const qty = Number(i?.qty) || 0
      const priceDay = Number(i?.priceDay) || 0
      const priceWeek = Number(i?.priceWeek) || 0
      if (qty <= 0) return sum
      if (days >= 7 && priceWeek > 0) {
        return sum + (Math.floor(days / 7) * priceWeek + (days % 7) * priceDay) * qty
      }
      return sum + priceDay * days * qty
    }, 0),
    [items, days],
  )

  const totals = useMemo(
    () => computeTotals(items, days, { depositRate, discount: appliedPromo?.discount ?? 0 }),
    [items, days, depositRate, appliedPromo],
  )

  // ── Handlers ──────────────────────────────────────────────────
  function toggleAll() {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(items.map((i) => i.id)))
  }

  function toggleItem(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleQty(id, qty) {
    setItems(updateQty(id, Math.max(1, qty)))
  }

  function handleRemove(id) {
    setItems(removeFromCart(id))
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next })
  }

  function commitDays() {
    const n = clampDays(daysInput)
    setDays(n)
    setDaysInput(String(n))
  }

  async function applyPromo() {
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    setPromoError('')
    setPromoLoading(true)
    try {
      const result = await validatePromoCode(code, subtotalRaw)
      setAppliedPromo(result)
      setPromoInput('')
      setPromoOpen(false)
      // Persister pour que CheckoutPage puisse l'envoyer à la commande
      try { localStorage.setItem('pid_checkout_promo', result.code) } catch { /**/ }
    } catch (e) {
      setPromoError(e?.message ?? 'Code invalide ou expiré.')
    } finally {
      setPromoLoading(false)
    }
  }

  function removePromo() {
    setAppliedPromo(null)
    setPromoError('')
    setPromoInput('')
    setPromoOpen(true)
    try { localStorage.removeItem('pid_checkout_promo') } catch { /**/ }
  }

  /* ── empty state ── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: '#f5f5f5' }}>
        <div style={{ background: '#fff' }} className="border-b border-gray-200 px-6 pt-6 pb-4">
          <p className="text-xs text-gray-400">
            <Link to="/" className="hover:underline">Web</Link>
            {' / '}
            <span className="text-gray-600">Panier</span>
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-2xl border border-gray-200 bg-white">
            <ShoppingBag size={34} className="text-gray-300" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Panier vide</h2>
          <p className="mb-8 max-w-xs text-sm text-gray-400">
            Parcourez le catalogue et ajoutez du matériel à louer.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-85"
          >
            Voir le catalogue
          </Link>
        </div>
      </div>
    )
  }

  /* ── main ── */
  return (
    <div className="min-h-screen" style={{ background: '#f5f5f5' }}>

      {/* breadcrumb */}
      <div style={{ background: '#fff' }} className="border-b border-gray-200 px-6 pt-6 pb-4">
        <p className="text-xs text-gray-400">
          <Link to="/" className="hover:underline">Web</Link>
          {' / '}
          <span className="text-gray-600">Panier</span>
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">

          {/* ── LEFT panel ── */}
          <div style={{ background: '#fff' }} className="rounded-sm shadow-sm">

            {/* back arrow */}
            <div className="px-7 pt-6 pb-2">
              <Link
                to="/shop"
                className="inline-flex items-center text-gray-400 transition-colors hover:text-gray-700"
              >
                <ArrowLeft size={18} />
              </Link>
            </div>

            {/* column headers */}
            <div className="grid grid-cols-[24px_72px_1fr_140px_90px_28px] items-center gap-3 px-7 pb-3 pt-2">
              <button
                type="button"
                onClick={toggleAll}
                className="flex h-4 w-4 items-center justify-center rounded border border-gray-300 transition-colors"
                style={allSelected ? { background: '#111', borderColor: '#111' } : {}}
                aria-label="Tout sélectionner"
              >
                {allSelected && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.5 6L8 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Select all</span>
              <span className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Quantity</span>
              <span className="text-right text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Total</span>
              <span />
            </div>

            <div className="border-t border-gray-100" />

            {/* items */}
            <AnimatePresence initial={false}>
              {items.map((item) => {
                const total   = lineTotal(item, days)
                const checked = selected.has(item.id)
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -12, transition: { duration: 0.18 } }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="grid grid-cols-[24px_72px_1fr_140px_90px_28px] items-center gap-3 px-7 py-5">

                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className="flex h-4 w-4 items-center justify-center rounded border border-gray-300 transition-colors"
                        style={checked ? { background: '#111', borderColor: '#111' } : {}}
                        aria-label="Sélectionner"
                      >
                        {checked && (
                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3.5L3.5 6L8 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>

                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-gray-100">
                        <img
                          src={item.imageUrl ?? item.image ?? '/og-image.png'}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">{item.name}</p>
                        {item.brand && (
                          <p className="mt-0.5 text-[11px] uppercase tracking-widest text-gray-400">{item.brand}</p>
                        )}
                        <p className="mt-1 text-sm text-gray-400">
                          {item.priceDay} €&thinsp;/&thinsp;j
                          {item.priceWeek ? ` · ${item.priceWeek} €/sem` : ''}
                        </p>
                      </div>

                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleQty(item.id, item.qty - 1)}
                          className="flex h-8 w-8 items-center justify-center border border-gray-200 bg-white text-gray-400 transition-colors hover:text-gray-800"
                          style={{ borderRadius: '4px 0 0 4px' }}
                        >
                          <Minus size={11} />
                        </button>
                        <div className="flex h-8 w-12 items-center justify-center border-y border-gray-200 bg-white text-sm font-semibold text-gray-800 tabular-nums">
                          {item.qty}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleQty(item.id, item.qty + 1)}
                          className="flex h-8 w-8 items-center justify-center border border-gray-200 bg-white text-gray-400 transition-colors hover:text-gray-800"
                          style={{ borderRadius: '0 4px 4px 0' }}
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <div className="text-right font-semibold text-gray-900">
                        {total}&thinsp;€
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-gray-300 transition-colors hover:text-gray-600"
                        aria-label="Retirer"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="border-t border-gray-100" />
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* duration picker */}
            <div className="flex flex-wrap items-center gap-2 px-7 py-5">
              <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Durée</span>
              {DAY_PRESETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => { setDays(d); setDaysInput(String(d)) }}
                  className="rounded border px-3 py-1.5 text-sm transition-colors"
                  style={
                    days === d
                      ? { background: '#111', borderColor: '#111', color: '#fff' }
                      : { background: '#fff', borderColor: '#e5e7eb', color: '#6b7280' }
                  }
                >
                  {d}j
                </button>
              ))}
              <div className="flex items-center gap-1 rounded border border-gray-200 bg-white px-3 py-1.5">
                <input
                  value={daysInput}
                  onChange={(e) => setDaysInput(e.target.value)}
                  onBlur={commitDays}
                  onKeyDown={(e) => e.key === 'Enter' && commitDays()}
                  inputMode="numeric"
                  className="w-10 bg-transparent text-center text-sm text-gray-500 outline-none"
                  placeholder="—"
                />
                <span className="text-xs text-gray-300">j</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: summary ── */}
          <div>
            <div style={{ background: '#fff' }} className="rounded-sm p-7 shadow-sm">
              <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-gray-900">
                Summary
              </h2>

              {/* promo code */}
              <button
                type="button"
                onClick={() => setPromoOpen((v) => !v)}
                className="mb-5 flex w-full items-center justify-between border-b border-gray-100 pb-5 text-sm text-gray-500 transition-colors hover:text-gray-800"
              >
                <span>
                  {appliedPromo
                    ? <span className="font-semibold text-green-600">{appliedPromo.code} appliqué ✓</span>
                    : 'Vous avez un code promo ?'}
                </span>
                <ChevronDown
                  size={14}
                  className="text-gray-400 transition-transform duration-200"
                  style={{ transform: promoOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>

              <AnimatePresence>
                {promoOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mb-5 space-y-2">
                      {appliedPromo ? (
                        <div className="flex items-center justify-between rounded border border-green-200 bg-green-50 px-3 py-2 text-sm">
                          <span className="font-semibold text-green-700">{appliedPromo.code}</span>
                          <span className="text-green-600">−{appliedPromo.discount} €</span>
                          <button
                            type="button"
                            onClick={removePromo}
                            className="ml-3 text-green-400 hover:text-green-700"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={promoInput}
                              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                              onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                              placeholder="Code promo"
                              className="flex-1 rounded border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-gray-400"
                            />
                            <button
                              type="button"
                              onClick={applyPromo}
                              disabled={promoLoading}
                              className="rounded border border-gray-200 px-4 py-2 text-sm text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-800 disabled:opacity-50"
                            >
                              {promoLoading ? '…' : 'Appliquer'}
                            </button>
                          </div>
                          {promoError && (
                            <p className="text-xs text-red-500">{promoError}</p>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* lines */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sous-total</span>
                  <span className="font-medium text-gray-900">{totals.subtotal}&thinsp;€</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Remise ({appliedPromo.code})</span>
                    <span className="font-medium">−{appliedPromo.discount}&thinsp;€</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Dépôt de garantie ({depositRate}%)</span>
                  <span className="font-medium text-gray-900">{totals.deposit}&thinsp;€</span>
                </div>
              </div>

              <div className="my-5 border-t border-gray-100" />

              <div className="flex items-baseline justify-between">
                <span className="text-base font-semibold text-gray-900">Total</span>
                <motion.span
                  key={totals.total}
                  initial={{ scale: 0.92, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.18 }}
                  className="text-2xl font-bold text-gray-900"
                >
                  {totals.total}&thinsp;€
                </motion.span>
              </div>

              {/* CTA buttons */}
              <div className="mt-6 space-y-3">
                <Link
                  to="/checkout"
                  className="flex w-full items-center justify-center rounded bg-gray-900 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-85"
                >
                  Passer commande
                </Link>
                <Link
                  to="/shop"
                  className="flex w-full items-center justify-center rounded border border-gray-200 py-3.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900"
                >
                  Ajouter du matériel
                </Link>
              </div>

              {/* help */}
              <div className="mt-6 border-t border-gray-100 pt-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  Besoin d'aide&thinsp;?
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Contactez-nous via la page{' '}
                  <Link to="/contact" className="underline decoration-gray-300 hover:decoration-gray-600">
                    contact
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

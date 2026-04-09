import { useEffect, useMemo, useState } from 'react'
import Container from '../ui/Container.jsx'
import Card from '../ui/Card.jsx'
import { clearCart, computeTotals, getCart } from '../lib/cart.js'
import { api } from '../lib/api.js'
import { Link } from 'react-router'

function clampDays(value) {
  const n = Math.floor(Number(value))
  return Number.isFinite(n) && n > 0 ? n : 1
}

function getApiBase() {
  const url = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:4000/api'
  return url.replace(/\/api$/, '')
}

function GoogleLogo({ className = '' }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.74 1.22 9.28 3.62l6.92-6.92C36.02 2.44 30.36 0 24 0 14.62 0 6.56 5.38 2.68 13.22l8.06 6.26C12.56 13.34 17.82 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.64-.15-3.22-.43-4.75H24v9h12.7c-.55 2.97-2.23 5.49-4.75 7.18l7.29 5.66C43.57 37.62 46.5 31.58 46.5 24.5z"
      />
      <path
        fill="#FBBC05"
        d="M10.74 28.48A14.5 14.5 0 0 1 10 24c0-1.56.26-3.07.74-4.48l-8.06-6.26A23.92 23.92 0 0 0 0 24c0 3.86.92 7.5 2.68 10.74l8.06-6.26z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.36 0 11.7-2.1 15.6-5.72l-7.29-5.66c-2.02 1.36-4.6 2.16-8.31 2.16-6.18 0-11.44-3.84-13.26-9.22l-8.06 6.26C6.56 42.62 14.62 48 24 48z"
      />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  )
}

export default function CheckoutPage() {
  const [days, setDays] = useState(1)
  const [daysInput, setDaysInput] = useState('1')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [user, setUser] = useState(null)
  const items = useMemo(() => getCart(), [])
  const totals = useMemo(() => computeTotals(items, days), [items, days])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pid_checkout_days')
      if (raw) {
        const n = clampDays(raw)
        setDays(n)
        setDaysInput(String(n))
      }
    } catch {
      return
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('pid_checkout_days', String(days))
    } catch {
      return
    }
  }, [days])

  useEffect(() => {
    let mounted = true
    api
      .get('/auth/me')
      .then((res) => {
        if (!mounted) return
        setUser(res?.data?.user ?? null)
      })
      .catch(() => {
        if (!mounted) return
        setUser(null)
      })
    return () => {
      mounted = false
    }
  }, [])

  async function createOrder() {
    setProcessing(true)
    setError('')
    try {
      let promoCode = null
      try { promoCode = localStorage.getItem('pid_checkout_promo') || null } catch { /**/ }

      const payload = {
        items,
        days,
        ...(promoCode ? { promoCode } : {}),
      }

      const { data } = await api.post('/orders', payload)
      const id = String(data?.data?.id ?? '')
      setOrderId(id)
      clearCart()
      try { localStorage.removeItem('pid_checkout_promo') } catch { /**/ }
      setDone(true)
      try {
        localStorage.removeItem('pid_checkout_autosubmit')
      } catch {
        return
      }
    } catch (e) {
      const msg = e?.message ? String(e.message) : null
      setError(msg || 'Impossible de créer la commande.')
    } finally {
      setProcessing(false)
    }
  }

  function continueWithGoogle() {
    if (user) {
      void createOrder()
      return
    }

    try {
      localStorage.setItem('pid_checkout_autosubmit', '1')
    } catch {
      return
    }

    const base = getApiBase()
    const next = `${window.location.origin}/checkout?auth=google`
    window.location.href = `${base}/api/auth/google/start?next=${encodeURIComponent(next)}`
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const auth = params.get('auth')
    if (auth !== 'google') return
    if (!user) return
    if (!items.length) return
    if (done || processing) return

    try {
      const auto = localStorage.getItem('pid_checkout_autosubmit')
      if (auto !== '1') return
    } catch {
      return
    }

    void createOrder()
  }, [user, items.length, done, processing])

  return (
    <div className="min-h-screen">
      <Container className="px-4 pt-20 pb-10">
        <div className="flex items-center justify-between">
          <h1 className="text-white font-bold" style={{ fontFamily: '"Syne", sans-serif', fontSize: 'clamp(28px, 4vw, 44px)' }}>
            Commande
          </h1>
          <Link to="/cart" className="text-white/60 text-sm hover:text-white">
            ← Panier
          </Link>
        </div>
        <hr className="border-t border-white/10 mt-6" />
      </Container>

      <Container className="px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="p-5 lg:col-span-8">
            <div className="flex flex-wrap items-center gap-2">
              {[1, 2, 3, 5, 7, 14].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDays(d)
                    setDaysInput(String(d))
                  }}
                  className={[
                    'rounded-md border px-3 py-2 text-sm',
                    days === d
                      ? 'border-[var(--accent-border)] bg-[var(--accent-bg)] text-white'
                      : 'border-white/10 bg-white/5 text-white/70 hover:text-white',
                  ].join(' ')}
                >
                  {d}j
                </button>
              ))}
              <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2">
                <span className="text-white/50 text-xs">Perso</span>
                <input
                  value={daysInput}
                  onChange={(e) => setDaysInput(e.target.value)}
                  onBlur={() => {
                    const next = clampDays(daysInput)
                    setDays(next)
                    setDaysInput(String(next))
                  }}
                  inputMode="numeric"
                  className="w-16 bg-transparent text-right text-sm text-white outline-none"
                />
                <span className="text-white/50 text-xs">jours</span>
              </div>
            </div>
            <div className="mt-4 text-white/70 text-sm">
              Connectez-vous avec Google pour valider la commande.
            </div>
            {user?.email ? <p className="mt-2 text-white/50 text-xs">Connecté : {user.email}</p> : null}
            {error ? <p className="mt-2 text-red-400 text-sm">{error}</p> : null}
            {done ? (
              <p className="mt-2 text-[var(--accent)] text-sm">
                Commande envoyée. Merci !
                {orderId ? ` (#${orderId})` : ''}
              </p>
            ) : null}
          </Card>

          <Card className="p-5 lg:col-span-4">
            <h2 className="text-white font-semibold" style={{ fontFamily: '"Syne", sans-serif' }}>
              Montant
            </h2>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex items-center justify-between text-white/70">
                <span>Durée</span>
                <span className="text-white">
                  {totals.days} jour{totals.days > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center justify-between text-white/70">
                <span>Sous-total</span>
                <span className="text-white">€{totals.subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-white/70">
                <span>Dépôt (20%)</span>
                <span className="text-white">€{totals.deposit}</span>
              </div>
              <div className="h-px bg-white/10 my-2" />
              <div className="flex items-center justify-between text-white/80">
                <span>Total</span>
                <span className="text-white font-semibold">€{totals.total}</span>
              </div>
            </div>
            <div className="mt-5">
              <button
                type="button"
                onClick={continueWithGoogle}
                disabled={processing || !items.length}
                className={[
                  'w-full inline-flex items-center justify-center gap-3 rounded-md border px-4 py-2 text-sm font-medium transition-colors',
                  'border-[#dadce0] bg-white text-[#3c4043] hover:bg-[#f8f9fa] active:bg-[#f1f3f4]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]',
                  'disabled:pointer-events-none disabled:opacity-60',
                ].join(' ')}
              >
                <GoogleLogo className="h-[18px] w-[18px]" />
                <span>{processing ? 'Chargement…' : 'Continuer avec Google'}</span>
              </button>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  )
}

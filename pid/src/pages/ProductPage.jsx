import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Container from '../ui/Container.jsx'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import { getProductById } from '../lib/shopData.js'
import { addToCart } from '../lib/cart.js'
import { Link } from 'react-router'
import { fetchProduct } from '../lib/api.js'

const MotionDiv = motion.div

function AvailabilityBadge({ available, total, status }) {
  if (status === 'maintenance') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400 border border-yellow-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
        En maintenance
      </span>
    )
  }
  if (status === 'inactive') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/40 border border-white/10">
        <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
        Indisponible
      </span>
    )
  }
  if (available === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 border border-red-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Complet — {total} unité{total > 1 ? 's' : ''} louée{total > 1 ? 's' : ''}
      </span>
    )
  }
  if (available < total) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400 border border-yellow-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
        {available} / {total} disponible{available > 1 ? 's' : ''}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400 border border-green-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
      Disponible — {total} unité{total > 1 ? 's' : ''}
    </span>
  )
}

export default function ProductPage() {
  const { id } = useParams()
  const fallback = useMemo(() => getProductById(id), [id])
  const [remote, setRemote] = useState(null)
  const [period, setPeriod] = useState('day')
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    let mounted = true
    fetchProduct(id)
      .then((item) => {
        if (!mounted) return
        if (item) setRemote({ id, item: { ...item, image: item.imageUrl ?? item.image ?? '/og-image.png', notes: item.notes ?? [] } })
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [id])

  const product = remote?.id === id ? remote.item : fallback

  if (!product) {
    return (
      <Container className="px-4 py-24">
        <p className="text-white/70">Produit introuvable.</p>
        <div className="mt-4"><Button as="link" variant="outline" to="/shop">Retour au catalogue</Button></div>
      </Container>
    )
  }

  const price = period === 'week' ? product.priceWeek : product.priceDay
  const available = product.stockAvailable ?? product.stock ?? 1
  const total = product.stock ?? 1
  const isUnavailable = product.status === 'inactive' || product.status === 'maintenance' || available === 0

  function handleAddToCart() {
    if (isUnavailable) return
    addToCart({ ...product, priceDay: product.priceDay, priceWeek: product.priceWeek }, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="min-h-screen">
      <Container className="px-4">
        <MotionDiv
          className="pt-20 pb-6"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-between">
            <Link to="/shop" className="text-white/60 text-sm hover:text-white">← Catalogue</Link>
            <Link to="/cart" className="text-white/70 text-sm hover:text-white">Panier</Link>
          </div>
        </MotionDiv>
      </Container>

      <Container className="px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Image */}
          <Card className="overflow-hidden lg:col-span-7">
            <div className="aspect-[16/9] w-full bg-black/20">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {product.description ? (
              <div className="p-5">
                <p className="text-white/60 text-sm leading-relaxed">{product.description}</p>
              </div>
            ) : null}
          </Card>

          {/* Infos + actions */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Card className="p-5 flex flex-col gap-4">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-white font-bold tracking-tight" style={{ fontFamily: '"Syne", sans-serif', fontSize: 'clamp(24px, 3vw, 36px)' }}>
                    {product.name}
                  </h1>
                </div>
                {(product.brand || product.sensor || product.mount) ? (
                  <p className="mt-1 text-white/40 text-sm">
                    {[product.brand, product.sensor, product.mount].filter(Boolean).join(' · ')}
                  </p>
                ) : null}
                {product.sku ? <p className="text-white/25 text-xs mt-1">Réf: {product.sku}</p> : null}
              </div>

              {/* Availability */}
              <AvailabilityBadge available={available} total={total} status={product.status} />

              {/* Period selector */}
              <div>
                <p className="text-white/50 text-xs mb-2 uppercase tracking-widest">Période</p>
                <div className="grid grid-cols-2 gap-2">
                  {['day', 'week'].map((p) => (
                    <button key={p} type="button" onClick={() => setPeriod(p)}
                      className={[
                        'rounded-xl border px-4 py-3 text-sm font-medium transition-all',
                        period === p
                          ? 'border-white/40 bg-white/10 text-white'
                          : 'border-white/10 bg-white/3 text-white/50 hover:text-white hover:border-white/20',
                      ].join(' ')}>
                      <div className="font-bold text-lg">€{p === 'day' ? product.priceDay : product.priceWeek}</div>
                      <div className="text-xs opacity-70">par {p === 'day' ? 'jour' : 'semaine'}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Qty */}
              {!isUnavailable && (
                <div>
                  <p className="text-white/50 text-xs mb-2 uppercase tracking-widest">Quantité</p>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-9 h-9 rounded-lg border border-white/15 text-white hover:bg-white/10 flex items-center justify-center text-lg">−</button>
                    <span className="text-white font-bold w-8 text-center">{qty}</span>
                    <button type="button" onClick={() => setQty(Math.min(available, qty + 1))}
                      className="w-9 h-9 rounded-lg border border-white/15 text-white hover:bg-white/10 flex items-center justify-center text-lg">+</button>
                    <span className="text-white/30 text-xs">max {available}</span>
                  </div>
                </div>
              )}

              {/* Deposit info */}
              {(product.deposit ?? 0) > 0 ? (
                <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-sm">
                  <div className="flex justify-between text-white/60">
                    <span>Dépôt de garantie</span>
                    <span className="text-white">€{product.deposit}</span>
                  </div>
                  <p className="text-white/30 text-xs mt-1">Restitué en fin de location</p>
                </div>
              ) : null}

              {/* Notes / tags */}
              {(product.notes ?? []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {product.notes.map((n) => (
                    <span key={n} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/60">{n}</span>
                  ))}
                </div>
              ) : null}

              {/* CTA */}
              <div className="grid gap-2 pt-2">
                {added ? (
                  <div className="rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400 text-center font-medium">
                    ✓ Ajouté au panier
                  </div>
                ) : (
                  <button type="button" onClick={handleAddToCart} disabled={isUnavailable}
                    className={[
                      'w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all',
                      isUnavailable
                        ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                        : 'bg-white text-black hover:bg-white/90 active:scale-[0.98]',
                    ].join(' ')}>
                    {isUnavailable ? 'Non disponible' : `Ajouter au panier · €${price * qty}`}
                  </button>
                )}
                <Button as="link" variant="outline" to="/checkout">
                  Réserver directement
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  )
}

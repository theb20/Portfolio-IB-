import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Container from '../ui/Container.jsx'
import { api, fetchProducts } from '../lib/api.js'
import { addToCart } from '../lib/cart.js'
import { Link } from 'react-router'
import { categories as FALLBACK_CATS, products as FALLBACK_PRODUCTS } from '../lib/shopData.js'

const MotionDiv = motion.div

function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}

function StockBadge({ item }) {
  const available = item.stockAvailable ?? item.stock ?? 1
  const status = item.status ?? 'active'
  if (status === 'maintenance') return <span className="text-[10px] text-yellow-400/80">Maintenance</span>
  if (status === 'inactive') return <span className="text-[10px] text-white/30">Indisponible</span>
  if (available === 0) return <span className="text-[10px] text-red-400">Complet</span>
  if (available <= 1) return <span className="text-[10px] text-yellow-400">Dernière unité</span>
  return null
}

function ProductCard({ item, onAdd, added }) {
  const available = item.stockAvailable ?? item.stock ?? 1
  const isUnavailable = item.status === 'inactive' || item.status === 'maintenance' || available === 0

  return (
    <div className={`group flex flex-col rounded-2xl border overflow-hidden transition-all ${isUnavailable ? 'border-white/5 bg-white/2 opacity-60' : 'border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5'}`}>
      <Link to={`/shop/${item.id}`} className="block relative">
        <div className="aspect-[4/3] w-full bg-black/30 overflow-hidden">
          <img
            src={item.imageUrl ?? item.image ?? '/og-image.png'}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="absolute top-2 right-2">
          <StockBadge item={item} />
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/shop/${item.id}`} className="text-white font-semibold text-[15px] leading-snug hover:underline">
            {item.name}
          </Link>
          {item.brand ? (
            <span className="shrink-0 text-white/30 text-[11px] uppercase tracking-widest mt-0.5">{item.brand}</span>
          ) : null}
        </div>

        {(item.sensor || item.mount) ? (
          <p className="text-white/40 text-xs">
            {[item.sensor, item.mount].filter(Boolean).join(' · ')}
          </p>
        ) : null}

        {Array.isArray(item.notes) && item.notes.length ? (
          <div className="flex flex-wrap gap-1">
            {item.notes.map((n) => (
              <span key={n} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/50">
                {n}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto pt-3 border-t border-white/8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-white font-bold">€{item.priceDay}</span>
              <span className="text-white/50 text-xs"> / jour</span>
            </div>
            {item.priceWeek ? (
              <span className="text-white/40 text-xs">€{item.priceWeek} / semaine</span>
            ) : null}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => !isUnavailable && onAdd(item)}
              disabled={isUnavailable}
              className={[
                'flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                isUnavailable
                  ? 'bg-white/5 text-white/25 border border-white/8 cursor-not-allowed'
                  : added
                  ? 'bg-white/15 text-white border border-white/20 cursor-default'
                  : 'bg-white text-black hover:bg-white/90 active:scale-95',
              ].join(' ')}
            >
              <CartIcon />
              {isUnavailable ? 'Indisponible' : added ? 'Ajouté ✓' : 'Ajouter'}
            </button>
            <Link
              to={`/shop/${item.id}`}
              className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white/70 hover:text-white hover:border-white/30 transition-colors"
            >
              Voir
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ShopPage() {
  const [rows, setRows] = useState(FALLBACK_PRODUCTS)
  const [categories, setCategories] = useState(FALLBACK_CATS)
  const [activeCategory, setActiveCategory] = useState('all')
  const [added, setAdded] = useState({})

  useEffect(() => {
    let mounted = true
    fetchProducts()
      .then((items) => {
        if (!mounted) return
        if (Array.isArray(items) && items.length) {
          setRows(items.map((p) => ({ ...p, image: p.image ?? '/og-image.png', notes: p.notes ?? [] })))
        }
      })
      .catch(() => {})
    api.get('/categories')
      .then((res) => {
        if (!mounted) return
        const cats = res?.data?.data
        if (Array.isArray(cats) && cats.length) setCategories(cats)
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  function handleAdd(item) {
    addToCart(item, 1)
    setAdded((prev) => ({ ...prev, [item.id]: true }))
    setTimeout(() => setAdded((prev) => ({ ...prev, [item.id]: false })), 1800)
  }

  const grouped = useMemo(() => {
    const visibleRows = activeCategory === 'all' ? rows : rows.filter((p) => p.category === activeCategory)
    if (activeCategory !== 'all') {
      const cat = categories.find((c) => (c.slug ?? c.id) === activeCategory)
      return [{ id: activeCategory, label: cat?.label ?? activeCategory, items: visibleRows }]
    }
    const map = new Map()
    categories.forEach((c) => map.set(c.slug ?? c.id, []))
    rows.forEach((p) => {
      if (!map.has(p.category)) map.set(p.category, [])
      map.get(p.category).push(p)
    })
    return categories
      .map((c) => ({ id: c.slug ?? c.id, label: c.label, items: map.get(c.slug ?? c.id) ?? [] }))
      .filter((g) => g.items.length > 0)
  }, [rows, categories, activeCategory])

  return (
    <div className="min-h-screen">
      <Container className="px-4">
        <MotionDiv
          className="pt-20 pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-end justify-between">
            <motion.h1
              className="font-bold text-white leading-none tracking-tight"
              style={{ fontFamily: '"Syne", sans-serif', fontSize: 'clamp(44px, 8vw, 96px)' }}
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              Location
            </motion.h1>
            <Link to="/cart" className="text-white/70 text-sm hover:text-white flex items-center gap-2">
              <CartIcon />
              Panier
            </Link>
          </div>
          <hr className="border-t border-white/10 mt-6" />
        </MotionDiv>
      </Container>

      {/* Category filter tabs */}
      <Container className="px-4 pb-6">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={[
              'rounded-full border px-4 py-1.5 text-sm transition-colors',
              activeCategory === 'all'
                ? 'border-white bg-white text-black font-medium'
                : 'border-white/15 text-white/60 hover:text-white hover:border-white/30',
            ].join(' ')}
          >
            Tout
          </button>
          {categories.map((cat) => {
            const key = cat.slug ?? cat.id
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={[
                  'rounded-full border px-4 py-1.5 text-sm transition-colors',
                  activeCategory === key
                    ? 'border-white bg-white text-black font-medium'
                    : 'border-white/15 text-white/60 hover:text-white hover:border-white/30',
                ].join(' ')}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </Container>

      <Container className="px-4 pb-16">
        <div className="grid gap-12">
          {grouped.map((group) => (
            <section key={group.id}>
              <div className="mb-5 flex items-center justify-between">
                <h2
                  className="text-white font-bold"
                  style={{ fontFamily: '"Syne", sans-serif', fontSize: 'clamp(20px, 2.8vw, 28px)' }}
                >
                  {group.label}
                </h2>
                <span className="text-white/30 text-sm">
                  {group.items.length} article{group.items.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {group.items.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    onAdd={handleAdd}
                    added={!!added[item.id]}
                  />
                ))}
              </div>
            </section>
          ))}
          {grouped.length === 0 ? (
            <p className="text-white/40 py-12 text-center">Aucun article dans cette catégorie.</p>
          ) : null}
        </div>
      </Container>
    </div>
  )
}

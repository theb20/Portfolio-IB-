import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Container from '../ui/Container.jsx'
import { navItems, site } from '../data/site.js'
import { ShoppingCart } from 'lucide-react'
import { getCart } from '../lib/cart.js'

const MotionHeader = motion.header
const MotionDiv = motion.div
const MotionButton = motion.button
const MotionLink = motion.create(NavLink)

export default function SiteHeader() {
  const location = useLocation()
  const items = useMemo(() => navItems, [])
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [cartCount, setCartCount] = useState(() => getCart().reduce((sum, i) => sum + (Number(i?.qty) || 0), 0))
  const [toast, setToast] = useState({ open: false, name: '', qty: 0, count: 0 })
  const lastY = useRef(0)
  const toastTimer = useRef(null)

  const isCartPage = location.pathname === '/cart'

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 12)
      const down = y > lastY.current
      lastY.current = y
      setHidden(down && y > 120 && !open)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [open])

  useEffect(() => {
    const refresh = () => {
      const count = getCart().reduce((sum, i) => sum + (Number(i?.qty) || 0), 0)
      setCartCount(count)
      if (count <= 0) setToast((t) => ({ ...t, open: false }))
    }

    const onCart = (e) => {
      const detail = e?.detail ?? {}
      const count = Number(detail?.count)
      const nextCount = Number.isFinite(count) ? count : getCart().reduce((sum, i) => sum + (Number(i?.qty) || 0), 0)
      setCartCount(nextCount)
      if (nextCount <= 0) setToast((t) => ({ ...t, open: false }))

      if (detail?.action === 'add') {
        if (toastTimer.current) clearTimeout(toastTimer.current)
        const name = String(detail?.item?.name ?? '')
        const qty = Number(detail?.item?.qty ?? 1)
        setToast({ open: true, name, qty: Number.isFinite(qty) ? qty : 1, count: nextCount })
        toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, open: false })), 2200)
      }
    }

    window.addEventListener('pid_cart', onCart)
    window.addEventListener('storage', refresh)
    refresh()
    return () => {
      window.removeEventListener('pid_cart', onCart)
      window.removeEventListener('storage', refresh)
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  return (
    <>
      {!isCartPage && (
      <div className='relative'>
        <MotionHeader
          className="fixed inset-x-0 top-0 z-50"
          initial={false}
          animate={{ y: hidden ? -96 : 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className={[
              'pointer-events-none absolute inset-0 border-b transition-opacity duration-500',
              scrolled ? 'opacity-100 border-white/10' : 'opacity-0 border-transparent',
            ].join(' ')}
          />
          <div
            className={[
              'absolute inset-0 transition-all duration-500',
              scrolled
                ? 'bg-[rgba(10, 9, 6, 0.72)] backdrop-blur-md'
                : 'bg-[linear-gradient(to_bottom,rgba(0,0,0,.55),transparent)]',
            ].join(' ')}
          >
            <div className="header-glow" />
          </div>

          <Container className=" px-2 relative flex h-20 items-center justify-between">
            <NavLink to="/" className="group inline-flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full  bg-white/5 text-white">
                <img src="/logo-ib-white.png" alt="" />
              </span>
              <span className="text-sm font-semibold tracking-wide text-white">
                {site.name}
              </span>
            </NavLink>

            <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 backdrop-blur md:flex">
              {items.map((item) => {
                const active = location.pathname === item.to
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={[
                      'relative rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.22em] transition-colors',
                      active ? 'text-black' : 'text-white/70 hover:text-white',
                    ].join(' ')}
                  >
                    {active ? (
                      <MotionDiv
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-white"
                        transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                      />
                    ) : null}
                    <span className="relative z-10">{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>

            <div className="flex items-center gap-2">
              <AnimatePresence initial={false}>
                {cartCount > 0 ? (
                  <MotionLink
                    key="cart"
                    to="/cart"
                    className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur hover:bg-white/10"
                    whileTap={{ scale: 0.96 }}
                    aria-label="Panier"
                    initial={{ opacity: 0, scale: 0.9, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -6 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ShoppingCart size={18} />
                    <motion.span
                      key={cartCount}
                      className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-semibold text-black"
                      initial={{ scale: 0.85 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {cartCount}
                    </motion.span>
                  </MotionLink>
                ) : null}
              </AnimatePresence>

            

              <MotionButton
                type="button"
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur hover:bg-white/10 ${
                  open ? '' : 'md:hidden'
                }`}
                onClick={() => setOpen((v) => !v)}
                whileTap={{ scale: 0.96 }}
                aria-label={open ? 'Close menu' : 'Open menu'}
              >
                <span className="relative h-4 w-5">
                  <span
                    className={[
                      'absolute left-0 top-0 h-[2px] w-full bg-current transition-transform duration-300',
                      open ? 'translate-y-[7px] rotate-45' : '',
                    ].join(' ')}
                  />
                  <span
                    className={[
                      'absolute left-0 top-[7px] h-[2px] w-full bg-current transition-opacity duration-200',
                      open ? 'opacity-0' : 'opacity-100',
                    ].join(' ')}
                  />
                  <span
                    className={[
                      'absolute left-0 bottom-0 h-[2px] w-full bg-current transition-transform duration-300',
                      open ? '-translate-y-[7px] -rotate-45' : '',
                    ].join(' ')}
                  />
                </span>
              </MotionButton>
            </div>
          </Container>
          
        </MotionHeader>

        <AnimatePresence>
          {toast.open ? (
            <MotionDiv
              className="fixed right-4 top-24 z-[60] w-[320px] max-w-[calc(100vw-2rem)]"
              initial={{ x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 24, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <NavLink
                to="/cart"
                className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-[rgba(10,9,6,0.75)] p-4 text-white backdrop-blur-md"
                onClick={() => setToast((t) => ({ ...t, open: false }))}
              >
                <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white">
                  <ShoppingCart size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Ajouté au panier</p>
                  <p className="mt-0.5 text-xs text-white/70 truncate">
                    {toast.name ? `${toast.qty > 1 ? `${toast.qty}× ` : ''}${toast.name}` : 'Article ajouté'}
                  </p>
                </div>
                <div className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/80">
                  {toast.count}
                </div>
              </NavLink>
            </MotionDiv>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {open ? (
            <MotionDiv
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <MotionDiv
                className="absolute inset-0 bg-[rgba(6,10,8,0.88)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <MotionDiv
                className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'repeat',
                  backgroundSize: '220px 220px',
                }}
              />

              <Container className="relative z-10 px-5 flex h-full items-center">
                <MotionDiv
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { staggerChildren: 0.06 },
                    },
                  }}
                  className="w-full"
                >
                  <div className="grid gap-10 md:grid-cols-2">
                    <div className="space-y-6">
                      {items.map((item, idx) => (
                        <MotionDiv
                          key={item.to}
                          variants={{
                            hidden: { opacity: 0, y: 10 },
                            show: { opacity: 1, y: 0 },
                          }}
                        >
                          <NavLink
                            to={item.to}
                            onClick={() => setOpen(false)}
                            className="group inline-flex items-baseline gap-4"
                          >
                            <span className="text-xs uppercase tracking-[0.28em] text-white/45">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="text-5xl font-semibold tracking-tight text-white group-hover:text-[var(--accent)] md:text-6xl">
                              {item.label}
                            </span>
                          </NavLink>
                        </MotionDiv>
                      ))}
                    </div>

                    <div className="space-y-6 md:justify-self-end">
                      <p className="max-w-sm text-sm leading-relaxed text-white/70">
                        {site.tagline}
                      </p>
                      <NavLink
                        to="/contact"
                        onClick={() => setOpen(false)}
                        className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:opacity-90"
                      >
                        Order service
                      </NavLink>
                    </div>
                  </div>
                </MotionDiv>
              </Container>
            </MotionDiv>
          ) : null}
        </AnimatePresence>

        
      </div>
        )}
    </>
  )
}

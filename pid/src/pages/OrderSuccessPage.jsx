import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import Container from '../ui/Container.jsx'

/* ─── Animated checkmark ─────────────────────────────── */
function CheckmarkCircle({ visible }) {
  return (
    <svg
      viewBox="0 0 80 80"
      width="80"
      height="80"
      aria-hidden="true"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease 0.3s',
      }}
    >
      <circle
        cx="40"
        cy="40"
        r="36"
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1.5"
      />
      <circle
        cx="40"
        cy="40"
        r="36"
        fill="none"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="1.5"
        strokeDasharray="226"
        strokeDashoffset={visible ? 0 : 226}
        strokeLinecap="round"
        style={{
          transformOrigin: '40px 40px',
          transform: 'rotate(-90deg)',
          transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1) 0.5s',
        }}
      />
      <polyline
        points="24,40 35,51 56,29"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="44"
        strokeDashoffset={visible ? 0 : 44}
        style={{
          transition: 'stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1) 1.1s',
        }}
      />
    </svg>
  )
}

/* ─── Decorative film strip ──────────────────────────── */
function FilmStrip({ visible }) {
  return (
    <div
      className="flex items-center gap-1 opacity-20"
      aria-hidden="true"
      style={{ transition: 'opacity 1.5s ease 1.2s', opacity: visible ? 0.2 : 0 }}
    >
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="h-5 w-5 rounded-sm border border-white/40 bg-white/5"
          style={{ opacity: i === 6 || i === 7 ? 0 : 1 }}
        />
      ))}
    </div>
  )
}

/* ─── Main page ─────────────────────────────────────── */
export default function OrderSuccessPage() {
  const [params] = useSearchParams()
  const orderId = params.get('order_id') ?? ''
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0906]"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }}
    >
      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.75) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Subtle glow behind check */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 320,
          height: 320,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -60%)',
        }}
        aria-hidden="true"
      />

      <Container className="relative z-10 flex flex-col items-center py-20 text-center">
        {/* SMPTE colour bars */}
        <div className="mb-10 flex h-2 w-40 overflow-hidden rounded-full opacity-40" aria-hidden="true">
          {['#c0c0c0','#c0c000','#00c0c0','#00c000','#c000c0','#c00000','#0000c0'].map((c, i) => (
            <div key={i} style={{ background: c, flex: 1 }} />
          ))}
        </div>

        {/* Checkmark */}
        <div className="mb-8">
          <CheckmarkCircle visible={visible} />
        </div>

        {/* Title */}
        <h1
          className="mb-3 font-mono text-[clamp(28px,6vw,56px)] font-bold leading-none tracking-tight text-white"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.8s ease 0.8s',
            letterSpacing: '-0.03em',
            textShadow: '0 0 60px rgba(255,255,255,0.08)',
          }}
        >
          Merci !
        </h1>

        {/* Separator */}
        <div
          className="mb-6 flex items-center gap-4"
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease 0.9s' }}
        >
          <div className="h-px w-10 bg-white/20" />
          <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-white/30">
            Commande confirmée
          </span>
          <div className="h-px w-10 bg-white/20" />
        </div>

        {/* Message */}
        <p
          className="mb-2 max-w-sm font-mono text-base leading-relaxed text-white/60"
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease 1s' }}
        >
          Votre commande a bien été reçue.
        </p>
        <p
          className="mb-1 max-w-sm font-mono text-sm leading-relaxed text-white/40"
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease 1.05s' }}
        >
          Un email de confirmation vous a été envoyé.
        </p>
        <p
          className="mb-8 max-w-sm font-mono text-sm leading-relaxed text-white/30"
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease 1.1s' }}
        >
          Ibrahima reviendra vers vous prochainement.
        </p>

        {/* Order ID badge */}
        {orderId ? (
          <div
            className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 font-mono text-sm text-white/50"
            style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease 1.15s' }}
          >
            <span className="text-white/25">Commande</span>
            <span className="text-white/70">#{orderId}</span>
          </div>
        ) : (
          <div className="mb-10" />
        )}

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center gap-3"
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease 1.2s' }}
        >
          <Link
            to="/shop"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-white/15 bg-white/5 px-7 py-3 font-mono text-sm text-white/70 backdrop-blur-sm transition-all duration-300 hover:border-white/35 hover:bg-white/10 hover:text-white"
          >
            <span
              className="absolute inset-0 -translate-x-full bg-white/5 transition-transform duration-500 group-hover:translate-x-0"
              aria-hidden="true"
            />
            <span className="relative">← Retour à la boutique</span>
          </Link>

          <Link
            to="/"
            className="font-mono text-xs text-white/25 hover:text-white/50 transition-colors"
          >
            Accueil
          </Link>
        </div>

        {/* Film strip footer */}
        <div className="mt-20">
          <FilmStrip visible={visible} />
          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.4em] text-white/15">
            Ibrahima Baby — Location de matériel
          </p>
        </div>
      </Container>
    </div>
  )
}

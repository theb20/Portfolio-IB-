import { Link } from 'react-router'
import { useEffect, useRef, useState } from 'react'
import Container from '../ui/Container.jsx'

/* ─── Grain canvas overlay ──────────────────────────── */
function FilmGrain() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let frame
    let t = 0

    function resize() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function draw() {
      const { width, height } = canvas
      const img = ctx.createImageData(width, height)
      const d   = img.data
      t++
      // sparse random grain — only ~18 % of pixels get noise
      for (let i = 0; i < d.length; i += 4) {
        if (Math.random() > 0.18) continue
        const v = (Math.random() * 80) | 0
        d[i]     = v
        d[i + 1] = v
        d[i + 2] = v
        d[i + 3] = 28 + (Math.random() * 22) | 0
      }
      ctx.putImageData(img, 0, 0)
      frame = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 mix-blend-overlay"
      aria-hidden="true"
    />
  )
}

/* ─── Countdown numbers (8mm countdown style) ──────── */
const COUNTDOWN = [8, 7, 6, 5, 4, 3, 2, 1]

function CountdownReel({ onDone }) {
  const [index, setIndex] = useState(0)
  const [flicker, setFlicker] = useState(false)

  useEffect(() => {
    if (index >= COUNTDOWN.length) {
      onDone()
      return
    }
    // random flicker mid-frame
    const flickerTimer = setTimeout(() => setFlicker(true), 60)
    const nextTimer    = setTimeout(() => {
      setFlicker(false)
      setIndex(i => i + 1)
    }, 220)

    return () => {
      clearTimeout(flickerTimer)
      clearTimeout(nextTimer)
    }
  }, [index, onDone])

  if (index >= COUNTDOWN.length) return null

  const num = COUNTDOWN[index]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0906]"
      style={{ opacity: flicker ? 0.55 : 1, transition: 'opacity 0.04s' }}
      aria-hidden="true"
    >
      {/* outer circle */}
      <svg
        viewBox="0 0 320 320"
        width="320"
        height="320"
        className="absolute"
        style={{ filter: 'contrast(1.1)' }}
      >
        {/* scratches */}
        <line x1="158" y1="0"   x2="162" y2="320" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
        <line x1="100" y1="0"   x2="104" y2="320" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
        <line x1="220" y1="0"   x2="216" y2="320" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
        {/* big circle */}
        <circle cx="160" cy="160" r="148" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none"/>
        {/* cross-hairs */}
        <line x1="12"  y1="160" x2="308" y2="160" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8"/>
        <line x1="160" y1="12"  x2="160" y2="308" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8"/>
        {/* small corner pips */}
        <circle cx="160" cy="160" r="4" fill="rgba(255,255,255,0.2)"/>
        <circle cx="160" cy="40"  r="3" fill="rgba(255,255,255,0.15)"/>
        <circle cx="160" cy="280" r="3" fill="rgba(255,255,255,0.15)"/>
        <circle cx="40"  cy="160" r="3" fill="rgba(255,255,255,0.15)"/>
        <circle cx="280" cy="160" r="3" fill="rgba(255,255,255,0.15)"/>
        {/* rotating sweep arc */}
        <circle
          cx="160" cy="160" r="110"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="40"
          fill="none"
          strokeDasharray={`${((COUNTDOWN.length - index) / COUNTDOWN.length) * 691} 691`}
          strokeDashoffset="0"
          style={{ transformOrigin: '160px 160px', transform: 'rotate(-90deg)' }}
        />
      </svg>

      {/* the number */}
      <span
        className="relative z-10 select-none font-mono text-[148px] font-bold leading-none text-white"
        style={{
          fontVariantNumeric: 'tabular-nums',
          textShadow: '0 0 60px rgba(255,255,255,0.3)',
          letterSpacing: '-0.04em',
        }}
      >
        {num}
      </span>

      {/* frame counter bottom */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 font-mono text-xs tracking-[0.4em] text-white/30 uppercase">
        Frame {String(index * 24 + Math.floor(Math.random() * 24)).padStart(4, '0')}
      </div>
    </div>
  )
}

/* ─── Burn-through effect ───────────────────────────── */
function BurnThrough({ onDone }) {
  const [phase, setPhase] = useState('burn') // burn → white → done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('white'), 380)
    const t2 = setTimeout(() => { setPhase('done'); onDone() }, 700)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  if (phase === 'done') return null

  return (
    <div
      className="fixed inset-0 z-40"
      style={{
        background: phase === 'white'
          ? '#fffef0'
          : 'radial-gradient(ellipse 60% 40% at 50% 50%, #fffacd 0%, #f5c518 25%, #c84b00 55%, #3a0a00 75%, #0a0906 100%)',
        transition: phase === 'white' ? 'background 0.1s' : 'none',
      }}
      aria-hidden="true"
    />
  )
}

/* ─── Main 404 page ─────────────────────────────────── */
export default function NotFoundPage() {
  const [stage, setStage] = useState('countdown') // countdown → burn → content
  const [contentVisible, setContentVisible] = useState(false)

  useEffect(() => {
    if (stage === 'content') {
      const t = setTimeout(() => setContentVisible(true), 60)
      return () => clearTimeout(t)
    }
  }, [stage])

  return (
    <>
      <FilmGrain />

      {/* ── Countdown ── */}
      {stage === 'countdown' && (
        <CountdownReel onDone={() => setStage('burn')} />
      )}

      {/* ── Burn through ── */}
      {stage === 'burn' && (
        <BurnThrough onDone={() => setStage('content')} />
      )}

      {/* ── Content ── */}
      <div
        className="relative z-10 flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0906]"
        style={{
          opacity: contentVisible ? 1 : 0,
          transition: 'opacity 1.2s ease',
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

        {/* Horizontal scan line */}
        <div
          className="pointer-events-none fixed inset-x-0 z-0 h-px"
          style={{
            background: 'rgba(255,255,255,0.04)',
            top: '50%',
          }}
          aria-hidden="true"
        />

        <Container className="relative z-10 flex flex-col items-center py-20 text-center">

          {/* SMPT colour bars — decorative */}
          <div className="mb-10 flex h-2 w-40 overflow-hidden rounded-full opacity-60" aria-hidden="true">
            {['#c0c0c0','#c0c000','#00c0c0','#00c000','#c000c0','#c00000','#0000c0'].map((c, i) => (
              <div key={i} style={{ background: c, flex: 1 }} />
            ))}
          </div>

          {/* 404 */}
          <div className="relative mb-4 select-none">
            <span
              className="block font-mono text-[clamp(96px,22vw,200px)] font-bold leading-none text-white"
              style={{
                letterSpacing: '-0.04em',
                textShadow: contentVisible
                  ? '0 0 80px rgba(255,255,255,0.12), 0 0 200px rgba(255,255,255,0.04)'
                  : 'none',
                transition: 'text-shadow 2s ease',
              }}
            >
              404
            </span>
            {/* subtle under-exposure flicker overlay */}
            <span
              className="pointer-events-none absolute inset-0 block font-mono text-[clamp(96px,22vw,200px)] font-bold leading-none"
              style={{
                letterSpacing: '-0.04em',
                color: 'rgba(255, 250, 200, 0.06)',
                mixBlendMode: 'screen',
              }}
              aria-hidden="true"
            >
              404
            </span>
          </div>

          {/* Separator */}
          <div className="mb-8 flex items-center gap-4">
            <div className="h-px w-12 bg-white/20" />
            <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-white/30">
              Scene not found
            </span>
            <div className="h-px w-12 bg-white/20" />
          </div>

          {/* Copy */}
          <p
            className="mb-2 max-w-xs font-mono text-base leading-relaxed text-white/60"
            style={{ transition: 'opacity 1s ease 0.4s', opacity: contentVisible ? 1 : 0 }}
          >
            Cette scène a été coupée au montage.
          </p>
          <p
            className="mb-10 max-w-xs font-mono text-sm leading-relaxed text-white/30"
            style={{ transition: 'opacity 1s ease 0.6s', opacity: contentVisible ? 1 : 0 }}
          >
            La page n'existe pas ou a été déplacée.
          </p>

          {/* CTA */}
          <div
            style={{ transition: 'opacity 1s ease 0.8s', opacity: contentVisible ? 1 : 0 }}
          >
            <Link
              to="/"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-white/15 bg-white/5 px-7 py-3 font-mono text-sm text-white/70 backdrop-blur-sm transition-all duration-300 hover:border-white/35 hover:bg-white/10 hover:text-white"
            >
              <span
                className="absolute inset-0 -translate-x-full bg-white/5 transition-transform duration-500 group-hover:translate-x-0"
                aria-hidden="true"
              />
              <span className="relative">← Retour à l'accueil</span>
            </Link>
          </div>

          {/* Film strip footer */}
          <div
            className="mt-20 flex items-center gap-1 opacity-20"
            aria-hidden="true"
            style={{ transition: 'opacity 1.5s ease 1s', opacity: contentVisible ? 0.2 : 0 }}
          >
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className="h-5 w-5 rounded-sm border border-white/40 bg-white/5"
                style={{ opacity: i === 6 || i === 7 ? 0 : 1 }}
              />
            ))}
          </div>
          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.4em] text-white/15">
            EXTRÉMITÉ DE LA BOBINE
          </p>

        </Container>
      </div>
    </>
  )
}
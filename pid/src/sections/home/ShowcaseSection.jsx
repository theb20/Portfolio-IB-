import { motion, useReducedMotion } from 'framer-motion'
import { useMemo, useRef } from 'react'
import Container from '../../ui/Container.jsx'

const MotionDiv = motion.div

export default function ShowcaseSection() {
  const prefersReducedMotion = useReducedMotion()
  const cardRef = useRef(null)

  const chips = useMemo(
    () => [
      'Montage',
      'Cadrage',
      'Documentaire',
      'Clip',
      'Film de marque',
      'Direction artistique',
      'Sound design',
      'Sous-titres',
      'Delivery',
    ],
    [],
  )

  const stats = useMemo(
    () => [
      { value: '60+', label: 'Projets livrés' },
      { value: '4 ans', label: "D'expérience" },
      { value: '100%', label: 'Focus' },
    ],
    [],
  )

  return (
    <section className="relative w-full overflow-hidden py-10 sm:py-8">
      <Container fluid className="relative px-4 sm:px-6 lg:px-10">
        {/* Noise */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'repeat',
            backgroundSize: '220px 220px',
          }}
        />

        {/* Glow */}
        <MotionDiv
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-[520px] w-[980px] -translate-x-1/2 rounded-full blur-[90px]"
          animate={
            prefersReducedMotion
              ? {}
              : { opacity: [0.12, 0.22, 0.12], y: [0, 18, 0] }
          }
          transition={
            prefersReducedMotion
              ? {}
              : { duration: 7.5, repeat: Infinity, ease: 'easeInOut' }
          }
          style={{
            background:
              'radial-gradient(closest-side, rgba(212,175,55,.20), transparent 70%)',
          }}
        />

        {/* Card */}
        <MotionDiv
          ref={cardRef}
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20% 0px -10% 0px' }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[rgba(10,10,15,.72)] p-5 backdrop-blur-md sm:p-10 lg:p-12"
          onMouseMove={(e) => {
            const el = e.currentTarget
            const rect = el.getBoundingClientRect()
            el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
            el.style.setProperty('--my', `${e.clientY - rect.top}px`)
          }}
        >
          {/* Spotlight */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.85]"
            style={{
              background:
                'radial-gradient(600px circle at var(--mx, 50%) var(--my, 30%), rgba(255,255,255,.10), transparent 60%), radial-gradient(720px circle at 75% 85%, rgba(212,175,55,.16), transparent 65%)',
            }}
          />
          <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,rgba(255,255,255,.22),transparent)]" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(to_right,transparent,rgba(255,255,255,.22),transparent)]" />

          {/* Grid */}
          <div className="relative grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">

            {/* ── LEFT ── */}
            <div className="min-w-0 space-y-5 lg:col-span-7 lg:space-y-6">

              {/* À propos / Press kit */}
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.28em] text-white/55">À propos</p>
                <p className="text-xs uppercase tracking-[0.28em] text-white/35">Press kit</p>
              </div>

              {/* Heading */}
              <h2 className="text-[clamp(26px,7vw,72px)] font-semibold leading-[0.92] tracking-tight text-white">
                Une direction.
                <br />
                Un rythme.
                <br />
                Une signature.
              </h2>

              {/* Body — break-words corrige l'overflow du texte */}
              <p className="break-words text-sm leading-relaxed text-white/65 sm:text-base lg:text-lg">
                Je produis des images au rendu cinématographique — documentaires,
                clips, films de marque. Chaque projet est pensé comme une scène :
                intention, lumière, mouvement, et montage.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-2 pt-1 sm:gap-3">
                <a
                  href="/projects"
                  className="inline-flex items-center rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black hover:opacity-90 sm:px-5"
                >
                  Voir les projets
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 sm:px-5"
                >
                  Me contacter
                </a>
                <span className="text-xs uppercase tracking-[0.26em] text-white/35">
                  @ibcreative
                </span>
              </div>

              {/* Chips — flex-wrap, elles ne débordent plus */}
              <div className="flex flex-wrap gap-2">
                {chips.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* ── RIGHT ── */}
            <div className="min-w-0 lg:col-span-5">

              {/* Stats — 3 colonnes fixes sur mobile, 1 colonne sur lg */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-1 lg:gap-4">
                {stats.map((s, i) => (
                  <MotionDiv
                    key={s.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-5"
                    whileHover={
                      prefersReducedMotion
                        ? {}
                        : { y: -2, transition: { duration: 0.2 } }
                    }
                  >
                    <p className="text-xl font-semibold leading-none text-white sm:text-3xl">
                      {s.value}
                    </p>
                    <p className="mt-1.5 text-[9px] uppercase tracking-[0.16em] text-white/45 sm:mt-2 sm:text-xs sm:tracking-[0.24em]">
                      {s.label}
                    </p>
                  </MotionDiv>
                ))}
              </div>

              {/* Ticker */}
              <MotionDiv
                aria-hidden="true"
                className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/30 sm:mt-4 lg:mt-6"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              >
                <MotionDiv
                  className="flex gap-6 whitespace-nowrap px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-white/35 sm:px-6 sm:py-5 sm:text-xs sm:tracking-[0.34em]"
                  animate={prefersReducedMotion ? {} : { x: ['0%', '-50%'] }}
                  transition={
                    prefersReducedMotion
                      ? {}
                      : { duration: 18, repeat: Infinity, ease: 'linear' }
                  }
                >
                  {[...chips, ...chips].map((t, i) => (
                    <span key={`${t}-${i}`} className="inline-flex items-center gap-3">
                      <span className="h-1 w-1 rounded-full bg-white/35" />
                      {t}
                    </span>
                  ))}
                </MotionDiv>
              </MotionDiv>
            </div>
          </div>
        </MotionDiv>
      </Container>
    </section>
  )
}
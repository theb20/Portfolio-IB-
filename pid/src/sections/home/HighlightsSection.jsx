import { Link } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Container from '../../ui/Container.jsx'
import { fetchProjects } from '../../lib/api.js'

const MotionDiv = motion.div

const FALLBACK_PROJECTS = [
  { src: '/og-image.png', title: 'Lumière Brute', category: 'Documentaire', year: '2024', to: '/projects/lumiere-brute' },
  { src: '/logo-ib.png', title: 'Silences', category: 'Court-métrage', year: '2024', to: '/projects/silences' },
  { src: '/assets/hero.png', title: 'Mécanique', category: 'Clip', year: '2023', to: '/projects/mecanique' },
  { src: '/og-image.png', title: 'Fragment III', category: 'Publicité', year: '2023', to: '/projects/fragment' },
]

export default function HighlightsSection() {
  const [projects, setProjects] = useState(FALLBACK_PROJECTS)
  const [active, setActive] = useState(0)

  useEffect(() => {
    let mounted = true
    fetchProjects()
      .then((items) => {
        if (!mounted) return
        if (Array.isArray(items) && items.length) {
          setProjects(
            items.slice(0, 4).map((p) => ({
              src: p.image || p.thumbnail || '/og-image.png',
              title: p.title,
              category: p.role ?? p.tags?.[0] ?? '',
              year: String(p.year ?? ''),
              to: `/projects/${p.slug}`,
            }))
          )
        }
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])
  const current = projects[Math.min(active, projects.length - 1)]

  return (
    <section className="w-screen overflow-x-hidden">
      <Container fluid>
        <MotionDiv
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20% 0px -10% 0px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full overflow-hidden rounded-none bg-[rgba(10,10,15,.72)] backdrop-blur-md"
        >
          <div className="container mx-auto">
            <div className="absolute inset-0">
              <div className="header-glow" />
              <div
                className="absolute inset-0 opacity-[0.14] mix-blend-overlay"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'repeat',
                  backgroundSize: '240px 240px',
                }}
              />
              <MotionDiv
                className="absolute inset-0"
                animate={{ opacity: [0.12, 0.22, 0.12] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  background:
                    'radial-gradient(900px 420px at 30% 35%, rgba(255,255,255,.10), transparent 70%), radial-gradient(700px 360px at 70% 80%, rgba(212,175,55,.18), transparent 70%)',
                }}
              />
              <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,rgba(255,255,255,.25),transparent)]" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(to_right,transparent,rgba(255,255,255,.25),transparent)]" />
              <p className="pointer-events-none absolute left-8 top-10 hidden select-none mt-6 text-[192px] font-semibold tracking-tight text-white/5 lg:block">
                FILMOGRAPHY
              </p>
            </div>

            <div className="relative grid gap-10 px-7 py-10 sm:px-12 sm:py-14 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-5">
                <div className="flex items-center justify-between gap-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/55">
                    Projets
                  </p>
                  <Link
                    to="/projects"
                    className="text-[11px] uppercase tracking-[0.26em] text-white/70 hover:text-white"
                  >
                    Tout voir
                  </Link>
                </div>

                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                  <AnimatePresence mode="wait" initial={false}>
                    <MotionDiv
                      key={current?.to}
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <img
                        src={current?.src}
                        alt=""
                        className="h-full w-full object-cover"
                        style={{ filter: 'grayscale(1)' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    </MotionDiv>
                  </AnimatePresence>

                  <div className="relative flex min-h-[380px] items-end p-6 sm:min-h-[440px] sm:p-8">
                    <div className="w-full space-y-3">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">
                        {current?.year} • {current?.category}
                      </p>
                      <p className="text-balance text-4xl font-semibold leading-[0.95] tracking-tight text-white sm:text-5xl">
                        {current?.title}
                      </p>
                      <div className="flex items-center justify-between gap-6 pt-2">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white">
                            {String(active + 1).padStart(2, '0')}
                          </span>
                          <span className="text-sm text-white/70">
                            Sélection premium
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/85">
                          Ouvrir
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M2 10L10 2M10 2H4M10 2V8"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="rounded-3xl border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between gap-6 px-6 py-5 sm:px-8">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/55">
                      Filmography
                    </p>
                    <p className="text-xs uppercase tracking-[0.28em] text-white/35">
                      Curated list
                    </p>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="divide-y divide-white/10">
                    {projects.map((p, idx) => {
                      const isActive = idx === active
                      return (
                        <Link
                          key={p.to}
                          to={p.to}
                          onMouseEnter={() => setActive(idx)}
                          onFocus={() => setActive(idx)}
                          className="group relative block px-6 py-6 transition-colors hover:bg-white/5 sm:px-8"
                        >
                          <MotionDiv
                            className="absolute left-0 top-0 h-full w-[2px] bg-[var(--accent)]"
                            initial={false}
                            animate={{ opacity: isActive ? 1 : 0, scaleY: isActive ? 1 : 0.5 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            style={{ transformOrigin: 'top' }}
                          />
                          <div className="flex items-start justify-between gap-6">
                            <div className="flex items-start gap-5">
                              <p className="text-lg font-semibold tracking-tight text-white/70">
                                {String(idx + 1).padStart(2, '0')}
                              </p>
                              <div className="space-y-1">
                                <p className="text-xs uppercase tracking-[0.26em] text-white/45">
                                  {p.year} • {p.category}
                                </p>
                                <p className="text-2xl font-semibold tracking-tight text-white">
                                  {p.title}
                                </p>
                              </div>
                            </div>
                            <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path
                                  d="M3 11L11 3M11 3H5M11 3V9"
                                  stroke="currentColor"
                                  strokeWidth="1.4"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MotionDiv>
      </Container>
    </section>
  )
}

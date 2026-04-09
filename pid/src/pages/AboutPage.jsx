import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import Container from '../ui/Container.jsx'
import { fetchContent } from '../lib/api.js'

const MotionDiv = motion.div

/* ─── constants ─────────────────────────────────────── */
const EASE = [0.16, 1, 0.3, 1]
const GOLD = '#c8a84b'
const BG   = '#0c0b09'

/* ─── Film grain ────────────────────────────────────── */
function Grain() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    let raf
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const draw = () => {
      const img = ctx.createImageData(c.width, c.height)
      const d = img.data
      for (let i = 0; i < d.length; i += 4) {
        if (Math.random() > 0.13) continue
        const v = (Math.random() * 60) | 0
        d[i] = d[i+1] = d[i+2] = v
        d[i+3] = 14 + ((Math.random() * 16) | 0)
      }
      ctx.putImageData(img, 0, 0)
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0 mix-blend-overlay opacity-60" aria-hidden="true" />
}

/* ─── Reveal ────────────────────────────────────────── */
const Reveal = ({ children, delay = 0, className = '' }) => {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-6% 0px' })
  return (
    <motion.div ref={ref} className={className}
      initial={reduced ? {} : { opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay, ease: EASE }}
    >{children}</motion.div>
  )
}

/* ─── Parallax wrapper ──────────────────────────────── */
const Parallax = ({ children, speed = 0.12 }) => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`])
  return <motion.div ref={ref} style={{ y }}>{children}</motion.div>
}

/* ─── Scene tag ─────────────────────────────────────── */
const Tag = ({ n, label }) => (
  <div className="mb-8 flex items-center gap-3">
    <span className="font-mono text-[9px] tracking-[0.5em] uppercase" style={{ color: GOLD }}>
      SC.{String(n).padStart(2,'0')}
    </span>
    <div className="h-px flex-1" style={{ background: `${GOLD}22` }} />
    <span className="font-mono text-[9px] tracking-[0.5em] uppercase text-white/20">{label}</span>
  </div>
)

/* ─── Stat card ─────────────────────────────────────── */
const Stat = ({ value, label, delay }) => (
  <Reveal delay={delay}>
    <div
      className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-500"
      style={{ border: '1px solid rgba(200,168,75,0.12)', background: 'rgba(200,168,75,0.04)' }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(200,168,75,0.08), transparent 70%)' }}
        aria-hidden="true"
      />
      <p className="text-3xl font-bold leading-none text-white">{value}</p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/35">{label}</p>
    </div>
  </Reveal>
)

/* ─── Service row ───────────────────────────────────── */
const Service = ({ num, title, desc, delay }) => (
  <Reveal delay={delay}>
    <div
      className="group flex gap-5 border-t py-5 transition-colors duration-300 hover:border-white/20"
      style={{ borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <span className="mt-0.5 shrink-0 font-mono text-[10px] tracking-[0.3em]" style={{ color: `${GOLD}80` }}>
        {String(num).padStart(2,'0')}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white/90 transition-colors duration-300 group-hover:text-white">
          {title}
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-white/40">{desc}</p>
      </div>
      <span
        className="ml-auto mt-0.5 shrink-0 font-mono text-xs opacity-0 transition-all duration-300 group-hover:opacity-100"
        style={{ color: GOLD }}
      >→</span>
    </div>
  </Reveal>
)

/* ─── Timeline entry ────────────────────────────────── */
const Entry = ({ year, role, note, delay }) => (
  <Reveal delay={delay}>
    <div className="group relative grid grid-cols-[90px_1fr] gap-6 border-b border-white/[0.06] py-5 last:border-0">
      {/* active bar on hover */}
      <div
        className="pointer-events-none absolute left-0 top-0 w-[2px] scale-y-0 rounded-full transition-transform duration-500 origin-top group-hover:scale-y-100"
        style={{ height: '100%', background: GOLD }}
        aria-hidden="true"
      />
      <div className="pl-4">
        <p className="font-mono text-[10px] leading-loose text-white/28">{year}</p>
      </div>
      <div>
        <p className="text-sm font-medium leading-snug text-white/80 transition-colors duration-300 group-hover:text-white">{role}</p>
        <p className="mt-1 font-mono text-[10px] text-white/30">{note}</p>
      </div>
    </div>
  </Reveal>
)

/* ─── Gear row ──────────────────────────────────────── */
const Gear = ({ label, value }) => (
  <div className="flex items-center justify-between border-b border-white/[0.06] py-3 last:border-0">
    <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/28">{label}</span>
    <span className="text-xs font-medium text-white/60">{value}</span>
  </div>
)

/* ─── Defaults ──────────────────────────────────────── */
const DEFAULT = {
  hero: {
    title: 'Vidéaste\n&\nMachiniste',
    year: '2025',
    meta: [['Spécialité', 'Cadrage · Montage'], ['Secteur', 'Influence · Spectacle'], ['Base', 'France'], ['Statut', 'Freelance']],
  },
  bio: {
    para1: "Vidéaste freelance centré sur le cadrage et le montage de contenus pour créateurs — clips, documentaires, films de marque.",
    para2: "En parallèle, j'interviens comme assistant sur des boîtes de production et comme machiniste du spectacle dans des théâtres et opéras — deux univers qui nourrissent la même obsession du cadre, de la lumière, du rythme.",
    quote: "Deux univers, une même obsession du cadre.",
    note: "↳ Les photographies prises en théâtre visibles dans le portfolio sont issues de ces prestations scéniques.",
  },
  stats: [
    { value: '60+', label: 'Projets livrés' },
    { value: '4 ans', label: "D'expérience" },
    { value: '2', label: 'Univers métiers' },
  ],
  services: [
    { title: 'Montage vidéo', desc: 'Long format documentaire, court format Reels / Shorts, film de marque, clip artistique.' },
    { title: 'Cadrage & captation', desc: "Prise de vue solo ou en équipe. Direction d'image pour influenceurs et créateurs de contenu." },
    { title: 'Machiniste plateau', desc: 'Spectacle vivant, théâtre, opéra. Gestion des décors, cintres et équipements scéniques.' },
    { title: 'Post-production', desc: 'Sound design, sous-titres, étalonnage, delivery multi-plateforme.' },
  ],
  timeline: [
    { year: '2024–présent', role: 'Vidéaste freelance — contenus créateurs', note: 'Captation · Montage · Direction artistique' },
    { year: '2022–présent', role: 'Machiniste du spectacle', note: 'Théâtres · Opéras · Salles de spectacle' },
    { year: '2021–2024', role: 'Assistant production vidéo', note: 'Boîtes de prod — tournages institutionnels' },
    { year: '2020', role: 'Premiers projets indépendants', note: 'Clips · Documentaires courts' },
  ],
  gear: [
    ['Caméra', 'Sony FX3 / A7 IV'],
    ['Optiques', 'GM 24 · 50 · 85mm'],
    ['Stabilisation', 'DJI RS3 Pro'],
    ['Montage', 'Premiere · DaVinci'],
    ['Son', 'Rode NTG5 · Zoom F6'],
    ['Delivery', 'Frame.io · WeTransfer'],
  ],
  cta: {
    heading: 'Un projet en tête ?',
    body: 'Disponible pour missions freelance, collaborations régulières ou tournages ponctuels.',
    video: '/vds/og1.mp4',
    buttonLabel: 'Me contacter',
  },
}

/* ════════════════════════════════════════════════════ */
export default function AboutPage() {
  const [c, setC] = useState(DEFAULT)

  useEffect(() => {
    let mounted = true
    fetchContent('about')
      .then((data) => {
        if (!mounted || !data) return
        setC((prev) => ({ ...prev, ...data }))
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  return (
    <div className="relative px-4 min-h-screen overflow-x-hidden" style={{ background: BG }}>
      <Grain />

      {/* radial vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 90% 80% at 50% 30%, transparent 45%, rgba(0,0,0,0.6) 100%)' }}
        aria-hidden="true"
      />

      {/* horizontal scan lines — very subtle */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, white 0px, white 1px, transparent 1px, transparent 3px)' }}
        aria-hidden="true"
      />

      <Container className="relative z-10 max-w-5xl py-20 sm:py-28 lg:py-32">

        {/* ══ HERO ══════════════════════════════════ */}
        <section className="mb-28">
          <Reveal>
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-8" style={{ background: GOLD }} />
              <span className="font-mono text-[9px] uppercase tracking-[0.55em] text-white/25">
                Dossier artistique · {c.hero.year}
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.07}>
            <h1 className="text-[clamp(60px,13vw,140px)] font-black uppercase leading-[0.82] tracking-[-0.03em] text-white">
              {c.hero.title.split('\n').map((line, i, arr) => (
                <span key={i}>
                  {line === '&' ? <span style={{ color: GOLD }}>&amp;</span> : line}
                  {i < arr.length - 1 ? <br /> : null}
                </span>
              ))}
            </h1>
          </Reveal>

          {/* meta strip */}
          <Reveal delay={0.16}>
            <div
              className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl sm:grid-cols-4"
              style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.07)' }}
            >
              {c.hero.meta.map(([k, v]) => (
                <div key={k} className="px-5 py-4" style={{ background: BG }}>
                  <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/25">{k}</p>
                  <p className="mt-1 text-sm font-medium text-white/70">{v}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ══ BIO ═══════════════════════════════════ */}
        <section className="mb-24">
          <Tag n={1} label="Biographie" />
          <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
            <div className="space-y-5">
              <Reveal delay={0.04}>
                <p className="text-lg leading-[1.8] text-white/75 sm:text-xl">{c.bio.para1}</p>
              </Reveal>
              <Reveal delay={0.09}>
                <p className="text-base leading-[1.85] text-white/45">{c.bio.para2}</p>
              </Reveal>
              <Reveal delay={0.14}>
                <div className="py-2 pl-5" style={{ borderLeft: `2px solid ${GOLD}` }}>
                  <p className="text-base italic leading-snug text-white/55 sm:text-lg">"{c.bio.quote}"</p>
                </div>
              </Reveal>
              <Reveal delay={0.18}>
                <p className="font-mono text-[11px] leading-relaxed text-white/22">{c.bio.note}</p>
              </Reveal>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {c.stats.map((s, i) => (
                <Stat key={s.label} value={s.value} label={s.label} delay={0.1 + i * 0.06} />
              ))}
            </div>
          </div>
        </section>

        {/* ══ SERVICES ══════════════════════════════ */}
        <section className="mb-24">
          <Tag n={2} label="Prestations" />
          <div className="divide-y" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.07)' }}>
            {c.services.map((s, i) => (
              <Service key={s.title} num={i + 1} title={s.title} desc={s.desc} delay={0.04 + i * 0.04} />
            ))}
          </div>
        </section>

        {/* ══ TIMELINE + GEAR ═══════════════════════ */}
        <section className="mb-24 grid gap-14 lg:grid-cols-[1fr_300px] lg:items-start">
          <div>
            <Tag n={3} label="Parcours" />
            {c.timeline.map((e, i) => (
              <Entry key={e.year} year={e.year} role={e.role} note={e.note} delay={0.05 + i * 0.05} />
            ))}
          </div>
          <div>
            <Tag n={4} label="Équipement" />
            <Reveal delay={0.08}>
              <div className="rounded-2xl px-5 py-2" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                {c.gear.map(([k, v]) => <Gear key={k} label={k} value={v} />)}
              </div>
            </Reveal>
            <Reveal delay={0.18}>
              <svg viewBox="0 0 200 140" className="mt-8 w-full opacity-[0.07]" aria-hidden="true">
                <rect x="2" y="48" width="196" height="90" rx="4" fill="none" stroke="white" strokeWidth="1.5"/>
                <rect x="2" y="2"  width="196" height="46" rx="4" fill="none" stroke="white" strokeWidth="1.5"/>
                {[0,1,2,3,4,5,6,7].map(i => (
                  <line key={i} x1={10+i*23} y1="2" x2={20+i*23} y2="48" stroke="white" strokeWidth="1.5"/>
                ))}
                <text x="14" y="76"  fontFamily="monospace" fontSize="10" fill="white">PROD: pid</text>
                <text x="14" y="92"  fontFamily="monospace" fontSize="10" fill="white">DIR: @ibcreative</text>
                <text x="14" y="108" fontFamily="monospace" fontSize="10" fill="white">SC: 001 · PR: 01 · CAM: A</text>
                <text x="14" y="124" fontFamily="monospace" fontSize="10" fill="white">MOS · JOUR · INT</text>
              </svg>
            </Reveal>
          </div>
        </section>

        {/* ══ CTA BAND ══════════════════════════════ */}
        <Reveal>
          <section className="relative overflow-hidden rounded-3xl p-8 sm:p-12" style={{ border: `1px solid ${GOLD}22`, background: `${GOLD}06` }}>
            {c.cta.video && (
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src={c.cta.video}
                autoPlay loop muted playsInline
              />
            )}
            <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: `repeating-linear-gradient(135deg, ${GOLD}08 0px, ${GOLD}08 1px, transparent 1px, transparent 32px)` }} aria-hidden="true" />
            <div className="pointer-events-none absolute -top-20 left-1/4 h-64 w-64 rounded-full blur-[80px]" style={{ background: `${GOLD}18` }} aria-hidden="true" />
            <div className="relative">
              <Tag n={5} label="Contact" />
              <h2 className="mb-3 text-[clamp(28px,5vw,56px)] font-black uppercase leading-tight tracking-tight text-white">
                {c.cta.heading}
              </h2>
              <p className="mb-8 max-w-md text-sm leading-relaxed text-white/40">{c.cta.body}</p>
              <a
                href="/contact"
                className="group inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-black transition-all duration-300 hover:opacity-90"
                style={{ background: GOLD }}
              >
                {c.cta.buttonLabel}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
            </div>
          </section>
        </Reveal>

      </Container>
    </div>
  )
}

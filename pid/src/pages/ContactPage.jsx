import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Container from '../ui/Container.jsx'

// ── Typewriter hook ──
function useTypewriter(text, speed = 48, delay = 400) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    let i = 0
    let timeout
    const start = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1))
        i++
        if (i >= text.length) clearInterval(interval)
      }, speed)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(start)
  }, [text])
  return displayed
}

// ── Canvas particules ──
function ParticlesCanvas() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let raf
    let W, H
    let particles = []

    function resize() {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }

    function init() {
      resize()
      particles = Array.from({ length: 72 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.2 + 0.3,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.18,
        alpha: Math.random() * 0.35 + 0.05,
      }))
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      particles.forEach((p) => {
        // Move
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0

        // Draw dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(120,220,160,${p.alpha})`
        ctx.fill()
      })

      // Draw lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 110) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(100,200,140,${0.06 * (1 - dist / 110)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      raf = requestAnimationFrame(draw)
    }

    init()
    draw()
    window.addEventListener('resize', init)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', init)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  )
}

// ── Champ expansible ──
function ExpandField({ id, label, type = 'text', placeholder, required, as: As = 'input', rows }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  function toggle() {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 120)
  }

  return (
    <div
      className="border-t border-white/[0.08] cursor-pointer"
      onClick={toggle}
    >
      <motion.div
        animate={{ paddingTop: open ? '16px' : '20px', paddingBottom: open ? '4px' : '20px' }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between"
      >
        <span
          className="text-[11px] uppercase tracking-[0.2em]"
          style={{ color: open || value ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)' }}
        >
          {label}
        </span>
        {!open && value && (
          <span className="text-white/30 text-[13px] font-light truncate max-w-[55%] text-right">
            {value}
          </span>
        )}
        {!open && !value && (
          <motion.span
            className="text-white/15 text-[20px] leading-none"
            whileHover={{ rotate: 45 }}
            transition={{ duration: 0.2 }}
          >
            +
          </motion.span>
        )}
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="field"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            {As === 'textarea' ? (
              <textarea
                ref={inputRef}
                id={id}
                name={id}
                rows={rows || 4}
                placeholder={placeholder}
                required={required}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={() => { if (!value) setOpen(false) }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  color: 'rgba(255,255,255,0.8)',
                  fontFamily: '"Syne", sans-serif',
                  fontSize: 'clamp(15px, 1.8vw, 18px)',
                  padding: '8px 0 20px',
                  resize: 'none',
                }}
              />
            ) : (
              <input
                ref={inputRef}
                id={id}
                name={id}
                type={type}
                placeholder={placeholder}
                required={required}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={() => { if (!value) setOpen(false) }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  color: 'rgba(255,255,255,0.8)',
                  fontFamily: '"Syne", sans-serif',
                  fontSize: 'clamp(15px, 1.8vw, 18px)',
                  padding: '8px 0 20px',
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Socials ──
const socials = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'YouTube',   href: 'https://youtube.com'   },
  { label: 'Vimeo',     href: 'https://vimeo.com'     },
  { label: 'LinkedIn',  href: 'https://linkedin.com'  },
]

const infos = [
  { label: 'Réponse',    value: '24 – 48h'      },
  { label: 'Basé à',     value: 'Paris, France'  },
  { label: 'Disponible', value: 'Projets 2025'   },
  { label: 'Langues',    value: 'FR · EN'        },
]

export default function ContactPage() {
  const title     = useTypewriter('Contact', 60, 500)
  const subtitle  = useTypewriter('Parlons-en.', 50, 1200)
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <>
      <style>{`
        .contact-bg { background: #07100c; }
        .rule        { border: none; border-top: 1px solid rgba(255,255,255,0.07); }
        .rule-heavy  { border: none; border-top: 2px solid rgba(255,255,255,0.5);  }

        .submit-btn {
          background: transparent;
          border: 1.5px solid rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.5);
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          padding: 16px 44px;
          border-radius: 999px;
          cursor: pointer;
          transition: border-color .3s, color .3s, background .3s;
        }
        .submit-btn:hover {
          border-color: rgba(255,255,255,0.55);
          color: #fff;
          background: rgba(255,255,255,0.04);
        }
        .social-link {
          display: inline-flex; align-items: center; gap: 10px;
          color: rgba(255,255,255,0.22);
          font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
          text-decoration: none;
          transition: color .3s;
        }
        .social-link:hover { color: rgba(255,255,255,0.7); }
        .email-link {
          color: rgba(255,255,255,0.5);
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          letter-spacing: -0.02em;
          text-decoration: none;
          transition: color .3s;
        }
        .email-link:hover { color: #fff; }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .cursor { display:inline-block; width:3px; height:0.85em; background:#fff; margin-left:3px; vertical-align:middle; animation: blink 1s step-end infinite; }
      `}</style>

      <div className="contact-bg px-4 min-h-screen relative overflow-hidden">

        {/* ── Fond particules ── */}
        <div className="absolute inset-0 pointer-events-none">
          <ParticlesCanvas />
          {/* Lueur verte haut-centre */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-[rgba(0,160,70,0.06)] blur-[90px]" />
        </div>

        {/* ── MASTHEAD typewriter ── */}
        <Container>
          <div className="pt-36 pb-10 relative">
            <div className="flex items-end justify-between">
              <h1
                className="font-bold text-white leading-none tracking-tight"
                style={{ fontFamily: '"Syne", sans-serif', fontSize: 'clamp(52px, 9vw, 120px)' }}
              >
                {title}
                {title.length < 'Contact'.length && <span className="cursor" />}
              </h1>
              <p className="hidden sm:block text-white/15 text-[11px] uppercase tracking-[0.22em] pb-3">
                {subtitle}
                {subtitle.length < 'Parlons-en.'.length && subtitle.length > 0 && (
                  <span className="cursor" style={{ width: '2px', height: '0.7em' }} />
                )}
              </p>
            </div>
            <hr className="rule mt-6" />
          </div>
        </Container>

        {/* ── GRILLE PRINCIPALE ── */}
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 py-10">

            {/* Formulaire — expand fields */}
            <motion.div
              className="lg:col-span-7"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-white/20 text-[10px] uppercase tracking-[0.22em] mb-8">
                Formulaire — cliquer pour ouvrir
              </p>

              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-12"
                  >
                    <p
                      className="text-white font-bold leading-tight mb-3"
                      style={{ fontFamily: '"Syne", sans-serif', fontSize: 'clamp(28px, 4vw, 52px)' }}
                    >
                      Message envoyé.
                    </p>
                    <p className="text-white/30 text-[15px] font-light">
                      Je reviens vers toi dans les 24–48h.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={handleSubmit}>
                    <ExpandField id="name"    label="Nom"     placeholder="Jean Dupont"              required />
                    <ExpandField id="email"   label="Email"   type="email" placeholder="hello@example.com" required />
                    <ExpandField id="project" label="Projet"  placeholder="Type, budget, deadline…"  />
                    <ExpandField id="message" label="Message" as="textarea" placeholder="Décris ton projet…" required rows={5} />

                    <hr className="rule" />

                    <motion.div
                      className="pt-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      <button type="submit" className="submit-btn">
                        Envoyer le message
                      </button>
                    </motion.div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Infos + réseaux */}
            <motion.div
              className="lg:col-span-5 space-y-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div>
                <p className="text-white/20 text-[10px] uppercase tracking-[0.22em] mb-5">Email direct</p>
                <a
                  href="mailto:hello@example.com"
                  className="email-link"
                  style={{ fontSize: 'clamp(20px, 3vw, 38px)' }}
                >
                  hello@example.com
                </a>
              </div>

              <div>
                <p className="text-white/20 text-[10px] uppercase tracking-[0.22em] mb-2">Infos</p>
                {infos.map((row, i) => (
                  <div key={i} className="flex justify-between items-baseline py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <span className="text-white/25 text-[11px] uppercase tracking-[0.16em]">{row.label}</span>
                    <span className="text-white/60 text-[14px] font-light">{row.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <hr className="rule" />
        </Container>

        {/* ── Footer ── */}
        <Container>
          <motion.div
            className="py-16 flex flex-wrap items-end justify-between gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p
              className="font-bold leading-none tracking-tight"
              style={{
                fontFamily: '"Syne", sans-serif',
                fontSize: 'clamp(28px, 5vw, 72px)',
                color: 'rgba(255,255,255,0.04)',
              }}
            >
              Travaillons ensemble
            </p>
            <p className="text-white/15 text-[11px] uppercase tracking-[0.18em]">
              © {new Date().getFullYear()} — Tous droits réservés
            </p>
          </motion.div>
        </Container>

      </div>
    </>
  )
}
import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { navItems, site } from '../data/site.js'
import Container from '../ui/Container.jsx'
import { NavLink, Link } from 'react-router-dom'

const MotionDiv = motion.div
const MotionA = motion.a

const FALLBACK_OWNER = { name: '', email: '', phone: '', location: 'France', website: '', socials: {} }

const SOCIAL_DEFS = [
  {
    key: 'instagram', label: 'Instagram', baseUrl: 'https://instagram.com/',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
  },
  {
    key: 'youtube', label: 'YouTube', baseUrl: 'https://youtube.com/',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  },
  {
    key: 'tiktok', label: 'TikTok', baseUrl: 'https://tiktok.com/@',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1-.07z"/></svg>,
  },
  {
    key: 'vimeo', label: 'Vimeo', baseUrl: 'https://vimeo.com/',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 12.12C4.603 9.533 3.83 8.237 3 8.237c-.188 0-.84.393-1.962 1.18L0 8.105c1.238-1.096 2.5-2.179 3.736-3.241 1.689-1.46 2.951-2.224 3.785-2.267 1.975-.184 3.19 1.161 3.647 4.035.495 3.096.838 5.019 1.024 5.765.568 2.582 1.19 3.87 1.862 3.87.526 0 1.319-.833 2.374-2.498 1.056-1.664 1.619-2.935 1.692-3.815.149-1.683-.489-2.589-1.692-2.589-.606 0-1.229.136-1.871.404 1.245-4.063 3.619-6.038 7.123-5.917 2.599.083 3.815 1.761 3.297 4.164z"/></svg>,
  },
  {
    key: 'twitter', label: 'X', baseUrl: 'https://x.com/',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  },
  {
    key: 'linkedin', label: 'LinkedIn', baseUrl: 'https://linkedin.com/in/',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  },
  {
    key: 'facebook', label: 'Facebook', baseUrl: 'https://facebook.com/',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  },
  {
    key: 'behance', label: 'Behance', baseUrl: 'https://behance.net/',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.767-.62.17-1.28.254-1.97.254H0V4.51h6.938zm-.24 4.872c.57 0 1.036-.13 1.405-.4.367-.27.554-.7.554-1.29 0-.33-.06-.6-.175-.82-.12-.22-.28-.4-.483-.53-.2-.13-.43-.22-.69-.27-.26-.05-.52-.074-.79-.074H3.1v3.4h3.6zm.15 5.1c.29 0 .56-.03.81-.09.25-.06.47-.16.66-.3.19-.14.34-.33.44-.57.1-.24.16-.54.16-.9 0-.72-.2-1.24-.6-1.55-.4-.31-.93-.46-1.58-.46H3.1v3.87h3.75zm10.98-2.52c.28.27.43.67.43 1.2H14.1c.04.6.23 1.04.57 1.32.34.28.77.42 1.3.42.37 0 .68-.09.94-.27.26-.18.42-.37.48-.57h2.4c-.38 1.17-1 2-1.83 2.5-.83.5-1.84.75-3.01.75-.82 0-1.56-.13-2.22-.4-.66-.27-1.22-.65-1.67-1.15-.45-.5-.8-1.08-1.04-1.75-.24-.67-.36-1.4-.36-2.2 0-.78.12-1.5.37-2.17.25-.67.6-1.25 1.06-1.74.46-.49 1.02-.87 1.67-1.14.65-.27 1.38-.41 2.18-.41.89 0 1.67.17 2.33.5.66.34 1.2.79 1.63 1.36.43.57.74 1.22.93 1.95.19.73.25 1.5.19 2.3h-5.6c0 .54.14.93.43 1.2zm-1.12-3.16c-.29-.25-.7-.38-1.22-.38-.36 0-.66.06-.9.18-.24.12-.44.27-.59.45-.15.18-.26.37-.32.58-.07.21-.1.41-.11.6h3.58c-.06-.58-.25-1.03-.44-1.43zm-3.5-5.4h4.32v1.08h-4.32V3.8z"/></svg>,
  },
]

function useOwner() {
  const [owner, setOwner] = useState(FALLBACK_OWNER)
  useEffect(() => {
    const base = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '')
    fetch(`${base}/content/owner`)
      .then((r) => r.ok ? r.json() : null)
      .then((j) => { if (j?.data) setOwner((p) => ({ ...p, ...j.data, socials: { ...(p.socials ?? {}), ...(j.data.socials ?? {}) } })) })
      .catch(() => {})
  }, [])
  return owner
}

export default function SiteFooter() {
  const ref = useRef(null)
  const owner = useOwner()

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const glowY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.45, 0.85, 0.55])
  const bigX = useTransform(scrollYProgress, [0, 1], ['10%', '-6%'])

  const displayName = owner.name || site.name
  const displayEmail = owner.email
  const displayLocation = owner.location || 'France'

  const ownerSocials = owner.socials ?? {}
  const activeSocials = SOCIAL_DEFS
    .map((def) => {
      const val = ownerSocials[def.key]?.trim()
      if (!val) return null
      const handle = val.replace(/^@/, '')
      return { ...def, href: `${def.baseUrl}${handle}`, handle: val }
    })
    .filter(Boolean)

  return (
    <footer className="w-screen">
      <Container fluid>
        <MotionDiv
          ref={ref}
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 18 }}
          viewport={{ once: true, margin: '-20% 0px -10% 0px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-none backdrop-blur-md"
        >
          <div className="absolute inset-0">
            <MotionDiv className="header-glow" style={{ y: glowY, opacity: glowOpacity }} />
            <MotionDiv
              className="absolute -inset-10"
              animate={{ rotate: [0, 6, 0], scale: [1, 1.03, 1] }}
              transition={{ duration: 14, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
              style={{
                background:
                  'radial-gradient(700px 320px at 20% 25%, rgba(212,175,55,.22), transparent 70%), radial-gradient(620px 300px at 80% 70%, rgba(255,255,255,.10), transparent 70%)',
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                backgroundRepeat: 'repeat',
                backgroundSize: '240px 240px',
              }}
            />
          </div>

          <div className="relative px-7 py-10 sm:px-12 sm:py-14">
            <MotionDiv
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-20% 0px -10% 0px' }}
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
              className="grid gap-10 md:grid-cols-12"
            >
              {/* Logo + nom */}
              <MotionDiv
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                className="md:col-span-3"
              >
                <div className="flex items-center gap-3">
                  <MotionDiv
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white"
                    whileHover={{ scale: 1.06 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  >
                    <MotionDiv
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'radial-gradient(circle at 30% 30%, rgba(212,175,55,.18), transparent 60%)' }}
                      animate={{ opacity: [0.35, 0.75, 0.35] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <img src="/logo-ib-white.png" alt={displayName} className="relative h-7 w-7 object-contain" />
                  </MotionDiv>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-white">{displayName}</p>
                    <p className="text-xs text-white/60">{site.tagline}</p>
                  </div>
                </div>
              </MotionDiv>

              {/* Navigation + Contact */}
              <MotionDiv
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                className="grid gap-10 sm:grid-cols-2 md:col-span-5"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-white/45">Navigation</p>
                  <ul className="mt-4 space-y-3">
                    {navItems.map((item) => (
                      <li key={item.to}>
                        <MotionDiv
                          initial={{ opacity: 0, x: -8 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <NavLink to={item.to} className="group inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
                            <span className="h-[1px] w-0 bg-white/70 transition-all duration-300 group-hover:w-6" />
                            {item.label}
                          </NavLink>
                        </MotionDiv>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-white/45">Contact</p>
                  <ul className="mt-4 space-y-3 text-sm text-white/70">
                    {displayEmail && (
                      <li>
                        <MotionA
                          whileHover={{ x: 4 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                          className="inline-flex hover:text-white"
                          href={`mailto:${displayEmail}`}
                        >
                          {displayEmail}
                        </MotionA>
                      </li>
                    )}
                    {owner.phone && (
                      <li>
                        <MotionA
                          whileHover={{ x: 4 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                          className="inline-flex hover:text-white"
                          href={`tel:${owner.phone}`}
                        >
                          {owner.phone}
                        </MotionA>
                      </li>
                    )}
                    <li className="text-white/45">{displayLocation}</li>
                    {activeSocials.length > 0 && (
                      <li className="flex flex-wrap gap-2 pt-1">
                        {activeSocials.map((s) => (
                          <MotionA
                            key={s.key}
                            href={s.href}
                            target="_blank"
                            rel="noreferrer"
                            whileHover={{ y: -2, scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/65 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <span className="opacity-75">{s.icon}</span>
                            {s.label}
                          </MotionA>
                        ))}
                      </li>
                    )}
                  </ul>
                </div>
              </MotionDiv>

              {/* Callout */}
              <MotionDiv
                variants={{ hidden: { opacity: 0, x: 14 }, show: { opacity: 1, x: 0 } }}
                className="md:col-span-4 md:justify-self-end"
              >
                <MotionDiv className="pointer-events-none select-none text-right" style={{ x: bigX }}>
                  <p className="text-[clamp(44px,6vw,92px)] font-semibold leading-[0.9] tracking-tight text-white/10">
                    Let's Paint
                    <br />
                    Some Plans
                  </p>
                </MotionDiv>
              </MotionDiv>
            </MotionDiv>

            {/* Bottom bar */}
            <div className="mt-12 border-t border-white/10 pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs uppercase tracking-[0.26em] text-white/45">
                  <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                  <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                  <Link to="/cookies" className="hover:text-white transition-colors">Cookie policy</Link>
                </div>
                <p className="text-xs text-white/45">
                  © {new Date().getFullYear()} {displayName}. Tous droits réservés.
                </p>
              </div>
            </div>
          </div>
        </MotionDiv>
      </Container>
    </footer>
  )
}

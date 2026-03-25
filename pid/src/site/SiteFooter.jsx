import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { NavLink } from 'react-router'
import { navItems, site } from '../data/site.js'
import Container from '../ui/Container.jsx'

const MotionDiv = motion.div
const MotionA = motion.a

const socials = [
  { label: 'Instagram', href: 'https://instagram.com', icon: 'https://www.svgrepo.com/show/452229/instagram-1.svg' },
  { label: 'YouTube', href: 'https://youtube.com', icon: 'https://www.svgrepo.com/show/354592/youtube-icon.svg' },
  { label: 'Vimeo', href: 'https://vimeo.com', icon: 'https://www.svgrepo.com/show/475694/vimeo-color.svg' },
]

export default function SiteFooter() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const glowY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.45, 0.85, 0.55])
  const bigX = useTransform(scrollYProgress, [0, 1], ['10%', '-6%'])

  return (
    <footer className="w-screen ">
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
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.08 } },
              }}
              className="grid gap-10 md:grid-cols-12"
            >
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
                      style={{
                        background:
                          'radial-gradient(circle at 30% 30%, rgba(212,175,55,.18), transparent 60%)',
                      }}
                      animate={{ opacity: [0.35, 0.75, 0.35] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <img
                      src="/logo-ib-white.png"
                      alt={site.name}
                      className="relative h-7 w-7 object-contain"
                    />
                  </MotionDiv>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-white">{site.name}</p>
                    <p className="text-xs text-white/60">{site.tagline}</p>
                  </div>
                </div>
              </MotionDiv>

              <MotionDiv
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                className="grid gap-10 sm:grid-cols-2 md:col-span-5"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-white/45">
                    Navigation
                  </p>
                  <ul className="mt-4 space-y-3">
                    {navItems.map((item) => (
                      <li key={item.to}>
                        <MotionDiv
                          initial={{ opacity: 0, x: -8 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <NavLink
                            to={item.to}
                            className="group inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
                          >
                            <span className="h-[1px] w-0 bg-white/70 transition-all duration-300 group-hover:w-6" />
                            {item.label}
                          </NavLink>
                        </MotionDiv>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-white/45">
                    Contact
                  </p>
                  <ul className="mt-4 space-y-3 text-sm text-white/70">
                    <li>
                      <MotionA
                        whileHover={{ x: 4 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                        className="inline-flex hover:text-white"
                        href="mailto:hello@example.com"
                      >
                        hello@example.com
                      </MotionA>
                    </li>
                    <li className="text-white/45">France</li>
                    <li className="flex flex-wrap gap-x-3 gap-y-2 pt-1">
                      {socials.map((s) => (
                        <MotionA
                          key={s.label}
                          href={s.href}
                          target="_blank"
                          rel="noreferrer"
                          whileHover={{ y: -2, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                          className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 hover:text-white hover:bg-white/10"
                        >
                          <img
                            src={s.icon}
                            className="h-4 w-4 object-contain me-2 opacity-70"
                            alt=""
                            aria-hidden="true"
                          />
                          {s.label}
                        </MotionA>
                      ))}
                    </li>
                  </ul>
                </div>
              </MotionDiv>

              <MotionDiv
                variants={{ hidden: { opacity: 0, x: 14 }, show: { opacity: 1, x: 0 } }}
                className="md:col-span-4 md:justify-self-end"
              >
                <MotionDiv className="pointer-events-none select-none text-right" style={{ x: bigX }}>
                  <p className="text-[clamp(44px,6vw,92px)] font-semibold leading-[0.9] tracking-tight text-white/10">
                    Let’s Paint
                    <br />
                    Some Plans
                  </p>
                </MotionDiv>
              </MotionDiv>
            </MotionDiv>

            <div className="mt-12 border-t border-white/10 pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs uppercase tracking-[0.26em] text-white/45">
                  <MotionA
                    href="#"
                    className="hover:text-white"
                    whileHover={{ y: -1 }}
                    transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                  >
                    Terms
                  </MotionA>
                  <MotionA
                    href="#"
                    className="hover:text-white"
                    whileHover={{ y: -1 }}
                    transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                  >
                    Privacy
                  </MotionA>
                  <MotionA
                    href="#"
                    className="hover:text-white"
                    whileHover={{ y: -1 }}
                    transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                  >
                    Cookie policy
                  </MotionA>
                </div>
                <p className="text-xs text-white/45">
                  © {new Date().getFullYear()} {site.name}. Tous droits réservés.
                </p>
              </div>
            </div>
          </div>
        </MotionDiv>
      </Container>
    </footer>
  )
}

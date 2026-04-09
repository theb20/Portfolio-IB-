import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { projects as fallbackProjects } from '../data/projects.js'
import { fetchProjects } from '../lib/api.js'
import Container from '../ui/Container.jsx'
import NumberedGridSection from '../sections/projects/NumberedGridSection.jsx'

const MotionDiv = motion.div

// Framer variants
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState(fallbackProjects)

  useEffect(() => {
    let mounted = true
    fetchProjects()
      .then((items) => {
        if (!mounted) return
        if (Array.isArray(items) && items.length) setProjects(items)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  const { hero, rest } = useMemo(() => {
    const [first, ...others] = projects
    return { hero: first ?? null, rest: others }
  }, [projects])

  return (
    <>
      <style>{`
        .page-bg {
          background: #07100c;
        }
        .rule {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.08);
          margin: 0;
        }
        .rule-heavy {
          border: none;
          border-top: 2px solid rgba(255,255,255,0.55);
          margin: 0;
        }
        .tag-pill {
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.35);
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          padding: 3px 10px;
          border-radius: 999px;
        }
        .index-num {
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          letter-spacing: 0.18em;
          color: rgba(255,255,255,0.2);
        }
        .hover-arrow {
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.3s;
          opacity: 0;
          transform: translateX(-6px);
        }
        .project-row:hover .hover-arrow {
          opacity: 1;
          transform: translateX(0);
        }
        .project-row:hover .row-title {
          color: #fff;
        }
        .row-title {
          transition: color 0.3s;
          color: rgba(255,255,255,0.75);
        }
        .img-zoom img {
          transition: transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .img-zoom:hover img {
          transform: scale(1.04);
        }
      `}</style>

      <div className="page-bg min-h-screen">

        {/* ──────────────────────────────────────────
            MASTHEAD — type magazine
        ────────────────────────────────────────── */}
        <Container className="px-4">
          <motion.div
            className="pt-20 pb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >

            <div className="flex items-end justify-between">
              <motion.h1
                className="font-bold text-white leading-none tracking-tight"
                style={{
                  fontFamily: '"Syne", sans-serif',
                  fontSize: 'clamp(52px, 9vw, 120px)',
                }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                Projets
              </motion.h1>

              {/* Méta éditoriale — coin haut droit */}
              <motion.div
                className="hidden sm:flex flex-col items-end gap-1 pb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <span className="text-white/20 text-[11px] uppercase tracking-[0.22em]">
                  Portfolio
                </span>
                <span className="text-white/15 text-[11px] font-mono">
                  {projects.length} films
                </span>
              </motion.div>
            </div>

            {/* Ligne fine bas masthead */}
            <hr className="rule mt-6" />
          </motion.div>
        </Container>

        {/* ──────────────────────────────────────────
            PROJET HERO — pleine largeur editoriale
        ────────────────────────────────────────── */}
        {hero && (
          <Container>
            <motion.div
              className="mb-0 px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to={`/projects/${hero.slug}`} className="group block">
                {/* Image hero pleine largeur */}
                <div className="img-zoom relative overflow-hidden rounded-xl aspect-[16/7] mb-6">
                  <img
                    src={hero.image || hero.thumbnail || '/og-image.png'}
                    alt={hero.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Label featured */}
                  <div className="absolute top-5 left-5">
                    <span className="tag-pill bg-white/5 backdrop-blur-sm">
                      À la une
                    </span>
                  </div>
                </div>

                {/* Titre hero + meta */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start pb-10">
                  <div className="sm:col-span-1">
                    <span className="index-num">01</span>
                  </div>
                  <div className="sm:col-span-7">
                    <h2
                      className="font-bold text-white leading-[1.0] tracking-tight mb-3"
                      style={{
                        fontFamily: '"Syne", sans-serif',
                        fontSize: 'clamp(28px, 4vw, 52px)',
                      }}
                    >
                      {hero.title}
                    </h2>
                    <p className="text-white/40 text-[15px] font-light leading-relaxed max-w-xl">
                      {hero.description}
                    </p>
                  </div>
                  <div className="sm:col-span-4 flex flex-col items-start sm:items-end gap-3 pt-1">
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {hero.tags?.map((tag) => (
                        <span key={tag} className="tag-pill">{tag}</span>
                      ))}
                    </div>
                    <span className="text-white/20 text-[11px] uppercase tracking-[0.18em]">
                      {hero.year} · {hero.role}
                    </span>
                    <span className="inline-flex items-center gap-2 text-white/50 text-[12px] uppercase tracking-[0.16em] group-hover:text-white transition-colors duration-300">
                      Ouvrir
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>

              <hr className="rule" />
            </motion.div>
          </Container>
        )}

        {/* ──────────────────────────────────────────
            LISTE MAGAZINE — lignes éditoriales
        ────────────────────────────────────────── */}
        <Container>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="py-4 px-4"
          >
            {rest.map((project, i) => (
              <motion.div key={project.slug} variants={fadeUp}>
                <Link
                  to={`/projects/${project.slug}`}
                  className="project-row group grid grid-cols-12 gap-4 items-center py-7 cursor-pointer"
                >
                  {/* Index */}
                  <div className="col-span-1 hidden sm:block">
                    <span className="index-num">{String(i + 2).padStart(2, '0')}</span>
                  </div>

                  {/* Thumbnail compact */}
                  <div className="col-span-3 sm:col-span-2">
                    <div className="img-zoom overflow-hidden rounded-lg aspect-[4/3]">
                      <img
                        src={project.image || project.thumbnail || '/og-image.png'}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Titre + description */}
                  <div className="col-span-7 sm:col-span-6">
                    <h3
                      className="row-title font-bold leading-tight mb-1.5"
                      style={{
                        fontFamily: '"Syne", sans-serif',
                        fontSize: 'clamp(18px, 2.5vw, 28px)',
                      }}
                    >
                      {project.title}
                    </h3>
                    <p className="text-white/30 text-[13px] font-light leading-relaxed line-clamp-2 hidden sm:block">
                      {project.description}
                    </p>
                  </div>

                  {/* Meta + CTA */}
                  <div className="col-span-2 sm:col-span-3 flex flex-col items-end gap-2">
                    <div className="flex flex-wrap gap-1 justify-end">
                      {project.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="tag-pill hidden sm:inline">{tag}</span>
                      ))}
                    </div>
                    <span className="text-white/20 text-[10px] uppercase tracking-widest hidden sm:block">
                      {project.year}
                    </span>
                    <span className="hover-arrow text-white/60 text-[11px] uppercase tracking-[0.16em] flex items-center gap-1.5">
                      Voir
                      <svg width="10" height="10" viewBox="0 0 11 11" fill="none">
                        <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </div>
                </Link>
                <hr className="rule" />
              </motion.div>
            ))}
          </motion.div>
        </Container>

        {/* ──────────────────────────────────────────
            FOOTER SECTION — bas de page editorial
        ────────────────────────────────────────── */}
        <Container>
          <motion.div
            className="py-16 px-4 flex items-center justify-between"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p
              className="text-white/10 font-bold"
              style={{
                fontFamily: '"Syne", sans-serif',
                fontSize: 'clamp(32px, 5vw, 72px)',
                letterSpacing: '-0.03em',
              }}
            >
              {projects.length} films
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 border border-white/15 text-white/50 text-[11px] uppercase tracking-[0.2em] px-6 py-3 rounded-full hover:border-white/40 hover:text-white transition-all duration-300"
            >
              Travailler ensemble
            </Link>
          </motion.div>
        </Container>

      </div>
    </>
  )
}

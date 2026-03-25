import { Link, useParams } from 'react-router'
import { motion } from 'framer-motion'
import { getProjectBySlug, projects } from '../data/projects.js'
import Container from '../ui/Container.jsx'
import NotFoundPage from './NotFoundPage.jsx'

const MotionDiv = motion.div

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.09 } },
}

export default function ProjectPage() {
  const { slug } = useParams()
  const project = getProjectBySlug(slug)

  if (!project) return <NotFoundPage />

  // Projets suggérés — les 2 suivants dans le tableau
  const idx = projects.findIndex((p) => p.slug === slug)
  const suggestions = [
    projects[(idx + 1) % projects.length],
    projects[(idx + 2) % projects.length],
  ].filter(Boolean)

  return (
    <>
      <style>{`
        .detail-bg { background: #07100c; }
        .rule  { border: none; border-top: 1px solid rgba(255,255,255,0.07); }
        .rule-heavy { border: none; border-top: 2px solid rgba(255,255,255,0.5); }
        .tag-pill {
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.35);
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 999px;
        }
        .stat-block { border-top: 1px solid rgba(255,255,255,0.07); }
        .img-zoom img { transition: transform 0.8s cubic-bezier(0.16,1,0.3,1); }
        .img-zoom:hover img { transform: scale(1.03); }
        .sugg-card:hover .sugg-title { color: #fff; }
        .sugg-title { transition: color 0.3s; color: rgba(255,255,255,0.7); }
        .sugg-card:hover .sugg-img img { transform: scale(1.05); }
        .sugg-img img { transition: transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        .play-btn {
          width: 64px; height: 64px;
          border: 1.5px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(12px);
          background: rgba(255,255,255,0.06);
          transition: background 0.3s, border-color 0.3s, transform 0.3s;
        }
        .play-btn:hover {
          background: rgba(255,255,255,0.14);
          border-color: rgba(255,255,255,0.6);
          transform: scale(1.08);
        }
      `}</style>

      <div className="detail-bg min-h-screen pb-0">

        {/* ── HERO IMAGE pleine largeur ── */}
        <motion.div
          className="relative w-full overflow-hidden"
          style={{ height: 'clamp(340px, 60vh, 700px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <img
            src={project.thumbnail || '/og-image.png'}
            alt={project.title}
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.7)' }}
          />

          {/* Dégradé bas */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07100c] via-[rgba(7,16,12,0.3)] to-transparent" />

          {/* Bouton play si vidéo */}
          {project.links?.video && (
            <a
              href={project.links.video}
              target="_blank"
              rel="noreferrer"
              className="play-btn absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7 4.5l10 5.5-10 5.5V4.5z" fill="white" />
              </svg>
            </a>
          )}

          {/* Retour — haut gauche */}
          <div className="absolute top-8 left-6 sm:left-10">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-white/50 text-[11px] uppercase tracking-[0.2em] hover:text-white transition-colors duration-300"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M12 7H2M2 7l5-5M2 7l5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Projets
            </Link>
          </div>
        </motion.div>

        {/* ── MASTHEAD du projet ── */}
        <Container>
          <motion.div
            className="pt-10 px-4 pb-8"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={fadeUp} className="flex flex-wrap items-start justify-between  gap-4 mb-6">
              {/* Catégorie + année */}
              <div className="flex items-center gap-4">
                <span className="tag-pill">{project.role}</span>
                <span className="text-white/20 text-[11px] font-mono">{project.year}</span>
              </div>
              {/* Lien vidéo si dispo */}
              {project.links?.video && (
                <a
                  href={project.links.video}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-white/15 text-white/50 text-[11px] uppercase tracking-[0.18em] px-5 py-2.5 rounded-full hover:border-white/40 hover:text-white transition-all duration-300"
                >
                  Voir le film
                  <svg width="10" height="10" viewBox="0 0 11 11" fill="none">
                    <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              )}
            </motion.div>

            {/* Titre */}
            <motion.h1
              variants={fadeUp}
              className="font-bold text-white leading-none tracking-tight mb-0"
              style={{
                fontFamily: '"Syne", sans-serif',
                fontSize: 'clamp(40px, 7vw, 96px)',
              }}
            >
              {project.title}
            </motion.h1>

            <hr className="rule mt-8" />
          </motion.div>

          {/* ── GRILLE PRINCIPALE ── */}
          <motion.div
            className="grid px-4 grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 py-10"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >

            {/* Colonne gauche — description longue */}
            <motion.div variants={fadeUp} className="lg:col-span-7 space-y-8">

              {/* Description */}
              <div>
                <p className="text-white/20 text-[10px] uppercase tracking-[0.22em] mb-4">
                  Description
                </p>
                <p
                  className="text-white/65 font-light leading-[1.85]"
                  style={{ fontSize: 'clamp(15px, 1.6vw, 18px)' }}
                >
                  {project.description}
                </p>
              </div>

              {/* Note de réalisation — champ optionnel */}
              {project.note && (
                <div className="border-l-2 border-white/10 pl-6">
                  <p className="text-white/20 text-[10px] uppercase tracking-[0.22em] mb-3">
                    Note de réalisation
                  </p>
                  <p className="text-white/45 font-light leading-[1.8] italic text-[15px]"
                    style={{ fontFamily: '"Cormorant", Georgia, serif', fontSize: '1.15rem' }}
                  >
                    {project.note}
                  </p>
                </div>
              )}

              {/* Tags */}
              <div>
                <p className="text-white/20 text-[10px] uppercase tracking-[0.22em] mb-4">
                  Disciplines
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="tag-pill">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Colonne droite — fiche technique */}
            <motion.div variants={fadeUp} className="lg:col-span-5 space-y-0">
              <p className="text-white/20 text-[10px] uppercase tracking-[0.22em] mb-6">
                Fiche technique
              </p>

              {[
                { label: 'Titre', value: project.title },
                { label: 'Rôle', value: project.role },
                { label: 'Année', value: project.year },
                ...(project.client   ? [{ label: 'Client',    value: project.client }]   : []),
                ...(project.duration ? [{ label: 'Durée',     value: project.duration }] : []),
                ...(project.format   ? [{ label: 'Format',    value: project.format }]   : []),
                ...(project.location ? [{ label: 'Lieu',      value: project.location }] : []),
              ].map((row, i) => (
                <div key={i} className="stat-block flex justify-between items-baseline py-4">
                  <span className="text-white/25 text-[11px] uppercase tracking-[0.16em]">
                    {row.label}
                  </span>
                  <span className="text-white/75 text-[14px] font-light text-right max-w-[60%]">
                    {row.value}
                  </span>
                </div>
              ))}

              {/* Liens externes */}
              {project.links && Object.keys(project.links).length > 0 && (
                <div className="pt-8 space-y-3">
                  {project.links.video && (
                    <a
                      href={project.links.video}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between border border-white/10 rounded-xl px-5 py-4 hover:border-white/30 transition-all duration-300 group"
                    >
                      <span className="text-white/50 text-[12px] uppercase tracking-[0.16em] group-hover:text-white transition-colors">
                        Voir le film
                      </span>
                      <svg width="12" height="12" viewBox="0 0 11 11" fill="none" className="opacity-30 group-hover:opacity-80 transition-opacity">
                        <path d="M2 10L10 2M10 2H4M10 2V8" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  )}
                  {project.links.bts && (
                    <a
                      href={project.links.bts}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between border border-white/10 rounded-xl px-5 py-4 hover:border-white/30 transition-all duration-300 group"
                    >
                      <span className="text-white/50 text-[12px] uppercase tracking-[0.16em] group-hover:text-white transition-colors">
                        Behind the scenes
                      </span>
                      <svg width="12" height="12" viewBox="0 0 11 11" fill="none" className="opacity-30 group-hover:opacity-80 transition-opacity">
                        <path d="M2 10L10 2M10 2H4M10 2V8" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>

          <hr className="rule" />

          {/* ── GALERIE — images supplémentaires ── */}
          {project.gallery && project.gallery.length > 0 && (
            <motion.div
              className="py-14 "
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
            >
              <motion.p
                variants={fadeUp}
                className="text-white/20 text-[10px] uppercase tracking-[0.22em] mb-8"
              >
                Galerie
              </motion.p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {project.gallery.map((src, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className={`img-zoom overflow-hidden rounded-xl ${
                      i === 0 ? 'sm:col-span-2 aspect-[16/9]' : 'aspect-[4/3]'
                    }`}
                  >
                    <img
                      src={src}
                      alt={`${project.title} — ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {project.gallery && project.gallery.length > 0 && <hr className="rule" />}

          {/* ── CREDITS — équipe ── */}
          {project.credits && project.credits.length > 0 && (
            <motion.div
              className="py-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-white/20 text-[10px] uppercase tracking-[0.22em] mb-8">
                Crédits
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-white/[0.05] rounded-xl overflow-hidden">
                {project.credits.map((credit, i) => (
                  <div key={i} className="bg-[#07100c] px-6 py-5">
                    <p className="text-white/20 text-[10px] uppercase tracking-[0.16em] mb-1.5">
                      {credit.role}
                    </p>
                    <p className="text-white/70 text-[14px] font-light">
                      {credit.name}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {project.credits && project.credits.length > 0 && <hr className="rule" />}
        </Container>

        {/* ── SUGGESTIONS — pleine largeur ── */}
        {suggestions.length > 0 && (
          <div className="mt-4 pb-0">
            <Container>
              <div className="flex px-4 items-end justify-between py-10">
                <p className="text-white/20 text-[10px] uppercase tracking-[0.22em]">
                  Autres projets
                </p>
                <Link
                  to="/projects"
                  className="text-white/30 text-[11px] uppercase tracking-[0.18em] hover:text-white transition-colors duration-300"
                >
                  Tout voir
                </Link>
              </div>
            </Container>

            <div className="grid grid-cols-1 sm:grid-cols-2">
              {suggestions.map((p, i) => (
                <Link
                  key={p.slug}
                  to={`/projects/${p.slug}`}
                  className="sugg-card group relative overflow-hidden block"
                  style={{ height: 'clamp(260px, 35vw, 480px)' }}
                >
                  <div className="sugg-img absolute inset-0">
                    <img
                      src={p.thumbnail || '/og-image.png'}
                      alt={p.title}
                      className="w-full h-full object-cover"
                      style={{ filter: 'brightness(0.55)' }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* Bordure entre les deux cartes */}
                  {i === 0 && (
                    <div className="absolute top-0 right-0 bottom-0 w-px bg-white/10 hidden sm:block" />
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-8">
                    <span className="tag-pill mb-3 inline-block">{p.role}</span>
                    <h3
                      className="sugg-title font-bold leading-tight"
                      style={{
                        fontFamily: '"Syne", sans-serif',
                        fontSize: 'clamp(22px, 3vw, 36px)',
                      }}
                    >
                      {p.title}
                    </h3>
                    <p className="text-white/25 text-[11px] uppercase tracking-widest mt-2">
                      {p.year}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  )
}

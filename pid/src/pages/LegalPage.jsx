import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import Container from '../ui/Container.jsx'

const SLUGS = {
  terms: 'terms',
  privacy: 'privacy',
  cookies: 'cookies',
}

const LABELS = {
  terms: 'Conditions Générales',
  privacy: 'Confidentialité',
  cookies: 'Cookies',
}

const FALLBACKS = {
  terms: { title: 'Conditions Générales d\'Utilisation', updatedAt: '', sections: [] },
  privacy: { title: 'Politique de Confidentialité', updatedAt: '', sections: [] },
  cookies: { title: 'Politique de Cookies', updatedAt: '', sections: [] },
}

export default function LegalPage() {
  const { pathname } = useLocation()
  const slug = pathname.replace(/^\//, '')
  const section = SLUGS[slug] ?? slug
  const [data, setData] = useState(FALLBACKS[section] ?? FALLBACKS.terms)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
    const base = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '')
    fetch(`${base}/content/${section}`)
      .then((r) => r.ok ? r.json() : null)
      .then((j) => {
        if (j?.data) setData(j.data)
        setTimeout(() => setLoaded(true), 80)
      })
      .catch(() => setLoaded(true))
  }, [section])

  const sections = Array.isArray(data.sections) ? data.sections : []
  const updatedAt = data.updatedAt
    ? new Date(data.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null

  const siblings = Object.entries(LABELS).filter(([k]) => k !== section)

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <div className="relative overflow-hidden">
        {/* Glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />
        <Container className="relative px-4 pt-28 pb-14">
          {/* Breadcrumb */}
          <div
            className="mb-8 flex items-center gap-2 text-xs text-white/30 uppercase tracking-[0.2em]"
            style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.6s ease' }}
          >
            <Link to="/" className="hover:text-white/60 transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-white/50">{LABELS[section] ?? data.title}</span>
          </div>

          <div
            style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(12px)', transition: 'opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s' }}
          >
            {/* Tag */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/50 uppercase tracking-widest">
              <span className="h-1 w-1 rounded-full bg-white/40" />
              Mentions légales
            </div>

            <h1
              className="text-white font-bold leading-[1.05] tracking-tight"
              style={{
                fontFamily: '"Syne", sans-serif',
                fontSize: 'clamp(36px, 6vw, 72px)',
                letterSpacing: '-0.02em',
              }}
            >
              {data.title}
            </h1>

            {updatedAt && (
              <p className="mt-4 text-sm text-white/30">Dernière mise à jour : {updatedAt}</p>
            )}
          </div>

          {/* Horizontal rule */}
          <div
            className="mt-10 h-px"
            style={{
              background: 'linear-gradient(to right, rgba(255,255,255,0.12), transparent)',
              opacity: loaded ? 1 : 0,
              transition: 'opacity 0.8s ease 0.3s',
            }}
          />
        </Container>
      </div>

      {/* Content */}
      <Container className="px-4 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Sections */}
          <div className="lg:col-span-8">
            {sections.length === 0 ? (
              <div
                className="py-20 text-center text-white/20 text-sm"
                style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.5s' }}
              >
                Contenu en cours de rédaction.
              </div>
            ) : (
              <div className="space-y-10">
                {sections.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      opacity: loaded ? 1 : 0,
                      transform: loaded ? 'none' : 'translateY(10px)',
                      transition: `opacity 0.6s ease ${0.15 + i * 0.07}s, transform 0.6s ease ${0.15 + i * 0.07}s`,
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Numéro section */}
                      <span
                        className="flex-shrink-0 mt-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 font-mono text-xs text-white/30"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h2
                          className="text-white font-semibold mb-3"
                          style={{
                            fontFamily: '"Syne", sans-serif',
                            fontSize: 'clamp(16px, 2vw, 20px)',
                          }}
                        >
                          {s.heading}
                        </h2>
                        <div
                          className="text-white/55 leading-relaxed text-sm whitespace-pre-wrap"
                          style={{ lineHeight: '1.8' }}
                        >
                          {s.body}
                        </div>
                      </div>
                    </div>

                    {/* Separator */}
                    {i < sections.length - 1 && (
                      <div className="mt-10 ml-11 h-px bg-white/[0.06]" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar : autres pages légales */}
          <div
            className="lg:col-span-4"
            style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.8s ease 0.4s' }}
          >
            <div className="sticky top-24">
              <p className="text-xs uppercase tracking-[0.25em] text-white/30 mb-4">Autres pages légales</p>
              <div className="flex flex-col gap-2">
                {siblings.map(([k, label]) => (
                  <Link
                    key={k}
                    to={`/${k}`}
                    className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/50 hover:bg-white/[0.06] hover:text-white/80 transition-all"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white/20 group-hover:bg-white/50 transition-colors" />
                    {label}
                    <svg className="ml-auto w-3.5 h-3.5 opacity-30 group-hover:opacity-60 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </Link>
                ))}
                <div className="mt-4 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-4">
                  <p className="text-xs text-white/30 leading-relaxed">
                    Des questions sur nos mentions légales ?{' '}
                    <Link to="/contact" className="text-white/50 hover:text-white transition-colors underline underline-offset-2">
                      Contactez-nous
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </Container>
    </div>
  )
}

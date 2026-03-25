import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Container from '../../ui/Container.jsx'
import SectionHeading from '../../ui/SectionHeading.jsx'
import { projects } from '../../data/projects.js'

const MotionDiv = motion.div

export default function NumberedGridSection() {
  const items = useMemo(() => {
    const base = projects.slice(0, 4)
    // Fallback if less than 4 projects
    while (base.length < 4) {
      base.push({
        slug: `placeholder-${base.length}`,
        title: 'Service',
        description:
          'Nous accompagnons vos besoins: prise de contact, cadrage de projet, et livraison efficace.',
        image: '/og-image.png',
      })
    }
    return base.map((p, i) => ({
      idx: i + 1,
      title: p.title ?? 'Projet',
      description:
        p.description ??
        'Description du projet: objectif, approche, et résultat.',
      image: p.image ?? '/og-image.png',
      slug: p.slug ?? `p-${i + 1}`,
    }))
  }, [])

  const [active, setActive] = useState(3) // 3rd card highlighted by default

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionHeading
          title="Projets"
          subtitle="Grille numérotée avec focus central — inspirée de ta référence."
          align="left"
        />
      </Container>

      <Container className="mt-10 relative">
        <div className="grid gap-6 md:grid-cols-4">
          {items.map((item, i) => (
            <button
              key={item.slug}
              type="button"
              onMouseEnter={() => setActive(i + 1)}
              onFocus={() => setActive(i + 1)}
              className="group cursor-pointer rounded-2xl border border-[var(--border)] bg-[color-mix(in oklab,var(--bg)_98%,transparent)] p-6 text-left outline-none transition-colors hover:bg-[color-mix(in oklab,var(--bg)_95%,transparent)]"
            >
              <p className="text-4xl font-semibold tracking-tight text-[var(--text-h)] sm:text-5xl">
                {String(item.idx).padStart(2, '0')}
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-base font-medium text-[var(--text-h)]">
                  {item.title}
                </p>
                <p className="text-sm text-[var(--text)]">
                  {item.description}
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-h)] group-hover:bg-[var(--accent-bg)]">
                    Learn More
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <MotionDiv
          key={active}
          className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-[var(--border)] shadow-2xl sm:block"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: 300, height: 420 }}
        >
          <img
            src={items[active - 1]?.image ?? '/og-image.png'}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,.55)] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="text-sm font-semibold text-white">
              {items[active - 1]?.title}
            </p>
            <p className="mt-1 text-xs text-white/80">
              {items[active - 1]?.description}
            </p>
          </div>
        </MotionDiv>
      </Container>
    </section>
  )
}

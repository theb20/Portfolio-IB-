import { Link } from 'react-router'
import { projects } from '../../data/projects.js'
import Card from '../../ui/Card.jsx'
import SectionHeading from '../../ui/SectionHeading.jsx'

export default function FeaturedProjectsSection() {
  return (
    <section className="py-14 sm:py-20">
      <SectionHeading
        title="Projets sélectionnés"
        subtitle="Une base scalable: data → sections → pages. Tu ajoutes un projet dans projects.js, et l’affichage suit."
      />

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.slug} className="p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-[var(--text)]">
                  {project.year} • {project.role}
                </p>
                <h3 className="text-lg font-semibold text-[var(--text-h)]">
                  {project.title}
                </h3>
                <p className="text-sm text-[var(--text)]">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                to={`/projects/${project.slug}`}
                className="shrink-0 rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-h)] hover:bg-[var(--accent-bg)]"
              >
                Voir
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}

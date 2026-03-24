import { Link } from 'react-router'
import { projects } from '../data/projects.js'
import Card from '../ui/Card.jsx'
import Container from '../ui/Container.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'

export default function ProjectsPage() {
  return (
    <Container className="py-14 sm:py-20">
      <SectionHeading
        title="Projets"
        subtitle="Liste de projets basée sur une source de données unique."
      />

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.slug} className="p-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wide text-[var(--text)]">
                {project.year} • {project.role}
              </p>
              <h3 className="text-lg font-semibold text-[var(--text-h)]">
                {project.title}
              </h3>
              <p className="text-sm text-[var(--text)]">{project.description}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="pt-2">
                <Link
                  to={`/projects/${project.slug}`}
                  className="text-sm font-medium text-[var(--text-h)] underline decoration-[var(--accent)] underline-offset-4"
                >
                  Ouvrir
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  )
}

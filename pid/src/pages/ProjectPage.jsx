import { Link, useParams } from 'react-router'
import { getProjectBySlug } from '../data/projects.js'
import Card from '../ui/Card.jsx'
import Container from '../ui/Container.jsx'
import NotFoundPage from './NotFoundPage.jsx'

export default function ProjectPage() {
  const { slug } = useParams()
  const project = getProjectBySlug(slug)

  if (!project) return <NotFoundPage />

  return (
    <Container className="py-14 sm:py-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-[var(--text)]">
            {project.year} • {project.role}
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-[var(--text-h)] sm:text-4xl">
            {project.title}
          </h1>
        </div>
        <Link
          to="/projects"
          className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-h)] hover:bg-[var(--accent-bg)]"
        >
          Retour
        </Link>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-[var(--text-h)]">
            Description
          </h2>
          <p className="mt-3 text-sm text-[var(--text)]">{project.description}</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-[var(--text-h)]">Tags</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text)]"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-6 space-y-2">
            {project.links?.video ? (
              <a
                className="block text-sm font-medium text-[var(--text-h)] underline decoration-[var(--accent)] underline-offset-4"
                href={project.links.video}
                target="_blank"
                rel="noreferrer"
              >
                Voir la vidéo
              </a>
            ) : null}
          </div>
        </Card>
      </div>
    </Container>
  )
}

import Container from '../ui/Container.jsx'
import { site } from '../data/site.js'

export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] py-10">
      <Container className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[var(--text-h)]">{site.name}</p>
          <p className="text-sm text-[var(--text)]">{site.tagline}</p>
        </div>
        <p className="text-sm text-[var(--text)]">
          © {new Date().getFullYear()} {site.name}
        </p>
      </Container>
    </footer>
  )
}

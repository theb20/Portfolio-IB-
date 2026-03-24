import { Link } from 'react-router'
import Container from '../ui/Container.jsx'

export default function NotFoundPage() {
  return (
    <Container className="py-14 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-h)]">
        Page introuvable
      </h1>
      <p className="mt-3 text-[var(--text)]">
        Cette page n’existe pas ou a été déplacée.
      </p>
      <div className="mt-6">
        <Link
          to="/"
          className="text-sm font-medium text-[var(--text-h)] underline decoration-[var(--accent)] underline-offset-4"
        >
          Retour à l’accueil
        </Link>
      </div>
    </Container>
  )
}

import Button from '../../ui/Button.jsx'
import Container from '../../ui/Container.jsx'
import { site } from '../../data/site.js'

export default function HeroSection() {
  return (
    <section className="border-b border-[var(--border)] py-16 sm:py-24">
      <Container className="grid gap-10 lg:grid-cols-12 lg:items-center">
        <div className="space-y-6 lg:col-span-7">
          <p className="inline-flex rounded-full border border-[var(--border)] px-3 py-1 text-sm text-[var(--text)]">
            Portfolio
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-[var(--text-h)] sm:text-5xl">
            {site.name}
          </h1>
          <p className="max-w-xl text-pretty text-lg text-[var(--text)]">
            Vidéaste spécialisé cadrage & montage pour créateurs de contenu. En
            parallèle, machiniste plateau dans le spectacle vivant.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button as="link" to="/projects">
              Voir les projets
            </Button>
            <Button as="link" to="/contact" variant="outline">
              Me contacter
            </Button>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-[var(--border)] bg-[color-mix(in oklab,var(--bg)_98%,transparent)] p-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--text)]">
                  Spécialité
                </dt>
                <dd className="mt-1 text-sm font-medium text-[var(--text-h)]">
                  Montage & cadrage
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--text)]">
                  Livraison
                </dt>
                <dd className="mt-1 text-sm font-medium text-[var(--text-h)]">
                  YouTube / Reels / Shorts
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--text)]">
                  Format
                </dt>
                <dd className="mt-1 text-sm font-medium text-[var(--text-h)]">
                  9:16 / 16:9
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--text)]">
                  Disponibilité
                </dt>
                <dd className="mt-1 text-sm font-medium text-[var(--text-h)]">
                  Freelance
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </Container>
    </section>
  )
}

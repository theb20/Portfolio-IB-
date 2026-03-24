import Container from '../ui/Container.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import Card from '../ui/Card.jsx'

export default function AboutPage() {
  return (
    <Container className="py-14 sm:py-20">
      <SectionHeading
        title="À propos"
        subtitle="Présente ton parcours, ton workflow et tes outils. Cette page est volontairement simple pour rester scalable."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-[var(--text-h)]">Bio</h3>
          <p className="mt-3 text-sm text-[var(--text)]">
            Ajoute ici une bio courte, tes domaines, tes références, et ta façon
            de travailler.
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[var(--text-h)]">
            Services
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-[var(--text)]">
            <li>Montage long format</li>
            <li>Short form (Reels/Shorts)</li>
            <li>Captation / cadrage</li>
            <li>Sound design / sous-titres</li>
          </ul>
        </Card>
      </div>
    </Container>
  )
}

import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'
import Container from '../ui/Container.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'

export default function ContactPage() {
  return (
    <Container className="py-14 sm:py-20">
      <SectionHeading
        title="Contact"
        subtitle="Ajoute tes liens et ton email. Tu pourras brancher un formulaire (Firebase, Formspree, etc.) plus tard."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[var(--text-h)]">
            Me contacter
          </h3>
          <p className="mt-3 text-sm text-[var(--text)]">
            Email: <span className="text-[var(--text-h)]">hello@example.com</span>
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button as="a" href="mailto:hello@example.com" variant="primary">
              Envoyer un email
            </Button>
            <Button as="a" href="https://instagram.com" target="_blank" rel="noreferrer" variant="outline">
              Instagram
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[var(--text-h)]">Infos</h3>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-6">
              <dt className="text-[var(--text)]">Réponse</dt>
              <dd className="font-medium text-[var(--text-h)]">24–48h</dd>
            </div>
            <div className="flex items-center justify-between gap-6">
              <dt className="text-[var(--text)]">Zone</dt>
              <dd className="font-medium text-[var(--text-h)]">France</dd>
            </div>
          </dl>
        </Card>
      </div>
    </Container>
  )
}

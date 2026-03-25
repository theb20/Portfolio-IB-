import Container from '../../ui/Container.jsx'

const items = [
  'Direction',
  'Branding',
  'Design',
  'Motion',
  'Animated Reels',
  'Creative Direction',
  'Branding',
  'Design',
]

export default function MarqueeSection() {
  return (
    <section className="border-t border-b border-[var(--border)] bg-[color-mix(in oklab,var(--bg)_96%,transparent)] py-4">
      <Container>
        <div className="marquee">
          <div className="marquee-track">
            {[...items, ...items].map((label, i) => (
              <span
                key={`${label}-${i}`}
                className="marquee-item"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

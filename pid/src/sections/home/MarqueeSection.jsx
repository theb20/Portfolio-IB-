import { useEffect, useState } from 'react'
import Container from '../../ui/Container.jsx'
import { fetchContent } from '../../lib/api.js'

const DEFAULT_ITEMS = ['Direction', 'Branding', 'Design', 'Motion', 'Animated Reels', 'Creative Direction', 'Branding', 'Design']

export default function MarqueeSection() {
  const [items, setItems] = useState(DEFAULT_ITEMS)

  useEffect(() => {
    let mounted = true
    fetchContent('marquee')
      .then((data) => {
        if (!mounted) return
        if (Array.isArray(data?.items) && data.items.length) setItems(data.items)
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  return (
    <section className="border-t border-b border-[var(--border)] bg-[color-mix(in oklab,var(--bg)_96%,transparent)] py-4">
      <Container>
        <div className="marquee">
          <div className="marquee-track">
            {[...items, ...items].map((label, i) => (
              <span key={`${label}-${i}`} className="marquee-item">
                {label}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

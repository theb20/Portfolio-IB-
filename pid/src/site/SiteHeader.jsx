import { NavLink } from 'react-router'
import Container from '../ui/Container.jsx'
import { navItems, site } from '../data/site.js'

const linkBase =
  'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors'

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in oklab,var(--bg)_92%,transparent)] backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <NavLink
          to="/"
          className="font-semibold tracking-tight text-[var(--text-h)]"
        >
          {site.name}
        </NavLink>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  linkBase,
                  isActive
                    ? 'bg-[var(--accent-bg)] text-[var(--text-h)]'
                    : 'text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--text-h)]',
                ].join(' ')
              }
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </Container>
    </header>
  )
}

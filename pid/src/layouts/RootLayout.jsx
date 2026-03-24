import { Outlet, ScrollRestoration } from 'react-router'
import SiteFooter from '../site/SiteFooter.jsx'
import SiteHeader from '../site/SiteHeader.jsx'

export default function RootLayout() {
  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text)]">
      <ScrollRestoration />
      <SiteHeader />
      <main className="min-h-[calc(100dvh-10rem)]">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}

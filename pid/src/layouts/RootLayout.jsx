import { Outlet, useLocation } from 'react-router-dom'
import SiteFooter from '../site/SiteFooter.jsx'
import SiteHeader from '../site/SiteHeader.jsx'
import CookieConsent from '../site/CookieConsent.jsx'
import RouteTransitionOverlay from '../site/RouteTransitionOverlay.jsx'

export default function RootLayout() {
  const location = useLocation()
  const hideFooter = location.pathname === '/'

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text)]">

      <SiteHeader />

      <main className="min-h-[calc(100dvh-10rem)]">
        <Outlet />
      </main>

      {hideFooter ? null : <SiteFooter />}
      <RouteTransitionOverlay />
      <CookieConsent />
    </div>
  )
}

import { useEffect, useState } from 'react'
import Container from '../ui/Container.jsx'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import { api, fetchMyOrders, logout } from '../lib/api.js'

function getApiBase() {
  const url = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:4000/api'
  return url.replace(/\/api$/, '')
}

function statusLabel(status) {
  const labels = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    in_progress: 'En cours',
    returned: 'Retournée',
    cancelled: 'Annulée',
  }
  return labels[status] ?? status
}

function statusColor(status) {
  if (status === 'confirmed') return 'text-green-400'
  if (status === 'in_progress') return 'text-blue-400'
  if (status === 'returned') return 'text-white/50'
  if (status === 'cancelled') return 'text-red-400'
  return 'text-yellow-400'
}

export default function AccountPage() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    api
      .get('/auth/me')
      .then((res) => {
        if (!mounted) return
        const u = res?.data?.user ?? null
        setUser(u)
        if (u?.sub) {
          fetchMyOrders()
            .then((list) => {
              if (!mounted) return
              setOrders(list)
            })
            .catch(() => {})
            .finally(() => {
              if (mounted) setLoading(false)
            })
        } else {
          setLoading(false)
        }
      })
      .catch(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  async function handleLogout() {
    try {
      await logout()
    } catch {
      // ignore
    }
    setUser(null)
    setOrders([])
  }

  function handleGoogleLogin() {
    const base = getApiBase()
    const next = `${window.location.origin}/account`
    window.location.href = `${base}/api/auth/google/start?next=${encodeURIComponent(next)}`
  }

  return (
    <div className="min-h-screen">
      <Container className="px-4 pt-20 pb-10">
        <h1
          className="text-white font-bold"
          style={{ fontFamily: '"Syne", sans-serif', fontSize: 'clamp(28px, 4vw, 44px)' }}
        >
          Compte
        </h1>
        <hr className="border-t border-white/10 mt-6" />
      </Container>

      <Container className="px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Profil */}
          <Card className="p-5 lg:col-span-7">
            <h2 className="text-white font-semibold" style={{ fontFamily: '"Syne", sans-serif' }}>
              Profil
            </h2>
            {loading ? (
              <p className="mt-3 text-white/40 text-sm">Chargement…</p>
            ) : user ? (
              <div className="mt-4">
                <div className="flex items-center gap-4">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name ?? 'Avatar'}
                      className="w-12 h-12 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-lg font-bold">
                      {(user.name ?? 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{user.name ?? '—'}</p>
                    <p className="text-white/50 text-sm">{user.email ?? '—'}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline" onClick={handleLogout}>
                    Se déconnecter
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-white/60 text-sm mb-4">
                  Connectez-vous pour accéder à votre profil et votre historique de commandes.
                </p>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="inline-flex items-center gap-3 rounded-md border border-[#dadce0] bg-white px-4 py-2 text-sm font-medium text-[#3c4043] hover:bg-[#f8f9fa] transition-colors"
                >
                  <svg className="h-[18px] w-[18px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.74 1.22 9.28 3.62l6.92-6.92C36.02 2.44 30.36 0 24 0 14.62 0 6.56 5.38 2.68 13.22l8.06 6.26C12.56 13.34 17.82 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.5 24.5c0-1.64-.15-3.22-.43-4.75H24v9h12.7c-.55 2.97-2.23 5.49-4.75 7.18l7.29 5.66C43.57 37.62 46.5 31.58 46.5 24.5z" />
                    <path fill="#FBBC05" d="M10.74 28.48A14.5 14.5 0 0 1 10 24c0-1.56.26-3.07.74-4.48l-8.06-6.26A23.92 23.92 0 0 0 0 24c0 3.86.92 7.5 2.68 10.74l8.06-6.26z" />
                    <path fill="#34A853" d="M24 48c6.36 0 11.7-2.1 15.6-5.72l-7.29-5.66c-2.02 1.36-4.6 2.16-8.31 2.16-6.18 0-11.44-3.84-13.26-9.22l-8.06 6.26C6.56 42.62 14.62 48 24 48z" />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                  Continuer avec Google
                </button>
              </div>
            )}
          </Card>

          {/* Notifications */}
          <Card className="p-5 lg:col-span-5">
            <h2 className="text-white font-semibold" style={{ fontFamily: '"Syne", sans-serif' }}>
              Notifications
            </h2>
            <div className="mt-3 grid gap-2 text-sm text-white/70">
              <div className="flex items-center justify-between border border-white/10 rounded-lg p-3 bg-white/5">
                <span>Email</span>
                <span className="text-white/50">Bientôt</span>
              </div>
              <div className="flex items-center justify-between border border-white/10 rounded-lg p-3 bg-white/5">
                <span>SMS</span>
                <span className="text-white/50">Bientôt</span>
              </div>
            </div>
          </Card>

          {/* Historique commandes */}
          {user && (
            <Card className="p-5 lg:col-span-12">
              <h2 className="text-white font-semibold mb-4" style={{ fontFamily: '"Syne", sans-serif' }}>
                Historique des commandes
              </h2>
              {loading ? (
                <p className="text-white/40 text-sm">Chargement…</p>
              ) : orders.length === 0 ? (
                <div className="text-white/50 text-sm">
                  <p>Aucune commande pour le moment.</p>
                  <div className="mt-3">
                    <Button as="link" to="/shop">
                      Accéder à la boutique
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="py-2 pr-4 text-left text-white/50 font-medium">#</th>
                        <th className="py-2 pr-4 text-left text-white/50 font-medium">Statut</th>
                        <th className="py-2 pr-4 text-left text-white/50 font-medium">Durée</th>
                        <th className="py-2 pr-4 text-left text-white/50 font-medium">Total</th>
                        <th className="py-2 text-left text-white/50 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-white/5">
                          <td className="py-3 pr-4 text-white/70">#{order.id}</td>
                          <td className="py-3 pr-4">
                            <span className={`text-xs font-medium ${statusColor(order.status)}`}>
                              {statusLabel(order.status)}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-white/70">
                            {order.days ? `${order.days} jour${order.days > 1 ? 's' : ''}` : '—'}
                          </td>
                          <td className="py-3 pr-4 text-white/70">
                            {order.total != null ? `€${order.total}` : '—'}
                          </td>
                          <td className="py-3 text-white/50 text-xs">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString('fr-FR')
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </div>
      </Container>
    </div>
  )
}

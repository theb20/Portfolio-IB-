import jwt from 'jsonwebtoken'
import { WebSocketServer } from 'ws'
import { env } from '../config/env.js'

let wss

export function initSocket(httpServer) {
  wss = new WebSocketServer({ server: httpServer, path: '/ws' })

  wss.on('connection', (ws) => {
    ws.isAdmin = false

    const timeoutId = setTimeout(() => {
      try { ws.close() } catch {}
    }, 7000)

    ws.on('message', (data) => {
      let msg
      try { msg = JSON.parse(String(data)) } catch { return }

      if (msg?.type === 'auth') {
        clearTimeout(timeoutId)

        // 1. Authentification par JWT (connexion formulaire email/password)
        if (msg?.token && env.boJwtSecret) {
          try {
            const payload = jwt.verify(msg.token, env.boJwtSecret)
            if (payload?.role === 'admin') {
              ws.isAdmin = true
              ws.send(JSON.stringify({ event: 'auth.ok' }))
              return
            }
          } catch {
            // token invalide
          }
        }

        // 2. Fallback : clé admin brute (rétrocompatibilité)
        if (msg?.adminKey && env.adminApiKey && msg.adminKey === env.adminApiKey) {
          ws.isAdmin = true
          ws.send(JSON.stringify({ event: 'auth.ok' }))
          return
        }

        ws.send(JSON.stringify({ event: 'auth.ko' }))
        ws.close()
      }
    })

    ws.on('close', () => { clearTimeout(timeoutId) })
  })

  return wss
}

export function broadcastAdmin(event, payload) {
  if (!wss) return
  const message = JSON.stringify({ event, data: payload })
  for (const client of wss.clients) {
    if (client.readyState !== 1 || !client.isAdmin) continue
    client.send(message)
  }
}

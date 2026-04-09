import app from './app.js'
import { createServer } from 'http'
import { EventEmitter } from 'node:events'
import { ensureDbSchema, testDbConnection } from './config/db.js'
import { env } from './config/env.js'
import { initSocket } from './ws/socket.js'

if (env.nodeEnv === 'development') {
  EventEmitter.defaultMaxListeners = 30
}

function listenWithFallback(server, startPort, maxAttempts = 10) {
  return new Promise((resolve, reject) => {
    let port = startPort
    let attempts = 0

    const attemptListen = () => {
      const onListening = () => {
        server.off('error', onError)
        resolve(port)
      }
      server.once('listening', onListening)
      server.on('error', onError)
      server.listen(port)
    }

    const onError = (err) => {
      server.removeAllListeners('listening')
      server.off('error', onError)

      if (err?.code === 'EADDRINUSE' && attempts < maxAttempts) {
        attempts += 1
        port += 1
        attemptListen()
        return
      }
      reject(err)
    }

    attemptListen()
  })
}

async function boot() {
  try {
    await testDbConnection()
    await ensureDbSchema()
    console.log('MySQL connecté')
  } catch (error) {
    console.error('MySQL indisponible, arrêt du serveur')
    console.error(error?.message ?? error)
    process.exit(1)
  }

  const httpServer = createServer(app)
  try {
    const port = await listenWithFallback(httpServer, env.port)
    console.log(`API démarrée sur http://localhost:${port}`)
    if (port !== env.port) {
      console.warn(`Port ${env.port} occupé, bascule automatique sur ${port}`)
    }
    initSocket(httpServer)
  } catch (error) {
    console.error('Impossible de démarrer le serveur HTTP')
    console.error(error?.message ?? error)
    process.exit(1)
  }
}

boot()

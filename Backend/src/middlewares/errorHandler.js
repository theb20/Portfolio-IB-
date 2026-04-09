export function errorHandler(error, _req, res, _next) {
  const status = error.statusCode ?? 500
  const message =
    status === 500 ? 'Erreur interne du serveur' : error.message ?? 'Erreur'

  if (status >= 500) {
    console.error(error)
  }

  res.status(status).json({ error: message })
}

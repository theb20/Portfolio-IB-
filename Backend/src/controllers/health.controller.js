export function healthController(_req, res) {
  res.json({
    status: 'ok',
    service: 'portfolio-ib-api',
    timestamp: new Date().toISOString(),
  })
}

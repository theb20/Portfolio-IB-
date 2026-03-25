export async function enableAnalytics(app) {
  try {
    const mod = await import('firebase/analytics')
    const ok = await mod.isSupported()
    if (ok) mod.getAnalytics(app)
  } catch (e) {
    void e
  }
}

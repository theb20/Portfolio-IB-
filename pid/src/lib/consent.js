const KEY = 'cookie_consent'

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

export function getConsent() {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'accepted' || v === 'rejected') return v
  } catch (e) {
    void e
  }
  const c = getCookie(KEY)
  return c === 'accepted' || c === 'rejected' ? c : null
}

export function setConsent(value) {
  try {
    localStorage.setItem(KEY, value)
  } catch (e) {
    void e
  }
  document.cookie = `${KEY}=${encodeURIComponent(value)}; Max-Age=31536000; Path=/; SameSite=Lax`
}

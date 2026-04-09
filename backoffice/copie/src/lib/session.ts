import { apiBaseUrl } from "./api";

const WS_TOKEN_KEY = "bo_ws_token";

/* ─── WS token (sessionStorage, pour WebSocket uniquement) ── */
export function getWsToken(): string {
  try { return sessionStorage.getItem(WS_TOKEN_KEY) ?? ""; } catch { return ""; }
}
export function setWsToken(token: string) {
  try { sessionStorage.setItem(WS_TOKEN_KEY, token); } catch {}
}
export function clearWsToken() {
  try { sessionStorage.removeItem(WS_TOKEN_KEY); } catch {}
}

/* ─── Session HTTP (via cookie httpOnly bo_session) ─────────── */
export async function checkAdminSession(): Promise<{ email: string } | null> {
  try {
    const res = await fetch(`${apiBaseUrl}/admin/me`, {
      credentials: "include",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export async function adminLogin(email: string, password: string): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/admin/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Identifiants invalides");
  }
  const data = await res.json();
  // Stocker le token WS en sessionStorage (jamais en localStorage)
  if (data?.wsToken) setWsToken(data.wsToken);
}

export async function adminLogout(): Promise<void> {
  clearWsToken();
  try {
    await fetch(`${apiBaseUrl}/admin/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {}
}

/* ─── Rétrocompatibilité supprimée ── ne plus utiliser ──────── */
/** @deprecated Utiliser checkAdminSession() */
export function getAdminKey(): string { return getWsToken(); }
/** @deprecated Utiliser adminLogin() */
export function setAdminKey(_v: string) {}
/** @deprecated Utiliser adminLogout() */
export function clearAdminKey() { clearWsToken(); }

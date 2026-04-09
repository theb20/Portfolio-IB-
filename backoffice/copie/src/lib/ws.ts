import { getWsToken } from "./session";

export type Unsubscribe = () => void;

export function connectWS() {
  const apiBaseUrl =
    (import.meta as ImportMeta).env?.VITE_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api";
  const base = apiBaseUrl.replace(/\/api$/, "");
  const url = `${base.replace(/^https:/, "wss:").replace(/^http:/, "ws:")}/ws`;
  const ws = new WebSocket(url);

  ws.addEventListener("open", () => {
    // Envoyer le JWT (pas la clé brute)
    ws.send(JSON.stringify({ type: "auth", token: getWsToken() }));
  });

  function on(event: string, handler: (data: unknown) => void): Unsubscribe {
    const fn = (e: MessageEvent) => {
      try {
        const msg = JSON.parse(String(e.data));
        if (msg?.event === event) handler(msg?.data);
      } catch { return; }
    };
    ws.addEventListener("message", fn);
    return () => ws.removeEventListener("message", fn);
  }

  function close() {
    try {
      if (ws.readyState === WebSocket.CONNECTING) {
        // Attendre l'ouverture pour fermer proprement (évite le warning StrictMode)
        ws.addEventListener('open', () => { try { ws.close() } catch {} }, { once: true })
      } else {
        ws.close()
      }
    } catch {}
  }

  return { ws, on, close };
}

import { useEffect, useRef, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import { apiGet, apiPatch, apiPost } from "../../lib/api";
import { connectWS } from "../../lib/ws";

type MessageRow = {
  id: string | number;
  name?: string;
  email?: string;
  project?: string;
  message?: string;
  status?: string;
  createdAt?: string;
};

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  new:      { label: "Nouveau",  color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  read:     { label: "Lu",       color: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
  archived: { label: "Archivé",  color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500" },
};

function StatusBadge({ status }: { status?: string }) {
  const cfg = STATUS_CFG[status ?? "new"] ?? STATUS_CFG.new;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export default function Messages() {
  const [rows, setRows] = useState<MessageRow[]>([]);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [replies, setReplies] = useState<Record<string | number, { text: string; sending: boolean; sent: boolean }>>({});
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    let mounted = true;
    apiGet("/admin/messages")
      .then((res) => { if (!mounted) return; setRows(res?.data ?? []); })
      .catch(() => { if (!mounted) return; setError("Impossible de charger les messages."); });

    const { on, close } = connectWS();
    const offNew = on("messages.new", (msg) => setRows((prev) => [msg as MessageRow, ...prev]));
    const offUpdate = on("messages.update", (patch) => {
      const d = patch as { id: MessageRow["id"]; status?: string };
      setRows((prev) => prev.map((r) => (r.id === d.id ? { ...r, status: d.status } : r)));
    });
    return () => { mounted = false; offNew(); offUpdate(); close(); };
  }, []);

  function toggleExpand(id: string | number) {
    setExpandedId((prev) => (prev === id ? null : id));
    // Focus textarea when opening
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  async function updateStatus(id: string | number, status: string) {
    try {
      await apiPatch(`/admin/messages/${id}/status`, { status });
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch {
      setError("Impossible de mettre à jour le statut.");
    }
  }

  function setReplyText(id: string | number, text: string) {
    setReplies((p) => ({ ...p, [id]: { ...p[id], text, sending: false, sent: false } }));
  }

  async function sendReply(row: MessageRow) {
    const replyText = replies[row.id]?.text?.trim();
    if (!replyText) return;
    setReplies((p) => ({ ...p, [row.id]: { ...p[row.id], sending: true } }));
    try {
      await apiPost(`/admin/messages/${row.id}/reply`, { replyText });
      setReplies((p) => ({ ...p, [row.id]: { text: "", sending: false, sent: true } }));
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: "read" } : r)));
      setTimeout(() => setReplies((p) => ({ ...p, [row.id]: { ...p[row.id], sent: false } })), 3000);
    } catch {
      setError("Impossible d'envoyer la réponse.");
      setReplies((p) => ({ ...p, [row.id]: { ...p[row.id], sending: false } }));
    }
  }

  const newCount = rows.filter((r) => r.status === "new").length;

  return (
    <div>
      <PageBreadcrumb pageTitle="Messages" />
      {error ? <p className="text-error-500 mb-4 text-sm">{error}</p> : null}

      <ComponentCard
        title={`Boîte de réception${newCount > 0 ? ` (${newCount} nouveau${newCount > 1 ? "x" : ""})` : ""}`}
        desc="Messages reçus via le formulaire de contact."
      >
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map((row) => {
            const isExpanded = expandedId === row.id;
            const reply = replies[row.id] ?? { text: "", sending: false, sent: false };
            const isNew = (row.status ?? "new") === "new";

            return (
              <div key={String(row.id)} className={isNew ? "bg-blue-50/40 dark:bg-blue-900/5" : ""}>
                {/* Ligne principale */}
                <div
                  className="flex items-start gap-3 px-1 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                  onClick={() => {
                    toggleExpand(row.id);
                    if (isNew) updateStatus(row.id, "read");
                  }}
                >
                  {/* Avatar initiale */}
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-semibold text-gray-600 dark:text-gray-300 mt-0.5">
                    {(row.name ?? "?")[0]?.toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-medium text-sm ${isNew ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                        {row.name ?? "—"}
                      </span>
                      {row.project && (
                        <span className="text-xs text-gray-400 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5">
                          {row.project}
                        </span>
                      )}
                      <StatusBadge status={row.status} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{row.email ?? ""}</p>
                    <p className={`text-sm mt-1 ${isExpanded ? "text-gray-700 dark:text-gray-300" : "truncate text-gray-500 dark:text-gray-400"}`}>
                      {row.message ?? "—"}
                    </p>
                  </div>

                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    {row.createdAt && (
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(row.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                      </span>
                    )}
                    <span className="text-gray-400 text-xs">{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* Zone de réponse expandée */}
                {isExpanded && (
                  <div className="px-1 pb-4 pl-12">
                    {/* Message complet si long */}
                    <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                      {row.message ?? "—"}
                    </div>

                    {/* Textarea réponse */}
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                      Répondre à {row.name ?? "ce contact"} — <span className="text-gray-400">{row.email}</span>
                    </label>
                    <textarea
                      ref={isExpanded ? textareaRef : undefined}
                      rows={4}
                      value={reply.text}
                      onChange={(e) => setReplyText(row.id, e.target.value)}
                      placeholder={`Bonjour ${row.name ?? ""},...`}
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03] px-3 py-2 text-sm text-gray-800 dark:text-white/90 placeholder-gray-400 dark:placeholder-gray-600 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none resize-none"
                    />

                    <div className="mt-2 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex gap-2">
                        {(row.status ?? "new") !== "archived" && (
                          <button
                            type="button"
                            onClick={() => updateStatus(row.id, "archived")}
                            className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-white/10"
                          >
                            Archiver
                          </button>
                        )}
                        {row.email && (
                          <a
                            href={`mailto:${row.email}?subject=Re: ${encodeURIComponent(row.project ?? "Votre message")}`}
                            className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-white/10"
                          >
                            Ouvrir dans le client mail
                          </a>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => sendReply(row)}
                        disabled={reply.sending || !reply.text.trim()}
                        className="rounded-md bg-gray-900 dark:bg-white px-4 py-1.5 text-xs font-semibold text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                      >
                        {reply.sent ? "✓ Envoyé" : reply.sending ? "Envoi…" : "Envoyer la réponse"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {rows.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">Aucun message pour le moment.</p>
          )}
        </div>
      </ComponentCard>
    </div>
  );
}

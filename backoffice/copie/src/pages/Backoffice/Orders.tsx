import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import { apiGet, apiPatch, apiPost } from "../../lib/api";
import { connectWS } from "../../lib/ws";

type OrderItem = {
  id?: string;
  name?: string;
  qty?: number;
  priceDay?: number;
  priceWeek?: number;
};

type Customer = {
  name?: string;
  email?: string;
  picture?: string;
  provider?: string;
};

type OrderRow = {
  id: string;
  status?: string;
  createdAt?: string;
  days?: number;
  items?: OrderItem[];
  customer?: Customer;
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:    { label: "En attente",  color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  confirmed:  { label: "Confirmée",   color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  in_progress:{ label: "En cours",    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  returned:   { label: "Retournée",   color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  cancelled:  { label: "Annulée",     color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

function computeTotal(items: OrderItem[] = [], days = 1) {
  const subtotal = items.reduce((sum, i) => {
    const qty = Number(i?.qty) || 1;
    const priceDay = Number(i?.priceDay) || 0;
    const priceWeek = Number(i?.priceWeek) || 0;
    if (days >= 7 && priceWeek > 0) {
      const weeks = Math.floor(days / 7);
      const rem = days % 7;
      return sum + (weeks * priceWeek + rem * priceDay) * qty;
    }
    return sum + priceDay * days * qty;
  }, 0);
  return { subtotal, deposit: Math.round(subtotal * 0.2), total: subtotal + Math.round(subtotal * 0.2) };
}

function StatusBadge({ status }: { status?: string }) {
  const cfg = STATUS_CONFIG[status ?? ""] ?? { label: status ?? "—", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>{cfg.label}</span>;
}

export default function Orders() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [paymentLinks, setPaymentLinks] = useState<Record<string, { url: string; sending: boolean; copied: boolean }>>({});

  useEffect(() => {
    let mounted = true;
    apiGet("/orders")
      .then((res) => { if (!mounted) return; setRows(res?.data ?? []); })
      .catch(() => { if (!mounted) return; setError("Impossible de charger les commandes."); });
    const { on, close } = connectWS();
    const offUpdate = on("orders.update", (order) => {
      const data = order as OrderRow;
      setRows((prev) => prev.map((o) => (o.id === data.id ? { ...o, ...data } : o)));
    });
    const offNew = on("orders.new", (order) => {
      setRows((prev) => [order as OrderRow, ...prev]);
    });
    return () => { mounted = false; offUpdate(); offNew(); close(); };
  }, []);

  async function sendPaymentLink(id: string) {
    setPaymentLinks((p) => ({ ...p, [id]: { url: p[id]?.url ?? "", sending: true, copied: false } }));
    try {
      const res = await apiPost(`/orders/${id}/payment-link`, {});
      const url: string = res?.data?.url ?? "";
      setPaymentLinks((p) => ({ ...p, [id]: { url, sending: false, copied: false } }));
    } catch {
      setError("Impossible de générer le lien Stripe.");
      setPaymentLinks((p) => ({ ...p, [id]: { url: "", sending: false, copied: false } }));
    }
  }

  async function copyLink(id: string, url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setPaymentLinks((p) => ({ ...p, [id]: { ...p[id], copied: true } }));
      setTimeout(() => setPaymentLinks((p) => ({ ...p, [id]: { ...p[id], copied: false } })), 2000);
    } catch {}
  }

  async function updateStatus(id: string, status: string) {
    setError("");
    try {
      const res = await apiPatch(`/orders/${id}/status`, { status });
      const updated = res?.data;
      if (updated) setRows((prev) => prev.map((o) => (o.id === id ? { ...o, ...updated } : o)));
    } catch {
      setError("Impossible de mettre à jour la commande.");
    }
  }

  const stats = {
    total: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    active: rows.filter((r) => r.status === "in_progress").length,
    revenue: rows
      .filter((r) => r.status !== "cancelled")
      .reduce((sum, r) => sum + computeTotal(r.items, r.days).total, 0),
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Commandes" />
      {error ? <p className="text-error-500 mb-4">{error}</p> : null}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, color: "text-gray-800 dark:text-white" },
          { label: "En attente", value: stats.pending, color: "text-yellow-600 dark:text-yellow-400" },
          { label: "En cours", value: stats.active, color: "text-purple-600 dark:text-purple-400" },
          { label: "CA estimé", value: `€${stats.revenue}`, color: "text-green-600 dark:text-green-400" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-xs text-gray-400 mb-1">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <ComponentCard title="Commandes" desc="Détail complet — client, articles, montants.">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="py-3 pr-3 text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wider">#</th>
                <th className="py-3 pr-3 text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wider">Client</th>
                <th className="py-3 pr-3 text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wider">Articles</th>
                <th className="py-3 pr-3 text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wider">Durée</th>
                <th className="py-3 pr-3 text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wider">Total</th>
                <th className="py-3 pr-3 text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wider">Statut</th>
                <th className="py-3 text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const items = row.items ?? [];
                const days = row.days ?? 1;
                const totals = computeTotal(items, days);
                const isExpanded = expandedId === row.id;

                return (
                  <>
                    <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-3">
                        <button type="button" onClick={() => setExpandedId(isExpanded ? null : row.id)}
                          className="font-mono text-gray-800 dark:text-white/90 hover:underline">
                          #{row.id}
                        </button>
                      </td>

                      {/* Client */}
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2">
                          {row.customer?.picture ? (
                            <img src={row.customer.picture} alt="" className="w-7 h-7 rounded-full" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500">
                              {(row.customer?.name ?? "?")[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-gray-800 dark:text-white/90 font-medium truncate max-w-[140px]">
                              {row.customer?.name ?? "—"}
                            </p>
                            <p className="text-xs text-gray-400 truncate max-w-[140px]">
                              {row.customer?.email ?? ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Articles résumé */}
                      <td className="py-3 pr-3">
                        <p className="text-gray-700 dark:text-gray-300 text-xs">
                          {items.length === 0 ? "—" : items.length === 1
                            ? items[0].name ?? items[0].id ?? "—"
                            : `${items[0].name ?? items[0].id} +${items.length - 1}`}
                        </p>
                      </td>

                      <td className="py-3 pr-3 text-gray-600 dark:text-gray-400">
                        {days}j
                      </td>

                      <td className="py-3 pr-3">
                        <div className="text-gray-800 dark:text-white/90 font-medium">€{totals.total}</div>
                        <div className="text-xs text-gray-400">dépôt: €{totals.deposit}</div>
                      </td>

                      <td className="py-3 pr-3">
                        <StatusBadge status={row.status} />
                      </td>

                      <td className="py-3">
                        <div className="flex flex-col gap-1">
                          {row.status === "pending" && (
                            <button type="button" onClick={() => updateStatus(row.id, "confirmed")}
                              className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-100 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-400">
                              Confirmer
                            </button>
                          )}
                          {row.status === "confirmed" && (
                            <button type="button" onClick={() => updateStatus(row.id, "in_progress")}
                              className="rounded-md border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs text-purple-700 hover:bg-purple-100 dark:border-purple-900/30 dark:bg-purple-900/20 dark:text-purple-400">
                              En cours
                            </button>
                          )}
                          {(row.status === "in_progress") && (
                            <button type="button" onClick={() => updateStatus(row.id, "returned")}
                              className="rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-xs text-green-700 hover:bg-green-100 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400">
                              Retournée
                            </button>
                          )}
                          {!["cancelled", "returned"].includes(row.status ?? "") && (
                            <button type="button" onClick={() => updateStatus(row.id, "cancelled")}
                              className="rounded-md border border-red-100 bg-white px-2.5 py-1 text-xs text-red-500 hover:bg-red-50 dark:border-red-900/20 dark:bg-white/5 dark:text-red-400">
                              Annuler
                            </button>
                          )}
                          {row.customer?.email && (
                            <a href={`mailto:${row.customer.email}?subject=Commande %23${row.id}`}
                              className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300 text-center">
                              Contacter
                            </a>
                          )}
                          {/* Stripe payment link */}
                          {!["cancelled", "returned"].includes(row.status ?? "") && row.customer?.email && (() => {
                            const pl = paymentLinks[row.id];
                            if (pl?.url) return (
                              <div className="flex flex-col gap-1">
                                <a href={pl.url} target="_blank" rel="noreferrer"
                                  className="rounded-md border border-[#635bff]/40 bg-[#635bff]/10 px-2.5 py-1 text-xs text-[#635bff] hover:bg-[#635bff]/20 text-center font-medium">
                                  Ouvrir lien Stripe ↗
                                </a>
                                <button type="button" onClick={() => copyLink(row.id, pl.url)}
                                  className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300">
                                  {pl.copied ? "Copié ✓" : "Copier le lien"}
                                </button>
                              </div>
                            );
                            return (
                              <button type="button" onClick={() => sendPaymentLink(row.id)}
                                disabled={pl?.sending}
                                className="rounded-md border border-[#635bff]/40 bg-[#635bff]/10 px-2.5 py-1 text-xs text-[#635bff] hover:bg-[#635bff]/20 disabled:opacity-50">
                                {pl?.sending ? "Génération…" : "💳 Envoyer lien"}
                              </button>
                            );
                          })()}
                        </div>
                      </td>
                    </tr>

                    {/* Détail expandé */}
                    {isExpanded && (
                      <tr key={`${row.id}-detail`} className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/[0.015]">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="grid md:grid-cols-3 gap-6">
                            {/* Client complet */}
                            <div>
                              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Client</p>
                              {row.customer?.picture && (
                                <img src={row.customer.picture} alt="" className="w-10 h-10 rounded-full mb-2" />
                              )}
                              <p className="font-medium text-gray-800 dark:text-white/90">{row.customer?.name ?? "—"}</p>
                              <p className="text-sm text-gray-500">{row.customer?.email ?? "—"}</p>
                              <p className="text-xs text-gray-400 mt-1">Via {row.customer?.provider ?? "google"}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                Le {row.createdAt ? new Date(row.createdAt).toLocaleString("fr-FR") : "—"}
                              </p>
                            </div>

                            {/* Articles */}
                            <div>
                              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Articles ({days}j)</p>
                              <div className="space-y-1.5">
                                {items.map((item, i) => (
                                  <div key={i} className="flex justify-between text-sm">
                                    <span className="text-gray-700 dark:text-gray-300">{item.name ?? item.id} × {item.qty ?? 1}</span>
                                    <span className="text-gray-500">€{(item.priceDay ?? 0) * (item.qty ?? 1)}/j</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Montants */}
                            <div>
                              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Montants</p>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between"><span className="text-gray-500">Sous-total</span><span>€{totals.subtotal}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Dépôt (20%)</span><span>€{totals.deposit}</span></div>
                                <div className="flex justify-between font-bold text-base border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                                  <span>Total</span><span>€{totals.total}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Aucune commande pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ComponentCard>
    </div>
  );
}

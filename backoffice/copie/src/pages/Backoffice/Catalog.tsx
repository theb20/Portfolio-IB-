import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { apiDelete, apiGet, apiPatch, apiPost } from "../../lib/api";
import { connectWS } from "../../lib/ws";

type ProductRow = {
  id: string;
  name: string;
  category?: string;
  brand?: string;
  sku?: string;
  description?: string;
  imageUrl?: string;
  priceDay?: number;
  priceWeek?: number;
  deposit?: number;
  replacementValue?: number;
  stock?: number;
  stockAvailable?: number;
  status?: "active" | "inactive" | "maintenance";
  specs?: Record<string, string>;
};

const STATUS_LABELS: Record<string, string> = {
  active: "Actif",
  inactive: "Inactif",
  maintenance: "Maintenance",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  maintenance: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

const EMPTY_FORM = {
  name: "", category: "cameras", brand: "", sku: "",
  description: "", imageUrl: "",
  priceDay: "", priceWeek: "", deposit: "", replacementValue: "",
  stock: "1", status: "active" as const,
};

function StockBadge({ available, total }: { available?: number; total?: number }) {
  const a = available ?? 0;
  const t = total ?? 1;
  const color = a === 0 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    : a < t ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {a}/{t}
    </span>
  );
}

export default function Catalog() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState(EMPTY_FORM);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "create">("list");

  useEffect(() => {
    let mounted = true;
    apiGet("/products")
      .then((res) => { if (!mounted) return; setRows(res?.data ?? []); })
      .catch(() => { if (!mounted) return; setError("Impossible de charger le catalogue."); });
    const { on, close } = connectWS();
    const offNew = on("products.new", (p) => setRows((prev) => [p as ProductRow, ...prev]));
    const offUpdate = on("products.update", (p) => {
      const prod = p as ProductRow;
      setRows((prev) => prev.map((r) => (r.id === prod.id ? prod : r)));
    });
    const offDelete = on("products.delete", (p) => {
      const id = (p as { id: string })?.id;
      if (id) setRows((prev) => prev.filter((r) => r.id !== id));
    });
    return () => { mounted = false; offNew(); offUpdate(); offDelete(); close(); };
  }, []);

  function rowToForm(row: ProductRow) {
    return {
      name: row.name ?? "",
      category: row.category ?? "cameras",
      brand: row.brand ?? "",
      sku: row.sku ?? "",
      description: row.description ?? "",
      imageUrl: row.imageUrl ?? "",
      priceDay: String(row.priceDay ?? 0),
      priceWeek: String(row.priceWeek ?? 0),
      deposit: String(row.deposit ?? 0),
      replacementValue: String(row.replacementValue ?? 0),
      stock: String(row.stock ?? 1),
      status: (row.status ?? "active") as typeof EMPTY_FORM.status,
    };
  }

  function formToPayload(f: typeof EMPTY_FORM) {
    return {
      name: f.name.trim(),
      category: f.category.trim(),
      brand: f.brand.trim() || null,
      sku: f.sku.trim() || null,
      description: f.description.trim() || null,
      imageUrl: f.imageUrl.trim() || null,
      priceDay: Number(f.priceDay || 0),
      priceWeek: Number(f.priceWeek || 0),
      deposit: Number(f.deposit || 0),
      replacementValue: Number(f.replacementValue || 0),
      stock: Math.max(1, Number(f.stock || 1)),
      status: f.status,
    };
  }

  async function createProduct() {
    setError("");
    setCreating(true);
    try {
      const res = await apiPost("/products", formToPayload(form));
      const created = res?.data as ProductRow | undefined;
      if (created) setRows((prev) => [created, ...prev]);
      setForm(EMPTY_FORM);
      setView("list");
    } catch {
      setError("Création impossible.");
    } finally {
      setCreating(false);
    }
  }

  async function saveEdit(id: string) {
    setError("");
    try {
      const res = await apiPatch(`/products/${id}`, formToPayload(edit));
      const updated = res?.data as ProductRow | undefined;
      if (updated) setRows((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setEditingId(null);
    } catch {
      setError("Mise à jour impossible.");
    }
  }

  async function deleteRow(id: string) {
    if (!confirm("Supprimer ce produit ?")) return;
    setError("");
    try {
      await apiDelete(`/products/${id}`);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Suppression impossible.");
    }
  }

  async function toggleStatus(row: ProductRow) {
    const next = row.status === "active" ? "inactive" : "active";
    try {
      const res = await apiPatch(`/products/${row.id}`, { status: next });
      const updated = res?.data as ProductRow | undefined;
      if (updated) setRows((prev) => prev.map((r) => (r.id === row.id ? updated : r)));
    } catch {
      setError("Impossible de changer le statut.");
    }
  }

  const F = ({ label, k, type = "text", placeholder = "" }: { label: string; k: keyof typeof EMPTY_FORM; type?: string; placeholder?: string }) => (
    <div>
      <Label>{label}</Label>
      <Input type={type} placeholder={placeholder}
        value={editingId ? String(edit[k]) : String(form[k])}
        onChange={(e) => editingId
          ? setEdit((p) => ({ ...p, [k]: e.target.value }))
          : setForm((p) => ({ ...p, [k]: e.target.value }))}
      />
    </div>
  );

  const renderForm = (isEdit = false) => (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2"><F label="Nom du produit *" k="name" /></div>
      <F label="Catégorie" k="category" placeholder="cameras" />
      <F label="Marque" k="brand" placeholder="Sony" />
      <F label="SKU / Référence" k="sku" placeholder="FX3-001" />
      <F label="URL image" k="imageUrl" type="url" />
      <F label="Prix / jour (€)" k="priceDay" type="number" />
      <F label="Prix / semaine (€)" k="priceWeek" type="number" />
      <F label="Dépôt de garantie (€)" k="deposit" type="number" />
      <F label="Valeur de remplacement (€)" k="replacementValue" type="number" />
      <div>
        <Label>Stock total</Label>
        <Input type="number"
          value={isEdit ? edit.stock : form.stock}
          onChange={(e) => isEdit ? setEdit((p) => ({ ...p, stock: e.target.value })) : setForm((p) => ({ ...p, stock: e.target.value }))}
        />
      </div>
      <div>
        <Label>Statut</Label>
        <select
          value={isEdit ? edit.status : form.status}
          onChange={(e) => isEdit
            ? setEdit((p) => ({ ...p, status: e.target.value as typeof EMPTY_FORM.status }))
            : setForm((p) => ({ ...p, status: e.target.value as typeof EMPTY_FORM.status }))}
          className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <Label>Description</Label>
        <textarea
          rows={3}
          value={isEdit ? edit.description : form.description}
          onChange={(e) => isEdit ? setEdit((p) => ({ ...p, description: e.target.value })) : setForm((p) => ({ ...p, description: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />
      </div>
    </div>
  );

  return (
    <div>
      <PageBreadcrumb pageTitle="Catalogue" />
      {error ? <p className="text-error-500 mb-4">{error}</p> : null}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-800">
        {(["list", "create"] as const).map((v) => (
          <button key={v} type="button" onClick={() => setView(v)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${view === v ? "border-brand-500 text-brand-600 dark:text-brand-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}>
            {v === "list" ? `Produits (${rows.length})` : "+ Ajouter un produit"}
          </button>
        ))}
      </div>

      {/* Create form */}
      {view === "create" && (
        <ComponentCard title="Nouveau produit" desc="Remplis les informations du produit à louer.">
          {renderForm(false)}
          <div className="mt-4 flex gap-3 justify-end">
            <Button variant="outline" size="sm" onClick={() => setView("list")}>Annuler</Button>
            <Button size="sm" disabled={creating} onClick={createProduct}>
              {creating ? "Création…" : "Créer le produit"}
            </Button>
          </div>
        </ComponentCard>
      )}

      {/* Products list */}
      {view === "list" && (
        <ComponentCard title="Produits en location" desc="Stock, tarifs et disponibilités en temps réel.">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="py-3 pr-3 text-gray-700 dark:text-gray-300">Produit</th>
                  <th className="py-3 pr-3 text-gray-700 dark:text-gray-300">Catégorie</th>
                  <th className="py-3 pr-3 text-gray-700 dark:text-gray-300">Tarifs</th>
                  <th className="py-3 pr-3 text-gray-700 dark:text-gray-300">Stock dispo</th>
                  <th className="py-3 pr-3 text-gray-700 dark:text-gray-300">Statut</th>
                  <th className="py-3 text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <>
                    <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800">
                      {editingId === row.id ? (
                        <>
                          <td colSpan={5} className="py-3 pr-3">
                            {renderForm(true)}
                          </td>
                          <td className="py-3 align-top">
                            <div className="flex flex-col gap-2">
                              <button type="button" onClick={() => saveEdit(row.id)}
                                className="rounded-lg border border-brand-300 bg-brand-50 px-3 py-2 text-xs text-brand-700 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-900/20 dark:text-brand-400">
                                Enregistrer
                              </button>
                              <button type="button" onClick={() => setEditingId(null)}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300">
                                Annuler
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 pr-3">
                            <div className="flex items-center gap-3">
                              {row.imageUrl ? (
                                <img src={row.imageUrl} alt={row.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-xs">IMG</div>
                              )}
                              <div>
                                <p className="font-medium text-gray-800 dark:text-white/90">{row.name}</p>
                                {row.brand ? <p className="text-xs text-gray-400">{row.brand}{row.sku ? ` · ${row.sku}` : ""}</p> : null}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-3 text-gray-600 dark:text-gray-400">{row.category ?? "—"}</td>
                          <td className="py-3 pr-3">
                            <div className="text-gray-800 dark:text-white/90 text-xs">
                              <div>€{row.priceDay ?? 0} <span className="text-gray-400">/ j</span></div>
                              <div>€{row.priceWeek ?? 0} <span className="text-gray-400">/ sem</span></div>
                              {(row.deposit ?? 0) > 0 && <div className="text-gray-400">Dépôt: €{row.deposit}</div>}
                            </div>
                          </td>
                          <td className="py-3 pr-3">
                            <StockBadge available={row.stockAvailable} total={row.stock} />
                            {(row.replacementValue ?? 0) > 0 && (
                              <div className="text-xs text-gray-400 mt-1">Val: €{row.replacementValue}</div>
                            )}
                          </td>
                          <td className="py-3 pr-3">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[row.status ?? "active"]}`}>
                              {STATUS_LABELS[row.status ?? "active"]}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex flex-col gap-1.5">
                              <button type="button"
                                onClick={() => { setEditingId(row.id); setEdit(rowToForm(row)); }}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10">
                                Modifier
                              </button>
                              <button type="button" onClick={() => toggleStatus(row)}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10">
                                {row.status === "active" ? "Désactiver" : "Activer"}
                              </button>
                              <button type="button" onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10">
                                {expandedId === row.id ? "Masquer" : "Détails"}
                              </button>
                              <button type="button" onClick={() => deleteRow(row.id)}
                                className="rounded-lg border border-red-100 bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:bg-white/5 dark:text-red-400 dark:hover:bg-red-900/20">
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                    {expandedId === row.id && editingId !== row.id && (
                      <tr key={`${row.id}-detail`} className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/[0.02]">
                        <td colSpan={6} className="px-4 py-3">
                          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                            <div>
                              <p className="text-gray-400 text-xs mb-1">Description</p>
                              <p className="text-gray-700 dark:text-gray-300">{row.description || "—"}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs mb-1">Dépôt de garantie</p>
                              <p className="text-gray-700 dark:text-gray-300">€{row.deposit ?? 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs mb-1">Valeur de remplacement</p>
                              <p className="text-gray-700 dark:text-gray-300">€{row.replacementValue ?? 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs mb-1">Stock loué actuellement</p>
                              <p className="text-gray-700 dark:text-gray-300">{(row.stock ?? 1) - (row.stockAvailable ?? row.stock ?? 1)} / {row.stock ?? 1}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-400">
                      Aucun produit. <button type="button" onClick={() => setView("create")} className="underline text-brand-500">Créer le premier →</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}

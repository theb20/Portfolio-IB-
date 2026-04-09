import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { apiDelete, apiGet, apiPatch, apiPost } from "../../lib/api";

type PromoType = "percent" | "fixed";

type PromoCode = {
  id: number;
  code: string;
  type: PromoType;
  value: number;
  minAmount: number;
  maxUses: number | null;
  uses: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
};

type FormState = {
  code: string;
  type: PromoType;
  value: string;
  minAmount: string;
  maxUses: string;
  active: boolean;
  expiresAt: string;
};

const EMPTY_FORM: FormState = {
  code: "",
  type: "percent",
  value: "",
  minAmount: "0",
  maxUses: "",
  active: true,
  expiresAt: "",
};

function Badge({ active }: { active: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        active
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400",
      ].join(" ")}
    >
      {active ? "Actif" : "Désactivé"}
    </span>
  );
}

export default function PromoCodes() {
  const [rows, setRows] = useState<PromoCode[]>([]);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await apiGet("/promo-codes");
      setRows(res?.data ?? []);
    } catch {
      setError("Impossible de charger les codes promo.");
    }
  }

  function buildPayload(f: FormState) {
    // L'input type="date" retourne "YYYY-MM-DD" — MySQL DATETIME attend "YYYY-MM-DD HH:MM:SS"
    const expiresAt = f.expiresAt ? `${f.expiresAt} 23:59:59` : null;
    return {
      code: f.code.trim().toUpperCase(),
      type: f.type,
      value: parseFloat(f.value) || 0,
      minAmount: parseFloat(f.minAmount) || 0,
      maxUses: f.maxUses ? parseInt(f.maxUses) : null,
      active: f.active,
      expiresAt,
    };
  }

  async function create() {
    if (!form.code || !form.value) {
      setError("Code et valeur requis.");
      return;
    }
    setError("");
    setCreating(true);
    try {
      const res = await apiPost("/promo-codes", buildPayload(form));
      setRows((prev) => [res.data, ...prev]);
      setForm(EMPTY_FORM);
    } catch (e: any) {
      setError(e?.message?.includes("409") ? "Ce code existe déjà." : "Création impossible.");
    } finally {
      setCreating(false);
    }
  }

  async function saveEdit(id: number) {
    setError("");
    try {
      const res = await apiPatch(`/promo-codes/${id}`, buildPayload(editForm));
      setRows((prev) => prev.map((r) => (r.id === id ? res.data : r)));
      setEditingId(null);
    } catch {
      setError("Mise à jour impossible.");
    }
  }

  async function toggleActive(row: PromoCode) {
    try {
      const res = await apiPatch(`/promo-codes/${row.id}`, { active: !row.active });
      setRows((prev) => prev.map((r) => (r.id === row.id ? res.data : r)));
    } catch {
      setError("Impossible de modifier le statut.");
    }
  }

  async function del(id: number) {
    if (!confirm("Supprimer ce code promo ?")) return;
    try {
      await apiDelete(`/promo-codes/${id}`);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Suppression impossible.");
    }
  }

  function startEdit(row: PromoCode) {
    setEditingId(row.id);
    setEditForm({
      code: row.code,
      type: row.type,
      value: String(row.value),
      minAmount: String(row.minAmount),
      maxUses: row.maxUses !== null ? String(row.maxUses) : "",
      active: row.active,
      expiresAt: row.expiresAt ? row.expiresAt.slice(0, 10) : "",
    });
  }

  /* shared field renderer */
  function fields(f: FormState, set: (patch: Partial<FormState>) => void) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="lg:col-span-1">
          <Label>Code</Label>
          <Input
            value={f.code}
            onChange={(e) => set({ code: e.target.value.toUpperCase() })}
            placeholder="SUMMER20"
          />
        </div>
        <div>
          <Label>Type</Label>
          <select
            value={f.type}
            onChange={(e) => set({ type: e.target.value as PromoType })}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="percent">Pourcentage (%)</option>
            <option value="fixed">Montant fixe (€)</option>
          </select>
        </div>
        <div>
          <Label>{f.type === "percent" ? "Valeur (%)" : "Valeur (€)"}</Label>
          <Input
            type="number"
            value={f.value}
            onChange={(e) => set({ value: e.target.value })}
            placeholder={f.type === "percent" ? "20" : "10"}
          />
        </div>
        <div>
          <Label>Montant min (€)</Label>
          <Input
            type="number"
            value={f.minAmount}
            onChange={(e) => set({ minAmount: e.target.value })}
            placeholder="0"
          />
        </div>
        <div>
          <Label>Utilisations max</Label>
          <Input
            type="number"
            value={f.maxUses}
            onChange={(e) => set({ maxUses: e.target.value })}
            placeholder="Illimité"
          />
        </div>
        <div>
          <Label>Expire le</Label>
          <Input
            type="date"
            value={f.expiresAt}
            onChange={(e) => set({ expiresAt: e.target.value })}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Codes promo" />

      {/* Create form */}
      <ComponentCard
        title="Nouveau code promo"
        desc="Créez des codes de réduction en pourcentage ou en montant fixe."
      >
        {error && <p className="mb-3 text-sm text-error-500">{error}</p>}

        {fields(form, (patch) => setForm((p) => ({ ...p, ...patch })))}

        <div className="mt-4 flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300"
            />
            Actif dès la création
          </label>
          <Button size="sm" disabled={creating} onClick={create}>
            {creating ? "Création…" : "Créer le code"}
          </Button>
        </div>
      </ComponentCard>

      {/* Table */}
      <div className="mt-6">
        <ComponentCard title="Codes existants">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {["Code", "Type", "Valeur", "Min", "Utilisations", "Expire", "Statut", "Actions"].map((h) => (
                    <th key={h} className="py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) =>
                  editingId === row.id ? (
                    <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td colSpan={8} className="py-3">
                        <div className="space-y-3">
                          {fields(editForm, (patch) => setEditForm((p) => ({ ...p, ...patch })))}
                          <div className="flex items-center gap-4">
                            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <input
                                type="checkbox"
                                checked={editForm.active}
                                onChange={(e) => setEditForm((p) => ({ ...p, active: e.target.checked }))}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              Actif
                            </label>
                            <button
                              type="button"
                              onClick={() => saveEdit(row.id)}
                              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-white/5 dark:text-gray-300"
                            >
                              Enregistrer
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      <td className="py-3 pr-4 font-mono font-semibold text-gray-900 dark:text-white">
                        {row.code}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                        {row.type === "percent" ? "%" : "€ fixe"}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-gray-800 dark:text-gray-200">
                        {row.type === "percent" ? `${row.value}%` : `${row.value} €`}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                        {row.minAmount > 0 ? `${row.minAmount} €` : "—"}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                        {row.uses}
                        {row.maxUses !== null ? ` / ${row.maxUses}` : " / ∞"}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                        {row.expiresAt ? new Date(row.expiresAt).toLocaleDateString("fr-FR") : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <button type="button" onClick={() => toggleActive(row)}>
                          <Badge active={row.active} />
                        </button>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(row)}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-white/5 dark:text-gray-300"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => del(row.id)}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-white/5 dark:text-red-400"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-sm text-gray-400">
                      Aucun code promo créé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { apiDelete, apiGet, apiPatch, apiPost } from "../../lib/api";
import { connectWS } from "../../lib/ws";

type CategoryRow = {
  id: string;
  slug: string;
  label: string;
  sortOrder?: number;
};

export default function Categories() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ slug: "", label: "", sortOrder: "0" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState({ slug: "", label: "", sortOrder: "0" });

  useEffect(() => {
    let mounted = true;
    apiGet("/categories")
      .then((res) => {
        if (!mounted) return;
        setRows(res?.data ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Impossible de charger les catégories.");
      });
    const { on, close } = connectWS();
    const offNew = on("categories.new", (c) => setRows((prev) => [...prev, c as CategoryRow]));
    const offUpdate = on("categories.update", (c) => {
      const data = c as CategoryRow;
      setRows((prev) => prev.map((r) => (r.id === data.id ? data : r)));
    });
    const offDelete = on("categories.delete", (p) => {
      const id = (p as { id: string })?.id;
      if (!id) return;
      setRows((prev) => prev.filter((r) => r.id !== id));
    });
    return () => {
      mounted = false;
      offNew();
      offUpdate();
      offDelete();
      close();
    };
  }, []);

  async function createCategory() {
    setError("");
    setCreating(true);
    try {
      const payload = {
        slug: form.slug.trim(),
        label: form.label.trim(),
        sortOrder: Number(form.sortOrder || 0),
      };
      const res = await apiPost("/categories", payload);
      const created = res?.data as CategoryRow | undefined;
      if (created) setRows((prev) => [...prev, created]);
      setForm({ slug: "", label: "", sortOrder: "0" });
    } catch {
      setError("Création impossible.");
    } finally {
      setCreating(false);
    }
  }

  async function saveEdit(id: string) {
    setError("");
    try {
      const payload = {
        slug: edit.slug.trim(),
        label: edit.label.trim(),
        sortOrder: Number(edit.sortOrder || 0),
      };
      const res = await apiPatch(`/categories/${id}`, payload);
      const updated = res?.data as CategoryRow | undefined;
      if (updated) setRows((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setEditingId(null);
    } catch {
      setError("Mise à jour impossible.");
    }
  }

  async function deleteRow(id: string) {
    setError("");
    try {
      await apiDelete(`/categories/${id}`);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Suppression impossible.");
    }
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Catégories" />
      <ComponentCard title="Catégories du shop" desc="Gestion des catégories affichées sur /shop.">
        {error ? <p className="text-error-500">{error}</p> : null}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <Label>Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              placeholder="cameras"
            />
          </div>
          <div className="md:col-span-1">
            <Label>Label</Label>
            <Input
              value={form.label}
              onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
              placeholder="Caméras"
            />
          </div>
          <div className="md:col-span-1">
            <Label>Ordre</Label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
            />
          </div>
          <div className="md:col-span-3" />
          <div className="md:col-span-1">
            <Button className="w-full" size="sm" disabled={creating} onClick={createCategory}>
              {creating ? "Création..." : "Ajouter"}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="py-3 pr-3 text-gray-700 dark:text-gray-300">Slug</th>
                <th className="py-3 pr-3 text-gray-700 dark:text-gray-300">Label</th>
                <th className="py-3 pr-3 text-gray-700 dark:text-gray-300">Ordre</th>
                <th className="py-3 text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800">
                  {editingId === row.id ? (
                    <>
                      <td className="py-2 pr-3">
                        <Input value={edit.slug} onChange={(e) => setEdit((p) => ({ ...p, slug: e.target.value }))} />
                      </td>
                      <td className="py-2 pr-3">
                        <Input value={edit.label} onChange={(e) => setEdit((p) => ({ ...p, label: e.target.value }))} />
                      </td>
                      <td className="py-2 pr-3">
                        <Input type="number" value={edit.sortOrder} onChange={(e) => setEdit((p) => ({ ...p, sortOrder: e.target.value }))} />
                      </td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(row.id)}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                          >
                            Enregistrer
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                          >
                            Annuler
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 pr-3 text-gray-800 dark:text-white/90 font-mono text-xs">{row.slug}</td>
                      <td className="py-3 pr-3 text-gray-600 dark:text-gray-400">{row.label}</td>
                      <td className="py-3 pr-3 text-gray-600 dark:text-gray-400">{row.sortOrder ?? 0}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(row.id);
                              setEdit({
                                slug: row.slug,
                                label: row.label,
                                sortOrder: String(row.sortOrder ?? 0),
                              });
                            }}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRow(row.id)}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-red-600 hover:bg-gray-100 dark:border-gray-800 dark:bg-white/5 dark:text-red-400 dark:hover:bg-white/10"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td className="py-6 text-gray-500 dark:text-gray-400" colSpan={4}>
                    Aucune catégorie.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </ComponentCard>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import { apiDelete, apiGet, apiPatch, apiPost } from "../../lib/api";

type ProjectRow = {
  id?: string | number;
  slug?: string;
  title?: string;
  year?: string | number;
  role?: string;
  description?: string;
  tags?: string[];
  image?: string;
  videoUrl?: string;
};

const initialForm = {
  slug: "", title: "", year: "", role: "", description: "", tags: "", image: "", videoUrl: "",
};

export default function Projects() {
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [edit, setEdit] = useState(initialForm);

  useEffect(() => {
    let mounted = true;
    apiGet("/projects")
      .then((res) => { if (!mounted) return; setRows(res?.data ?? []); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const fields = useMemo(() => [
    { key: "slug", label: "Slug", type: "text" },
    { key: "title", label: "Titre", type: "text" },
    { key: "year", label: "Année", type: "text" },
    { key: "role", label: "Rôle", type: "text" },
    { key: "tags", label: "Tags (csv)", type: "text" },
    { key: "image", label: "URL image", type: "text" },
    { key: "videoUrl", label: "URL vidéo", type: "text" },
  ], []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
      const res = await apiPost("/projects", payload);
      const created = res?.data;
      if (created) { setRows((prev) => [created, ...prev]); setForm(initialForm); }
    } catch { setError("Création impossible (vérifiez la clé admin)."); }
  }

  async function saveEdit(slug: string) {
    setError("");
    try {
      const payload = { ...edit, tags: edit.tags.split(",").map((t) => t.trim()).filter(Boolean) };
      const res = await apiPatch(`/projects/${slug}`, payload);
      const updated = res?.data as ProjectRow | undefined;
      if (updated) setRows((prev) => prev.map((r) => (r.slug === slug ? updated : r)));
      setEditingSlug(null);
    } catch { setError("Mise à jour impossible."); }
  }

  async function deleteRow(slug: string) {
    if (!confirm(`Supprimer le projet "${slug}" ?`)) return;
    setError("");
    try {
      await apiDelete(`/projects/${slug}`);
      setRows((prev) => prev.filter((r) => r.slug !== slug));
    } catch { setError("Suppression impossible."); }
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Projets" />
      <div className="grid gap-6">
        <ComponentCard title="Ajouter un projet" desc="Création via l'API (x-admin-key).">
          {error ? <p className="text-error-500 mb-2">{error}</p> : null}
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {fields.map((f) => (
              <div key={f.key} className="md:col-span-1">
                <Label>{f.label}</Label>
                <Input type={f.type} value={form[f.key as keyof typeof form] as string}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div className="md:col-span-2">
              <Label>Description</Label>
              <textarea value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              />
            </div>
            <div className="md:col-span-2">
              <Button className="w-full" size="sm">Ajouter</Button>
            </div>
          </form>
        </ComponentCard>

        <ComponentCard title="Liste des projets" desc="CRUD complet (POST / PATCH / DELETE).">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="py-3 pr-3 text-gray-700 dark:text-gray-300">Titre</th>
                  <th className="py-3 pr-3 text-gray-700 dark:text-gray-300">Année</th>
                  <th className="py-3 pr-3 text-gray-700 dark:text-gray-300">Slug</th>
                  <th className="py-3 pr-3 text-gray-700 dark:text-gray-300">Rôle</th>
                  <th className="py-3 text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.slug ?? String(row.id)} className="border-b border-gray-100 dark:border-gray-800">
                    {editingSlug === row.slug ? (
                      <>
                        <td className="py-2 pr-3">
                          <Input value={edit.title} onChange={(e) => setEdit((p) => ({ ...p, title: e.target.value }))} />
                        </td>
                        <td className="py-2 pr-3">
                          <Input value={edit.year} onChange={(e) => setEdit((p) => ({ ...p, year: e.target.value }))} />
                        </td>
                        <td className="py-2 pr-3 text-gray-500 dark:text-gray-400 text-xs">{row.slug}</td>
                        <td className="py-2 pr-3">
                          <Input value={edit.role} onChange={(e) => setEdit((p) => ({ ...p, role: e.target.value }))} />
                        </td>
                        <td className="py-2">
                          <div className="flex gap-2">
                            <button type="button" onClick={() => saveEdit(row.slug!)}
                              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10">
                              Enregistrer
                            </button>
                            <button type="button" onClick={() => setEditingSlug(null)}
                              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10">
                              Annuler
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 pr-3 text-gray-800 dark:text-white/90">{row.title ?? "-"}</td>
                        <td className="py-3 pr-3 text-gray-600 dark:text-gray-400">{row.year ?? "-"}</td>
                        <td className="py-3 pr-3 text-gray-600 dark:text-gray-400">{row.slug ?? "-"}</td>
                        <td className="py-3 pr-3 text-gray-600 dark:text-gray-400">{row.role ?? "-"}</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button type="button"
                              onClick={() => { setEditingSlug(row.slug!); setEdit({ slug: row.slug ?? "", title: row.title ?? "", year: String(row.year ?? ""), role: row.role ?? "", description: row.description ?? "", tags: (row.tags ?? []).join(", "), image: row.image ?? "", videoUrl: row.videoUrl ?? "" }); }}
                              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10">
                              Modifier
                            </button>
                            <button type="button" onClick={() => deleteRow(row.slug!)}
                              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-red-600 hover:bg-gray-100 dark:border-gray-800 dark:bg-white/5 dark:text-red-400 dark:hover:bg-white/10">
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr><td className="py-6 text-gray-500 dark:text-gray-400" colSpan={5}>Aucun projet.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}

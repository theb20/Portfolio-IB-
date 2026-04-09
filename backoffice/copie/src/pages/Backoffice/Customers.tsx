import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { apiDelete, apiGet, apiPatch, apiPost } from "../../lib/api";
import { connectWS } from "../../lib/ws";

type CustomerRow = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  createdAt?: string;
};

export default function Customers() {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState({ name: "", email: "", phone: "", company: "" });

  useEffect(() => {
    let mounted = true;
    apiGet("/customers")
      .then((res) => {
        if (!mounted) return;
        setRows(res?.data ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Impossible de charger les clients.");
      });
    const { on, close } = connectWS();
    const offNew = on("customers.new", (c) => setRows((prev) => [c as CustomerRow, ...prev]));
    const offUpdate = on("customers.update", (c) => {
      const data = c as CustomerRow;
      setRows((prev) => prev.map((r) => (r.id === data.id ? data : r)));
    });
    const offDelete = on("customers.delete", (p) => {
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

  async function createCustomer() {
    setError("");
    setCreating(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        company: form.company.trim(),
      };
      const res = await apiPost("/customers", payload);
      const created = res?.data as CustomerRow | undefined;
      if (created) setRows((prev) => [created, ...prev]);
      setForm({ name: "", email: "", phone: "", company: "" });
    } catch {
      setError("Création impossible (vérifiez la clé admin).");
    } finally {
      setCreating(false);
    }
  }

  async function saveEdit(id: string) {
    setError("");
    try {
      const payload = {
        name: edit.name.trim(),
        email: edit.email.trim(),
        phone: edit.phone.trim(),
        company: edit.company.trim(),
      };
      const res = await apiPatch(`/customers/${id}`, payload);
      const updated = res?.data as CustomerRow | undefined;
      if (updated) setRows((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setEditingId(null);
    } catch {
      setError("Mise à jour impossible.");
    }
  }

  async function deleteCustomer(id: string) {
    setError("");
    try {
      await apiDelete(`/customers/${id}`);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Suppression impossible.");
    }
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Clients" />
      <ComponentCard title="Clients" desc="CRUD clients (documents & historique à brancher ensuite).">
        {error ? <p className="text-error-500">{error}</p> : null}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <Label>Nom</Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <Label>Téléphone</Label>
            <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <Label>Société</Label>
            <Input value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} />
          </div>
          <div className="md:col-span-3" />
          <div className="md:col-span-1">
            <Button className="w-full" size="sm" disabled={creating} onClick={createCustomer}>
              {creating ? "Création..." : "Ajouter"}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="py-3 pr-3 text-gray-700 dark:text-gray-300">Nom</th>
                <th className="py-3 pr-3 text-gray-700 dark:text-gray-300">Email</th>
                <th className="py-3 pr-3 text-gray-700 dark:text-gray-300">Téléphone</th>
                <th className="py-3 pr-3 text-gray-700 dark:text-gray-300">Société</th>
                <th className="py-3 text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800">
                  {editingId === row.id ? (
                    <>
                      <td className="py-2 pr-3">
                        <Input value={edit.name} onChange={(e) => setEdit((p) => ({ ...p, name: e.target.value }))} />
                      </td>
                      <td className="py-2 pr-3">
                        <Input value={edit.email} onChange={(e) => setEdit((p) => ({ ...p, email: e.target.value }))} />
                      </td>
                      <td className="py-2 pr-3">
                        <Input value={edit.phone} onChange={(e) => setEdit((p) => ({ ...p, phone: e.target.value }))} />
                      </td>
                      <td className="py-2 pr-3">
                        <Input value={edit.company} onChange={(e) => setEdit((p) => ({ ...p, company: e.target.value }))} />
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
                      <td className="py-3 pr-3 text-gray-800 dark:text-white/90">{row.name}</td>
                      <td className="py-3 pr-3 text-gray-600 dark:text-gray-400">{row.email ?? "-"}</td>
                      <td className="py-3 pr-3 text-gray-600 dark:text-gray-400">{row.phone ?? "-"}</td>
                      <td className="py-3 pr-3 text-gray-600 dark:text-gray-400">{row.company ?? "-"}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(row.id);
                              setEdit({
                                name: row.name ?? "",
                                email: row.email ?? "",
                                phone: row.phone ?? "",
                                company: row.company ?? "",
                              });
                            }}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCustomer(row.id)}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
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
                  <td className="py-6 text-gray-500 dark:text-gray-400" colSpan={5}>
                    Aucun client.
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


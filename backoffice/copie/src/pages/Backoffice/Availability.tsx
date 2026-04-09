import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { apiDelete, apiGet, apiPost } from "../../lib/api";
import { connectWS } from "../../lib/ws";

type BlockRow = {
  id: string;
  productId: string;
  startDate: string;
  endDate: string;
  note?: string;
  createdAt?: string;
};

export default function Availability() {
  const [rows, setRows] = useState<BlockRow[]>([]);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    startDate: "",
    endDate: "",
    note: "",
  });

  useEffect(() => {
    let mounted = true;
    apiGet("/availability")
      .then((res) => {
        if (!mounted) return;
        setRows(res?.data ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Impossible de charger les disponibilités.");
      });
    const { on, close } = connectWS();
    const offNew = on("availability.new", (b) => {
      const block = b as BlockRow;
      setRows((prev) => [block, ...prev]);
    });
    const offDelete = on("availability.delete", (p) => {
      const id = (p as { id: string })?.id;
      if (!id) return;
      setRows((prev) => prev.filter((r) => r.id !== id));
    });
    return () => {
      mounted = false;
      offNew();
      offDelete();
      close();
    };
  }, []);

  async function createBlock() {
    setError("");
    setCreating(true);
    try {
      const payload = {
        productId: form.productId.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        note: form.note.trim(),
      };
      const res = await apiPost("/availability", payload);
      const created = res?.data as BlockRow | undefined;
      if (created) setRows((prev) => [created, ...prev]);
      setForm({ productId: "", startDate: "", endDate: "", note: "" });
    } catch {
      setError("Création impossible (vérifiez la clé admin).");
    } finally {
      setCreating(false);
    }
  }

  async function deleteBlock(id: string) {
    setError("");
    try {
      await apiDelete(`/availability/${id}`);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Suppression impossible.");
    }
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Disponibilités" />
      <ComponentCard title="Blocages" desc="CRUD simple des périodes indisponibles par produit.">
        {error ? <p className="text-error-500">{error}</p> : null}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <Label>Product ID</Label>
            <Input value={form.productId} onChange={(e) => setForm((p) => ({ ...p, productId: e.target.value }))} />
          </div>
          <div className="md:col-span-1">
            <Label>Début</Label>
            <Input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
          </div>
          <div className="md:col-span-1">
            <Label>Fin</Label>
            <Input type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
          </div>
          <div className="md:col-span-3">
            <Label>Note</Label>
            <Input value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} />
          </div>
          <div className="md:col-span-1">
            <Button className="w-full" size="sm" disabled={creating} onClick={createBlock}>
              {creating ? "Création..." : "Ajouter"}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="py-3 pr-3 text-gray-700 dark:text-gray-300">Produit</th>
                <th className="py-3 pr-3 text-gray-700 dark:text-gray-300">Début</th>
                <th className="py-3 pr-3 text-gray-700 dark:text-gray-300">Fin</th>
                <th className="py-3 pr-3 text-gray-700 dark:text-gray-300">Note</th>
                <th className="py-3 text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 pr-3 text-gray-800 dark:text-white/90">{row.productId}</td>
                  <td className="py-3 pr-3 text-gray-600 dark:text-gray-400">{row.startDate}</td>
                  <td className="py-3 pr-3 text-gray-600 dark:text-gray-400">{row.endDate}</td>
                  <td className="py-3 pr-3 text-gray-600 dark:text-gray-400">{row.note ?? "-"}</td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => deleteBlock(row.id)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td className="py-6 text-gray-500 dark:text-gray-400" colSpan={5}>
                    Aucun blocage.
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


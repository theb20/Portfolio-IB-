import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { apiGet, apiPatch } from "../../lib/api";

export default function Settings() {
  const [depositRate, setDepositRate] = useState<string>("20");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    apiGet("/settings/deposit_rate")
      .then((res) => {
        if (!mounted) return;
        setDepositRate(String(res?.value ?? "20"));
      })
      .catch(() => {
        if (!mounted) return;
        setError("Impossible de charger les paramètres.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  async function save() {
    const num = parseFloat(depositRate.replace(",", "."));
    if (!Number.isFinite(num) || num < 0 || num > 100) {
      setError("Taux invalide (0–100).");
      return;
    }
    setError("");
    setSaving(true);
    setSuccess(false);
    try {
      await apiPatch("/settings/deposit_rate", { value: String(num) });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Impossible d'enregistrer.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Paramètres" />

      <ComponentCard
        title="Dépôt de garantie"
        desc="Ce taux est appliqué sur le sous-total de chaque commande. Il est affiché dans le panier et sur la page de validation."
      >
        {loading ? (
          <p className="text-sm text-gray-400">Chargement…</p>
        ) : (
          <div className="flex flex-col gap-5 max-w-sm">
            {error && <p className="text-sm text-error-500">{error}</p>}
            {success && (
              <p className="text-sm text-green-500 dark:text-green-400">
                ✓ Enregistré avec succès.
              </p>
            )}

            <div>
              <Label>Taux de dépôt (%)</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={depositRate}
                  onChange={(e) => setDepositRate(e.target.value)}
                  placeholder="20"
                />
                <span className="text-gray-500 dark:text-gray-400 text-lg font-semibold">%</span>
              </div>
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                Exemple : 20 signifie que le dépôt = 20% du sous-total.
              </p>
            </div>

            {/* Live preview */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 p-4 text-sm space-y-2">
              <p className="font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-widest mb-3">
                Aperçu (sous-total 300 €)
              </p>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Sous-total</span>
                <span>300,00 €</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Dépôt ({depositRate || 0}%)</span>
                <span>
                  {isNaN(parseFloat(depositRate))
                    ? "—"
                    : (300 * parseFloat(depositRate.replace(",", ".")) / 100).toFixed(2) + " €"}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-semibold text-gray-800 dark:text-white">
                <span>Total à payer</span>
                <span>
                  {isNaN(parseFloat(depositRate))
                    ? "—"
                    : (300 + 300 * parseFloat(depositRate.replace(",", ".")) / 100).toFixed(2) + " €"}
                </span>
              </div>
            </div>

            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        )}
      </ComponentCard>
    </div>
  );
}

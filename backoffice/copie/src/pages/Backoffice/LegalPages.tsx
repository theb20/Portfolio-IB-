import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import { apiGet, apiPatch } from "../../lib/api";

type LegalSection = { heading: string; body: string };
type LegalData = { title: string; updatedAt: string; sections: LegalSection[] };
const EMPTY: LegalData = { title: "", updatedAt: "", sections: [] };

const PAGES = [
  { key: "terms",   label: "CGU",           icon: "📋" },
  { key: "privacy", label: "Confidentialité", icon: "🔒" },
  { key: "cookies", label: "Cookies",        icon: "🍪" },
];

function SectionEditor({
  section,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  section: LegalSection;
  index: number;
  onChange: (i: number, field: keyof LegalSection, val: string) => void;
  onRemove: (i: number) => void;
  onMoveUp: (i: number) => void;
  onMoveDown: (i: number) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="group relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.02] p-4">
      {/* Order badge + controls */}
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 font-mono text-xs text-gray-400">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-xs text-gray-400">Section</span>
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => onMoveUp(index)}
            className="rounded p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30"
            title="Monter"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={() => onMoveDown(index)}
            className="rounded p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30"
            title="Descendre"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="rounded p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Supprimer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
          </button>
        </div>
      </div>

      <input
        value={section.heading}
        onChange={(e) => onChange(index, "heading", e.target.value)}
        placeholder="Titre de la section"
        className="w-full mb-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm font-semibold text-gray-800 dark:text-white/90 placeholder-gray-300 dark:placeholder-gray-600 focus:border-gray-400 focus:outline-none"
      />
      <textarea
        value={section.body}
        onChange={(e) => onChange(index, "body", e.target.value)}
        placeholder="Contenu de la section..."
        rows={4}
        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-300 dark:placeholder-gray-600 focus:border-gray-400 focus:outline-none resize-none leading-relaxed"
      />
    </div>
  );
}

function LegalEditor({ pageKey }: { pageKey: string; label: string }) {
  const [data, setData] = useState<LegalData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet(`/content/${pageKey}`)
      .then((res) => { if (res?.data) setData(res.data); })
      .catch(() => {});
  }, [pageKey]);

  function setTitle(val: string) { setData((p) => ({ ...p, title: val })); }

  function addSection() {
    setData((p) => ({ ...p, sections: [...p.sections, { heading: "", body: "" }] }));
  }

  function removeSection(i: number) {
    setData((p) => ({ ...p, sections: p.sections.filter((_, idx) => idx !== i) }));
  }

  function changeSection(i: number, field: keyof LegalSection, val: string) {
    setData((p) => ({
      ...p,
      sections: p.sections.map((s, idx) => idx === i ? { ...s, [field]: val } : s),
    }));
  }

  function moveSection(i: number, dir: 1 | -1) {
    const j = i + dir;
    setData((p) => {
      const s = [...p.sections];
      [s[i], s[j]] = [s[j], s[i]];
      return { ...p, sections: s };
    });
  }

  async function save() {
    setSaving(true); setError(""); setSaved(false);
    try {
      await apiPatch(`/content/${pageKey}`, { ...data, updatedAt: new Date().toISOString() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Impossible de sauvegarder.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-error-500 text-sm">{error}</p>}

      {/* Titre de la page */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Titre de la page</label>
        <input
          value={data.title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:border-gray-400 focus:outline-none"
        />
      </div>

      {/* Sections */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Sections ({data.sections.length})
          </label>
        </div>

        <div className="space-y-3">
          {data.sections.map((s, i) => (
            <SectionEditor
              key={i}
              section={s}
              index={i}
              onChange={changeSection}
              onRemove={removeSection}
              onMoveUp={(i) => moveSection(i, -1)}
              onMoveDown={(i) => moveSection(i, 1)}
              isFirst={i === 0}
              isLast={i === data.sections.length - 1}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addSection}
          className="mt-3 w-full rounded-xl border border-dashed border-gray-200 dark:border-gray-700 py-3 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 dark:hover:border-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          + Ajouter une section
        </button>
      </div>

      {/* Save */}
      <div className="flex items-center justify-between pt-2">
        {saved
          ? <span className="text-xs text-green-500">✓ Sauvegardé</span>
          : <span />
        }
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-gray-900 dark:bg-white px-5 py-2 text-sm font-semibold text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          {saving ? "Sauvegarde…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}

export default function LegalPages() {
  const [activeTab, setActiveTab] = useState(PAGES[0].key);
  const active = PAGES.find((p) => p.key === activeTab)!;

  return (
    <div>
      <PageBreadcrumb pageTitle="Pages légales" />

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {PAGES.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setActiveTab(p.key)}
            className={[
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
              activeTab === p.key
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
                : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5",
            ].join(" ")}
          >
            <span>{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      <ComponentCard
        title={`${active.icon} ${active.label}`}
        desc={`Éditeur de contenu — visible sur le front à /\${active.key}`}
      >
        <LegalEditor key={activeTab} pageKey={activeTab} label={active.label} />
      </ComponentCard>
    </div>
  );
}

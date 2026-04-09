import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { apiGet, apiPatch } from "../../lib/api";

// Simple JSON text editor for complex fields
function JsonEditor({ label, value, onChange }: { label: string; value: unknown; onChange: (v: unknown) => void }) {
  const [raw, setRaw] = useState(JSON.stringify(value, null, 2));
  const [err, setErr] = useState("");
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        rows={8}
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          try { onChange(JSON.parse(e.target.value)); setErr(""); }
          catch { setErr("JSON invalide"); }
        }}
        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 font-mono text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      />
      {err ? <p className="text-error-500 text-xs mt-1">{err}</p> : null}
    </div>
  );
}

type AboutContent = {
  hero: { title: string; year: string; meta: string[][] };
  bio: { para1: string; para2: string; quote: string; note: string };
  stats: { value: string; label: string }[];
  services: { title: string; desc: string }[];
  timeline: { year: string; role: string; note: string }[];
  gear: string[][];
  cta: { heading: string; body: string; video: string; buttonLabel: string };
};

const DEFAULT: AboutContent = {
  hero: { title: "Vidéaste\n&\nMachiniste", year: "2025", meta: [["Spécialité", "Cadrage · Montage"], ["Secteur", "Influence · Spectacle"], ["Base", "France"], ["Statut", "Freelance"]] },
  bio: { para1: "Vidéaste freelance centré sur le cadrage et le montage...", para2: "En parallèle...", quote: "Deux univers, une même obsession du cadre.", note: "↳ Les photographies..." },
  stats: [{ value: "60+", label: "Projets livrés" }, { value: "4 ans", label: "D'expérience" }, { value: "2", label: "Univers métiers" }],
  services: [{ title: "Montage vidéo", desc: "..." }, { title: "Cadrage & captation", desc: "..." }, { title: "Machiniste plateau", desc: "..." }, { title: "Post-production", desc: "..." }],
  timeline: [{ year: "2024–présent", role: "Vidéaste freelance", note: "Captation · Montage" }],
  gear: [["Caméra", "Sony FX3 / A7 IV"], ["Optiques", "GM 24 · 50 · 85mm"]],
  cta: { heading: "Un projet en tête ?", body: "Disponible pour missions freelance...", video: "/vds/og1.mp4", buttonLabel: "Me contacter" },
};

export default function About() {
  const [content, setContent] = useState<AboutContent>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet("/content/about")
      .then((res) => { if (res?.data) setContent(res.data); })
      .catch(() => {});
  }, []);

  async function save() {
    setSaving(true); setError(""); setSaved(false);
    try {
      await apiPatch("/content/about", content);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { setError("Impossible de sauvegarder."); }
    finally { setSaving(false); }
  }

  function updateBio(key: keyof typeof content.bio, val: string) {
    setContent((p) => ({ ...p, bio: { ...p.bio, [key]: val } }));
  }
  function updateHero(key: keyof typeof content.hero, val: string) {
    setContent((p) => ({ ...p, hero: { ...p.hero, [key]: val } }));
  }
  function updateCta(key: keyof typeof content.cta, val: string) {
    setContent((p) => ({ ...p, cta: { ...p.cta, [key]: val } }));
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Page À propos" />
      <div className="grid gap-6">
        {error ? <p className="text-error-500">{error}</p> : null}
        {saved ? <p className="text-success-500">Sauvegardé ✓</p> : null}

        {/* HERO */}
        <ComponentCard title="Hero" desc="Titre, année et méta-strip.">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Titre (séparer les lignes par \n)</Label>
              <Input value={content.hero.title} onChange={(e) => updateHero("title", e.target.value)} />
            </div>
            <div>
              <Label>Année</Label>
              <Input value={content.hero.year} onChange={(e) => updateHero("year", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <JsonEditor label='Méta-strip [["clé","valeur"],...]' value={content.hero.meta} onChange={(v) => setContent((p) => ({ ...p, hero: { ...p.hero, meta: v as string[][] } }))} />
            </div>
          </div>
        </ComponentCard>

        {/* BIO */}
        <ComponentCard title="Biographie" desc="Textes, citation et note.">
          <div className="grid gap-4">
            {(["para1", "para2", "quote", "note"] as const).map((k) => (
              <div key={k}>
                <Label>{k}</Label>
                <textarea rows={3} value={content.bio[k]}
                  onChange={(e) => updateBio(k, e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              </div>
            ))}
          </div>
        </ComponentCard>

        {/* STATS */}
        <ComponentCard title="Stats" desc="Valeurs affichées dans la section bio.">
          <div className="space-y-3">
            {content.stats.map((s, i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <div><Label>Valeur</Label><Input value={s.value} onChange={(e) => { const next = [...content.stats]; next[i] = { ...s, value: e.target.value }; setContent((p) => ({ ...p, stats: next })); }} /></div>
                <div><Label>Label</Label><Input value={s.label} onChange={(e) => { const next = [...content.stats]; next[i] = { ...s, label: e.target.value }; setContent((p) => ({ ...p, stats: next })); }} /></div>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => setContent((p) => ({ ...p, stats: [...p.stats, { value: "", label: "" }] }))}>+ Ajouter</Button>
          </div>
        </ComponentCard>

        {/* SERVICES */}
        <ComponentCard title="Prestations" desc="Liste des services.">
          <div className="space-y-4">
            {content.services.map((s, i) => (
              <div key={i} className="grid gap-3 md:grid-cols-2 border border-gray-100 dark:border-gray-800 rounded-lg p-3">
                <div><Label>Titre</Label><Input value={s.title} onChange={(e) => { const next = [...content.services]; next[i] = { ...s, title: e.target.value }; setContent((p) => ({ ...p, services: next })); }} /></div>
                <div><Label>Description</Label><Input value={s.desc} onChange={(e) => { const next = [...content.services]; next[i] = { ...s, desc: e.target.value }; setContent((p) => ({ ...p, services: next })); }} /></div>
                <div className="md:col-span-2 text-right">
                  <button type="button" onClick={() => setContent((p) => ({ ...p, services: p.services.filter((_, j) => j !== i) }))}
                    className="text-xs text-red-500 hover:text-red-700">Supprimer</button>
                </div>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => setContent((p) => ({ ...p, services: [...p.services, { title: "", desc: "" }] }))}>+ Ajouter</Button>
          </div>
        </ComponentCard>

        {/* TIMELINE */}
        <ComponentCard title="Parcours" desc="Entrées de la timeline.">
          <div className="space-y-4">
            {content.timeline.map((e, i) => (
              <div key={i} className="grid gap-3 md:grid-cols-3 border border-gray-100 dark:border-gray-800 rounded-lg p-3">
                <div><Label>Période</Label><Input value={e.year} onChange={(ev) => { const next = [...content.timeline]; next[i] = { ...e, year: ev.target.value }; setContent((p) => ({ ...p, timeline: next })); }} /></div>
                <div><Label>Rôle</Label><Input value={e.role} onChange={(ev) => { const next = [...content.timeline]; next[i] = { ...e, role: ev.target.value }; setContent((p) => ({ ...p, timeline: next })); }} /></div>
                <div><Label>Note</Label><Input value={e.note} onChange={(ev) => { const next = [...content.timeline]; next[i] = { ...e, note: ev.target.value }; setContent((p) => ({ ...p, timeline: next })); }} /></div>
                <div className="md:col-span-3 text-right">
                  <button type="button" onClick={() => setContent((p) => ({ ...p, timeline: p.timeline.filter((_, j) => j !== i) }))}
                    className="text-xs text-red-500 hover:text-red-700">Supprimer</button>
                </div>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => setContent((p) => ({ ...p, timeline: [...p.timeline, { year: "", role: "", note: "" }] }))}>+ Ajouter</Button>
          </div>
        </ComponentCard>

        {/* GEAR */}
        <ComponentCard title="Équipement" desc='Liste [["label","valeur"],...]'>
          <div className="space-y-3">
            {content.gear.map(([k, v], i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <div><Label>Label</Label><Input value={k} onChange={(e) => { const next = content.gear.map((g, j) => j === i ? [e.target.value, g[1]] : g); setContent((p) => ({ ...p, gear: next })); }} /></div>
                <div><Label>Valeur</Label><Input value={v} onChange={(e) => { const next = content.gear.map((g, j) => j === i ? [g[0], e.target.value] : g); setContent((p) => ({ ...p, gear: next })); }} /></div>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => setContent((p) => ({ ...p, gear: [...p.gear, ["", ""]] }))}>+ Ajouter</Button>
          </div>
        </ComponentCard>

        {/* CTA */}
        <ComponentCard title="Bande CTA" desc="Titre, corps, vidéo et libellé du bouton.">
          <div className="grid gap-4 md:grid-cols-2">
            {(["heading", "body", "video", "buttonLabel"] as const).map((k) => (
              <div key={k}>
                <Label>{k}</Label>
                <Input value={content.cta[k]} onChange={(e) => updateCta(k, e.target.value)} />
              </div>
            ))}
          </div>
        </ComponentCard>

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving}>{saving ? "Sauvegarde…" : "Enregistrer tout"}</Button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { apiGet, apiPatch } from "../../lib/api";

/* ─── Types ─────────────────────────────────── */
type HeroSlide = { video: string; poster: string; title: string[]; subtitle: string; cta: { label: string; to: string }; duration: number };
type ShowcaseStat = { value: string; label: string };

type HeroContent = { slides: HeroSlide[] };
type MarqueeContent = { items: string[] };
type ShowcaseContent = { heading: string; body: string; chips: string[]; stats: ShowcaseStat[] };

/* ─── Helpers ────────────────────────────────── */
function Textarea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" />
    </div>
  );
}

function SaveBar({ onSave, saving, saved, error }: { onSave: () => void; saving: boolean; saved: boolean; error: string }) {
  return (
    <div className="flex items-center gap-4 justify-end">
      {error ? <span className="text-error-500 text-sm">{error}</span> : null}
      {saved ? <span className="text-success-500 text-sm">Sauvegardé ✓</span> : null}
      <Button onClick={onSave} disabled={saving}>{saving ? "Sauvegarde…" : "Enregistrer"}</Button>
    </div>
  );
}

/* ════════════════════════════════════════════ */
export default function HomeContent() {
  const [tab, setTab] = useState<"hero" | "marquee" | "showcase">("hero");

  // Hero
  const [hero, setHero] = useState<HeroContent>({ slides: [] });
  const [heroSaving, setHeroSaving] = useState(false);
  const [heroSaved, setHeroSaved] = useState(false);
  const [heroErr, setHeroErr] = useState("");

  // Marquee
  const [marquee, setMarquee] = useState<MarqueeContent>({ items: [] });
  const [marqueeSaving, setMarqueeSaving] = useState(false);
  const [marqueeSaved, setMarqueeSaved] = useState(false);
  const [marqueeErr, setMarqueeErr] = useState("");

  // Showcase
  const [showcase, setShowcase] = useState<ShowcaseContent>({ heading: "", body: "", chips: [], stats: [] });
  const [showcaseSaving, setShowcaseSaving] = useState(false);
  const [showcaseSaved, setShowcaseSaved] = useState(false);
  const [showcaseErr, setShowcaseErr] = useState("");

  useEffect(() => {
    apiGet("/content/hero").then((r) => r?.data && setHero(r.data)).catch(() => {});
    apiGet("/content/marquee").then((r) => r?.data && setMarquee(r.data)).catch(() => {});
    apiGet("/content/showcase").then((r) => r?.data && setShowcase(r.data)).catch(() => {});
  }, []);

  async function saveHero() {
    setHeroSaving(true); setHeroErr(""); setHeroSaved(false);
    try { await apiPatch("/content/hero", hero); setHeroSaved(true); setTimeout(() => setHeroSaved(false), 3000); }
    catch { setHeroErr("Impossible de sauvegarder."); }
    finally { setHeroSaving(false); }
  }

  async function saveMarquee() {
    setMarqueeSaving(true); setMarqueeErr(""); setMarqueeSaved(false);
    try { await apiPatch("/content/marquee", marquee); setMarqueeSaved(true); setTimeout(() => setMarqueeSaved(false), 3000); }
    catch { setMarqueeErr("Impossible de sauvegarder."); }
    finally { setMarqueeSaving(false); }
  }

  async function saveShowcase() {
    setShowcaseSaving(true); setShowcaseErr(""); setShowcaseSaved(false);
    try { await apiPatch("/content/showcase", showcase); setShowcaseSaved(true); setTimeout(() => setShowcaseSaved(false), 3000); }
    catch { setShowcaseErr("Impossible de sauvegarder."); }
    finally { setShowcaseSaving(false); }
  }

  const tabs = [
    { key: "hero", label: "Hero" },
    { key: "marquee", label: "Marquee" },
    { key: "showcase", label: "Showcase" },
  ] as const;

  return (
    <div>
      <PageBreadcrumb pageTitle="Contenu — Page d'accueil" />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-800">
        {tabs.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? "border-brand-500 text-brand-600 dark:text-brand-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── HERO ─────────────────────────────── */}
      {tab === "hero" && (
        <div className="grid gap-6">
          <ComponentCard title="Slides Hero" desc="Chaque slide = vidéo de fond + texte + CTA.">
            <div className="space-y-6">
              {hero.slides.map((slide, i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Slide {i + 1}</span>
                    <button type="button" onClick={() => setHero((p) => ({ slides: p.slides.filter((_, j) => j !== i) }))}
                      className="text-xs text-red-500 hover:text-red-700">Supprimer</button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div><Label>URL vidéo</Label><Input value={slide.video} onChange={(e) => { const next = [...hero.slides]; next[i] = { ...slide, video: e.target.value }; setHero({ slides: next }); }} /></div>
                    <div><Label>Poster (image fallback)</Label><Input value={slide.poster} onChange={(e) => { const next = [...hero.slides]; next[i] = { ...slide, poster: e.target.value }; setHero({ slides: next }); }} /></div>
                    <div className="md:col-span-2">
                      <Label>Titres (une ligne par entrée, séparés par virgule)</Label>
                      <Input value={slide.title.join(", ")} onChange={(e) => { const next = [...hero.slides]; next[i] = { ...slide, title: e.target.value.split(",").map((s) => s.trim()) }; setHero({ slides: next }); }} />
                    </div>
                    <div className="md:col-span-2">
                      <Textarea label="Sous-titre" value={slide.subtitle} onChange={(v) => { const next = [...hero.slides]; next[i] = { ...slide, subtitle: v }; setHero({ slides: next }); }} rows={2} />
                    </div>
                    <div><Label>CTA — Libellé</Label><Input value={slide.cta.label} onChange={(e) => { const next = [...hero.slides]; next[i] = { ...slide, cta: { ...slide.cta, label: e.target.value } }; setHero({ slides: next }); }} /></div>
                    <div><Label>CTA — Lien (/page)</Label><Input value={slide.cta.to} onChange={(e) => { const next = [...hero.slides]; next[i] = { ...slide, cta: { ...slide.cta, to: e.target.value } }; setHero({ slides: next }); }} /></div>
                    <div><Label>Durée (ms)</Label><Input type="number" value={String(slide.duration)} onChange={(e) => { const next = [...hero.slides]; next[i] = { ...slide, duration: Number(e.target.value) }; setHero({ slides: next }); }} /></div>
                  </div>
                </div>
              ))}
              <Button size="sm" variant="outline"
                onClick={() => setHero((p) => ({ slides: [...p.slides, { video: "", poster: "/og-image.png", title: ["Titre"], subtitle: "", cta: { label: "Voir →", to: "/about" }, duration: 4000 }] }))}>
                + Ajouter un slide
              </Button>
            </div>
          </ComponentCard>
          <SaveBar onSave={saveHero} saving={heroSaving} saved={heroSaved} error={heroErr} />
        </div>
      )}

      {/* ── MARQUEE ──────────────────────────── */}
      {tab === "marquee" && (
        <div className="grid gap-6">
          <ComponentCard title="Items du bandeau défilant" desc="Mots/phrases qui défilent dans le marquee.">
            <div className="space-y-2">
              {marquee.items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input value={item} onChange={(e) => { const next = [...marquee.items]; next[i] = e.target.value; setMarquee({ items: next }); }} />
                  <button type="button" onClick={() => setMarquee((p) => ({ items: p.items.filter((_, j) => j !== i) }))}
                    className="shrink-0 text-xs text-red-500 hover:text-red-700 px-2">✕</button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => setMarquee((p) => ({ items: [...p.items, ""] }))}>+ Ajouter</Button>
            </div>
          </ComponentCard>
          <SaveBar onSave={saveMarquee} saving={marqueeSaving} saved={marqueeSaved} error={marqueeErr} />
        </div>
      )}

      {/* ── SHOWCASE ─────────────────────────── */}
      {tab === "showcase" && (
        <div className="grid gap-6">
          <ComponentCard title="Section Showcase" desc="Titre, corps du texte, chips et statistiques.">
            <div className="space-y-4">
              <div>
                <Label>Titre (séparer les lignes par \n)</Label>
                <Input value={showcase.heading} onChange={(e) => setShowcase((p) => ({ ...p, heading: e.target.value }))} />
              </div>
              <Textarea label="Corps du texte" value={showcase.body} onChange={(v) => setShowcase((p) => ({ ...p, body: v }))} rows={4} />

              <div>
                <Label>Chips (skills) — un par ligne</Label>
                <div className="space-y-2">
                  {showcase.chips.map((chip, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input value={chip} onChange={(e) => { const next = [...showcase.chips]; next[i] = e.target.value; setShowcase((p) => ({ ...p, chips: next })); }} />
                      <button type="button" onClick={() => setShowcase((p) => ({ ...p, chips: p.chips.filter((_, j) => j !== i) }))}
                        className="shrink-0 text-xs text-red-500 hover:text-red-700 px-2">✕</button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => setShowcase((p) => ({ ...p, chips: [...p.chips, ""] }))}>+ Ajouter</Button>
                </div>
              </div>

              <div>
                <Label>Stats</Label>
                <div className="space-y-3">
                  {showcase.stats.map((s, i) => (
                    <div key={i} className="grid grid-cols-2 gap-3">
                      <div><Label>Valeur</Label><Input value={s.value} onChange={(e) => { const next = [...showcase.stats]; next[i] = { ...s, value: e.target.value }; setShowcase((p) => ({ ...p, stats: next })); }} /></div>
                      <div><Label>Label</Label><Input value={s.label} onChange={(e) => { const next = [...showcase.stats]; next[i] = { ...s, label: e.target.value }; setShowcase((p) => ({ ...p, stats: next })); }} /></div>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => setShowcase((p) => ({ ...p, stats: [...p.stats, { value: "", label: "" }] }))}>+ Ajouter</Button>
                </div>
              </div>
            </div>
          </ComponentCard>
          <SaveBar onSave={saveShowcase} saving={showcaseSaving} saved={showcaseSaved} error={showcaseErr} />
        </div>
      )}
    </div>
  );
}

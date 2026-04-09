import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { apiGet, apiPatch } from "../../lib/api";

type Socials = {
  instagram: string;
  youtube: string;
  tiktok: string;
  vimeo: string;
  twitter: string;
  linkedin: string;
  facebook: string;
  behance: string;
};

type OwnerData = {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  siret: string;
  iban: string;
  bankName: string;
  website: string;
  logoUrl: string;
  signature: string;
  socials: Socials;
};

const DEFAULT: OwnerData = {
  name: "Ibrahima Baby",
  email: "",
  phone: "",
  location: "France",
  bio: "",
  siret: "",
  iban: "",
  bankName: "",
  website: "",
  logoUrl: "",
  signature: "",
  socials: {
    instagram: "",
    youtube: "",
    tiktok: "",
    vimeo: "",
    twitter: "",
    linkedin: "",
    facebook: "",
    behance: "",
  },
};

/* ─── Social network config ─────────────────────────────── */
const SOCIAL_NETWORKS: {
  key: keyof Socials;
  label: string;
  placeholder: string;
  color: string;
  baseUrl: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "@votre_handle",
    color: "#E1306C",
    baseUrl: "https://instagram.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    key: "youtube",
    label: "YouTube",
    placeholder: "@votre_chaine",
    color: "#FF0000",
    baseUrl: "https://youtube.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    key: "tiktok",
    label: "TikTok",
    placeholder: "@votre_compte",
    color: "#000000",
    baseUrl: "https://tiktok.com/@",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1-.07z" />
      </svg>
    ),
  },
  {
    key: "vimeo",
    label: "Vimeo",
    placeholder: "votre_compte",
    color: "#1AB7EA",
    baseUrl: "https://vimeo.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 12.12C4.603 9.533 3.83 8.237 3 8.237c-.188 0-.84.393-1.962 1.18L0 8.105c1.238-1.096 2.Farm5-2.179 3.736-3.241 1.689-1.46 2.951-2.224 3.785-2.267 1.975-.184 3.19 1.161 3.647 4.035.495 3.096.838 5.019 1.024 5.765.568 2.582 1.19 3.87 1.862 3.87.526 0 1.319-.833 2.374-2.498 1.056-1.664 1.619-2.935 1.692-3.815.149-1.683-.489-2.589-1.692-2.589-.606 0-1.229.136-1.871.404 1.245-4.063 3.619-6.038 7.123-5.917 2.599.083 3.815 1.761 3.297 4.164z" />
      </svg>
    ),
  },
  {
    key: "twitter",
    label: "X / Twitter",
    placeholder: "@votre_compte",
    color: "#000000",
    baseUrl: "https://x.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "votre-profil",
    color: "#0A66C2",
    baseUrl: "https://linkedin.com/in/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    key: "facebook",
    label: "Facebook",
    placeholder: "votre.page",
    color: "#1877F2",
    baseUrl: "https://facebook.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    key: "behance",
    label: "Behance",
    placeholder: "votre_profil",
    color: "#1769FF",
    baseUrl: "https://behance.net/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.767-.62.17-1.28.254-1.97.254H0V4.51h6.938zm-.24 4.872c.57 0 1.036-.13 1.405-.4.367-.27.554-.7.554-1.29 0-.33-.06-.6-.175-.82-.12-.22-.28-.4-.483-.53-.2-.13-.43-.22-.69-.27-.26-.05-.52-.074-.79-.074H3.1v3.4h3.6zm.15 5.1c.29 0 .56-.03.81-.09.25-.06.47-.16.66-.3.19-.14.34-.33.44-.57.1-.24.16-.54.16-.9 0-.72-.2-1.24-.6-1.55-.4-.31-.93-.46-1.58-.46H3.1v3.87h3.75zm10.98-2.52c.28.27.43.67.43 1.2H14.1c.04.6.23 1.04.57 1.32.34.28.77.42 1.3.42.37 0 .68-.09.94-.27.26-.18.42-.37.48-.57h2.4c-.38 1.17-1 2-1.83 2.5-.83.5-1.84.75-3.01.75-.82 0-1.56-.13-2.22-.4-.66-.27-1.22-.65-1.67-1.15-.45-.5-.8-1.08-1.04-1.75-.24-.67-.36-1.4-.36-2.2 0-.78.12-1.5.37-2.17.25-.67.6-1.25 1.06-1.74.46-.49 1.02-.87 1.67-1.14.65-.27 1.38-.41 2.18-.41.89 0 1.67.17 2.33.5.66.34 1.2.79 1.63 1.36.43.57.74 1.22.93 1.95.19.73.25 1.5.19 2.3h-5.6c0 .54.14.93.43 1.2zm-1.12-3.16c-.29-.25-.7-.38-1.22-.38-.36 0-.66.06-.9.18-.24.12-.44.27-.59.45-.15.18-.26.37-.32.58-.07.21-.1.41-.11.6h3.58c-.06-.58-.25-1.03-.44-1.43zm-3.5-5.4h4.32v1.08h-4.32V3.8z" />
      </svg>
    ),
  },
];

export default function OwnerProfile() {
  const [data, setData] = useState<OwnerData>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet("/content/owner")
      .then((res) => {
        if (res?.data) {
          setData((prev) => ({
            ...prev,
            ...res.data,
            socials: { ...prev.socials, ...(res.data.socials ?? {}) },
          }));
        }
      })
      .catch(() => {});
  }, []);

  function set(key: keyof Omit<OwnerData, "socials">, val: string) {
    setData((p) => ({ ...p, [key]: val }));
  }

  function setSocial(key: keyof Socials, val: string) {
    setData((p) => ({ ...p, socials: { ...p.socials, [key]: val } }));
  }

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await apiPatch("/content/owner", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Impossible de sauvegarder.");
    } finally {
      setSaving(false);
    }
  }

  const field = (label: string, key: keyof Omit<OwnerData, "socials">, type = "text") => (
    <div>
      <Label>{label}</Label>
      <Input type={type} value={data[key]} onChange={(e) => set(key, e.target.value)} />
    </div>
  );

  return (
    <div>
      <PageBreadcrumb pageTitle="Profil propriétaire" />
      <div className="grid gap-6">
        {error ? <p className="text-error-500 text-sm">{error}</p> : null}
        {saved ? <p className="text-success-500 text-sm">Sauvegardé ✓</p> : null}

        {/* Identité */}
        <ComponentCard title="Identité" desc="Informations personnelles d'Ibrahima Baby.">
          <div className="grid gap-4 md:grid-cols-2">
            {field("Nom complet", "name")}
            {field("Email professionnel", "email", "email")}
            {field("Téléphone", "phone", "tel")}
            {field("Localisation", "location")}
            <div className="md:col-span-2">
              <Label>Biographie courte</Label>
              <textarea
                rows={4}
                value={data.bio}
                onChange={(e) => set("bio", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          </div>
        </ComponentCard>

        {/* Réseaux sociaux */}
        <ComponentCard
          title="Réseaux sociaux"
          desc="Laissez vide pour désactiver le réseau sur le site."
        >
          <div className="grid gap-3 md:grid-cols-2">
            {SOCIAL_NETWORKS.map((network) => {
              const value = data.socials[network.key];
              const isActive = Boolean(value?.trim());

              return (
                <div
                  key={network.key}
                  className={[
                    "flex items-center gap-3 rounded-xl border p-3 transition-all",
                    isActive
                      ? "border-gray-200 bg-white dark:border-gray-700 dark:bg-white/[0.03]"
                      : "border-dashed border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-white/[0.01] opacity-60",
                  ].join(" ")}
                >
                  {/* Icône réseau */}
                  <div
                    className={[
                      "flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-lg transition-all",
                      isActive ? "opacity-100" : "opacity-30 grayscale",
                    ].join(" ")}
                    style={{ color: isActive ? network.color : undefined, background: isActive ? `${network.color}15` : "#f3f4f6" }}
                  >
                    {network.icon}
                  </div>

                  {/* Input */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {network.label}
                      {isActive && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-green-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                          Actif
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="flex-shrink-0 text-xs text-gray-400 hidden sm:block truncate max-w-[100px]">
                        {network.baseUrl}
                      </span>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setSocial(network.key, e.target.value)}
                        placeholder={network.placeholder}
                        className="flex-1 min-w-0 rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-2.5 py-1.5 text-sm text-gray-800 dark:text-white/90 placeholder-gray-300 dark:placeholder-gray-600 focus:border-gray-400 focus:outline-none"
                      />
                      {isActive && (
                        <a
                          href={`${network.baseUrl}${value.replace(/^@/, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-md border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                          title="Ouvrir"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ComponentCard>

        {/* Légal */}
        <ComponentCard title="Informations légales & bancaires" desc="Données utilisées pour la facturation.">
          <div className="grid gap-4 md:grid-cols-2">
            {field("SIRET", "siret")}
            {field("Banque", "bankName")}
            {field("IBAN", "iban")}
          </div>
        </ComponentCard>

        {/* Web */}
        <ComponentCard title="Présence web" desc="Site et assets visuels.">
          <div className="grid gap-4 md:grid-cols-2">
            {field("Site web", "website", "url")}
            {field("URL logo", "logoUrl", "url")}
            <div className="md:col-span-2">
              <Label>Signature email / devis</Label>
              <textarea
                rows={3}
                value={data.signature}
                onChange={(e) => set("signature", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          </div>
        </ComponentCard>

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving}>
            {saving ? "Sauvegarde…" : "Enregistrer"}
          </Button>
        </div>
      </div>
    </div>
  );
}

import { getDbPool } from '../config/db.js'

/* ─── Valeurs par défaut de chaque section ─────────────── */
const DEFAULTS = {
  hero: {
    slides: [
      {
        video: '/vds/og4.mp4',
        poster: '/og-image.png',
        title: ['Mon secteur', "d'activité"],
        subtitle: 'Experience bespoke visuals where craft and serene luxury converge.',
        cta: { label: 'Mon profil →', to: '/about' },
        duration: 4000,
      },
    ],
  },

  marquee: {
    items: ['Direction', 'Branding', 'Design', 'Motion', 'Animated Reels', 'Creative Direction', 'Branding', 'Design'],
  },

  showcase: {
    heading: 'Une direction.\nUn rythme.\nUne signature.',
    body: "Je produis des images au rendu cinématographique — documentaires, clips, films de marque. Chaque projet est pensé comme une scène : intention, lumière, mouvement, et montage.",
    chips: ['Montage', 'Cadrage', 'Documentaire', 'Clip', 'Film de marque', 'Direction artistique', 'Sound design', 'Sous-titres', 'Delivery'],
    stats: [
      { value: '60+', label: 'Projets livrés' },
      { value: '4 ans', label: "D'expérience" },
      { value: '100%', label: 'Focus' },
    ],
  },

  about: {
    hero: {
      title: 'Vidéaste\n&\nMachiniste',
      year: '2025',
      meta: [
        ['Spécialité', 'Cadrage · Montage'],
        ['Secteur', 'Influence · Spectacle'],
        ['Base', 'France'],
        ['Statut', 'Freelance'],
      ],
    },
    bio: {
      para1: "Vidéaste freelance centré sur le cadrage et le montage de contenus pour créateurs — clips, documentaires, films de marque.",
      para2: "En parallèle, j'interviens comme assistant sur des boîtes de production et comme machiniste du spectacle dans des théâtres et opéras — deux univers qui nourrissent la même obsession du cadre, de la lumière, du rythme.",
      quote: "Deux univers, une même obsession du cadre.",
      note: "↳ Les photographies prises en théâtre visibles dans le portfolio sont issues de ces prestations scéniques.",
    },
    stats: [
      { value: '60+', label: 'Projets livrés' },
      { value: '4 ans', label: "D'expérience" },
      { value: '2', label: 'Univers métiers' },
    ],
    services: [
      { title: 'Montage vidéo', desc: 'Long format documentaire, court format Reels / Shorts, film de marque, clip artistique.' },
      { title: 'Cadrage & captation', desc: "Prise de vue solo ou en équipe. Direction d'image pour influenceurs et créateurs de contenu." },
      { title: 'Machiniste plateau', desc: 'Spectacle vivant, théâtre, opéra. Gestion des décors, cintres et équipements scéniques.' },
      { title: 'Post-production', desc: 'Sound design, sous-titres, étalonnage, delivery multi-plateforme.' },
    ],
    timeline: [
      { year: '2024–présent', role: 'Vidéaste freelance — contenus créateurs', note: 'Captation · Montage · Direction artistique' },
      { year: '2022–présent', role: 'Machiniste du spectacle', note: 'Théâtres · Opéras · Salles de spectacle' },
      { year: '2021–2024', role: 'Assistant production vidéo', note: 'Boîtes de prod — tournages institutionnels' },
      { year: '2020', role: 'Premiers projets indépendants', note: 'Clips · Documentaires courts' },
    ],
    gear: [
      ['Caméra', 'Sony FX3 / A7 IV'],
      ['Optiques', 'GM 24 · 50 · 85mm'],
      ['Stabilisation', 'DJI RS3 Pro'],
      ['Montage', 'Premiere · DaVinci'],
      ['Son', 'Rode NTG5 · Zoom F6'],
      ['Delivery', 'Frame.io · WeTransfer'],
    ],
    cta: {
      heading: 'Un projet en tête ?',
      body: 'Disponible pour missions freelance, collaborations régulières ou tournages ponctuels.',
      video: '/vds/og1.mp4',
      buttonLabel: 'Me contacter',
    },
  },

  owner: {
    name: 'Ibrahima Baby',
    email: '',
    phone: '',
    location: 'France',
    bio: '',
    siret: '',
    iban: '',
    bankName: '',
    website: '',
    logoUrl: '',
    signature: '',
    socials: {
      instagram: '',
      youtube: '',
      tiktok: '',
      vimeo: '',
      twitter: '',
      linkedin: '',
      facebook: '',
      behance: '',
    },
  },

  terms: {
    title: 'Conditions Générales d\'Utilisation',
    updatedAt: '',
    sections: [
      { heading: 'Objet', body: 'Les présentes conditions générales régissent l\'utilisation du service de location de matériel proposé par Ibrahima Baby.' },
      { heading: 'Réservation', body: 'Toute réservation implique l\'acceptation des présentes conditions. La réservation est confirmée après réception du paiement.' },
      { heading: 'Dépôt de garantie', body: 'Un dépôt de garantie de 20% du montant total est requis. Il est restitué dans les 7 jours suivant le retour du matériel en bon état.' },
      { heading: 'Responsabilité', body: 'Le locataire est responsable du matériel pendant toute la durée de la location. Tout dommage ou perte sera facturé à la valeur de remplacement.' },
      { heading: 'Annulation', body: 'Toute annulation doit être effectuée au moins 48h avant la date de début de location pour obtenir un remboursement intégral.' },
    ],
  },

  privacy: {
    title: 'Politique de Confidentialité',
    updatedAt: '',
    sections: [
      { heading: 'Données collectées', body: 'Nous collectons uniquement les données nécessaires à la gestion de vos réservations : nom, adresse email, et informations de paiement.' },
      { heading: 'Utilisation des données', body: 'Vos données sont utilisées exclusivement pour le traitement de vos commandes et la communication relative à vos locations.' },
      { heading: 'Conservation', body: 'Vos données sont conservées pendant la durée légalement requise, puis supprimées de manière sécurisée.' },
      { heading: 'Droits', body: 'Vous disposez d\'un droit d\'accès, de rectification et de suppression de vos données. Contactez-nous à l\'adresse email disponible sur ce site.' },
      { heading: 'Cookies', body: 'Ce site utilise des cookies techniques nécessaires à son fonctionnement. Aucun cookie de tracking tiers n\'est utilisé sans votre consentement.' },
    ],
  },

  cookies: {
    title: 'Politique de Cookies',
    updatedAt: '',
    sections: [
      { heading: 'Qu\'est-ce qu\'un cookie ?', body: 'Un cookie est un petit fichier texte déposé sur votre appareil lors de la visite d\'un site web. Il permet de mémoriser vos préférences et d\'améliorer votre expérience.' },
      { heading: 'Cookies utilisés', body: 'Ce site utilise uniquement des cookies strictement nécessaires au fonctionnement (session d\'authentification, préférences de thème). Aucune donnée n\'est partagée avec des tiers à des fins publicitaires.' },
      { heading: 'Durée de vie', body: 'Les cookies de session expirent à la fermeture du navigateur. Les cookies de préférences sont conservés 12 mois.' },
      { heading: 'Gestion', body: 'Vous pouvez configurer votre navigateur pour refuser les cookies. Certaines fonctionnalités du site pourraient alors ne plus être disponibles.' },
    ],
  },
}

const ALLOWED_SECTIONS = new Set(Object.keys(DEFAULTS))

function parseJson(value) {
  if (value == null) return null
  if (typeof value === 'object') return value
  try { return JSON.parse(String(value)) } catch { return null }
}

export async function getContentSection(section) {
  if (!ALLOWED_SECTIONS.has(section)) return null

  try {
    const db = getDbPool()
    const [rows] = await db.query(
      `SELECT payload_json AS payloadJson FROM site_content WHERE section = ? LIMIT 1`,
      [section],
    )
    if (rows[0]) {
      const parsed = parseJson(rows[0].payloadJson)
      if (parsed) return parsed
    }
  } catch {
    // DB might not exist yet — fall through to defaults
  }

  return DEFAULTS[section]
}

export async function setContentSection(section, payload) {
  if (!ALLOWED_SECTIONS.has(section)) return null

  const db = getDbPool()
  await db.query(
    `INSERT INTO site_content (section, payload_json)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE payload_json = VALUES(payload_json), updated_at = CURRENT_TIMESTAMP`,
    [section, JSON.stringify(payload)],
  )

  return getContentSection(section)
}

export { DEFAULTS }

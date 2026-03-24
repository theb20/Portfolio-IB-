export const projects = [
  {
    slug: 'clip-creative-01',
    title: 'Clip créateur — Montage',
    year: '2025',
    role: 'Montage • Color',
    tags: ['Montage', 'Color', 'Réseaux'],
    description:
      'Montage dynamique pensé pour la rétention, avec rythme, sound design et sous-titres.',
    links: {
      video: 'https://example.com',
    },
  },
  {
    slug: 'captation-live-01',
    title: 'Captation spectacle — Multi-cam',
    year: '2024',
    role: 'Cadrage • Machiniste',
    tags: ['Captation', 'Multi-cam', 'Spectacle'],
    description:
      'Captation multi-cam avec gestion du plateau, synchro et export multi-formats.',
    links: {
      video: 'https://example.com',
    },
  },
]

export function getProjectBySlug(slug) {
  return projects.find((p) => p.slug === slug) ?? null
}

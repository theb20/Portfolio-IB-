import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Container from '../ui/Container.jsx'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import { submitContactMessage } from '../lib/api.js'

const MotionDiv = motion.div

const catalog = [
  {
    id: 'fx3',
    name: 'Sony FX3',
    brand: 'Sony',
    sensor: 'Full-frame',
    mount: 'E-mount',
    priceDay: 120,
    priceWeek: 650,
    image: '/og-image.png',
    notes: ['S-Log3', '4K 120p', 'Compact'],
  },
  {
    id: 'bmpcc6k',
    name: 'Blackmagic Pocket 6K',
    brand: 'Blackmagic',
    sensor: 'Super 35',
    mount: 'EF',
    priceDay: 90,
    priceWeek: 500,
    image: '/og-image.png',
    notes: ['BRAW', '6K', 'Color science'],
  },
  {
    id: 'a7s3',
    name: 'Sony A7S III',
    brand: 'Sony',
    sensor: 'Full-frame',
    mount: 'E-mount',
    priceDay: 100,
    priceWeek: 560,
    image: '/og-image.png',
    notes: ['Low-light', '4K 120p', '10-bit'],
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export default function OrderPage() {
  const items = useMemo(() => catalog, [])
  const [form, setForm] = useState({
    name: '',
    email: '',
    cameraId: items[0]?.id ?? '',
    startDate: '',
    endDate: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const camera = items.find((i) => i.id === form.cameraId)
      const payload = {
        name: form.name,
        email: form.email,
        project: 'Location caméra',
        message: [
          `Caméra: ${camera?.name ?? form.cameraId}`,
          `Période: ${form.startDate || '?'} → ${form.endDate || '?'}`,
          `Notes: ${form.message || '-'}`,
        ].join('\n'),
      }
      await submitContactMessage(payload)
      setSubmitted(true)
      setForm({ ...form, message: '' })
    } catch {
      setError("Impossible d'envoyer la demande pour le moment.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Container className="px-4">
        <MotionDiv
          className="pt-20 pb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-end justify-between">
            <motion.h1
              className="font-bold text-white leading-none tracking-tight"
              style={{ fontFamily: '"Syne", sans-serif', fontSize: 'clamp(44px, 8vw, 96px)' }}
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              Locations
            </motion.h1>
            <motion.div
              className="hidden sm:flex flex-col items-end gap-1 pb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <span className="text-white/25 text-[11px] uppercase tracking-[0.22em]">Catalogue</span>
              <span className="text-white/15 text-[11px] font-mono">{items.length} caméras</span>
            </motion.div>
          </div>
          <hr className="border-t border-white/10 mt-6" />
        </MotionDiv>
      </Container>

      <Container className="px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <motion.div key={item.id} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <Card className="overflow-hidden">
                <div className="aspect-[16/9] w-full bg-black/20">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <h3
                      className="text-white font-semibold tracking-tight"
                      style={{ fontFamily: '"Syne", sans-serif', fontSize: 'clamp(18px, 2.2vw, 22px)' }}
                    >
                      {item.name}
                    </h3>
                    <span className="text-white/30 text-[12px] uppercase tracking-[0.16em]">{item.brand}</span>
                  </div>
                  <p className="text-white/45 text-[13px]">
                    {item.sensor} · {item.mount}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {item.notes.map((n) => (
                      <span
                        key={n}
                        className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-white/80 text-sm">
                      <strong className="text-white">€{item.priceDay}</strong> / jour
                    </span>
                    <span className="text-white/50 text-sm">€{item.priceWeek} / semaine</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>

      <Container className="px-4">
        <MotionDiv
          className="my-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-5 lg:col-span-2">
            <h2
              className="text-white font-bold mb-3"
              style={{ fontFamily: '"Syne", sans-serif', fontSize: 'clamp(20px, 2.8vw, 28px)' }}
            >
              Demande de devis
            </h2>
            <p className="text-white/45 text-sm mb-4">
              Sélectionnez une caméra et indiquez la période souhaitée. Je vous recontacte rapidement.
            </p>
            <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-white/40 text-[12px] uppercase tracking-[0.18em]">Nom</span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-white/40 text-[12px] uppercase tracking-[0.18em]">Email</span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-white/40 text-[12px] uppercase tracking-[0.18em]">Caméra</span>
                <select
                  value={form.cameraId}
                  onChange={(e) => setForm((p) => ({ ...p, cameraId: e.target.value }))}
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-white/40 text-[12px] uppercase tracking-[0.18em]">Début</span>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-white/40 text-[12px] uppercase tracking-[0.18em]">Fin</span>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white"
                />
              </label>
              <label className="sm:col-span-2 grid gap-1">
                <span className="text-white/40 text-[12px] uppercase tracking-[0.18em]">Notes</span>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white"
                />
              </label>
              <div className="sm:col-span-2 flex items-center justify-between pt-2">
                <span className="text-white/50 text-sm">
                  En envoyant, vous acceptez de recevoir une réponse par email.
                </span>
                <Button as="button" type="submit" disabled={submitting} className="min-w-[160px]">
                  {submitting ? 'Envoi…' : 'Demander un devis'}
                </Button>
              </div>
              {submitted && (
                <p className="sm:col-span-2 text-[var(--accent)] text-sm">Demande envoyée. Merci, à très vite.</p>
              )}
              {error && <p className="sm:col-span-2 text-red-400 text-sm">{error}</p>}
            </form>
          </Card>
          <Card className="p-5">
            <h3 className="text-white font-semibold mb-3" style={{ fontFamily: '"Syne", sans-serif' }}>
              Infos & options
            </h3>
            <ul className="grid gap-2 text-white/60 text-sm">
              <li>Réduction long métrage et associations</li>
              <li>Assurance et caution requises</li>
              <li>Options: trépied, matte box, follow focus, média</li>
              <li>Retrait/Retour: Paris</li>
            </ul>
            <div className="mt-4">
              <Button as="link" variant="outline" to="/contact">
                Contacter directement
              </Button>
            </div>
          </Card>
        </MotionDiv>
      </Container>
    </div>
  )
}

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { getConsent, setConsent } from '../lib/consent.js'
import { enableAnalytics } from '../lib/firebaseAnalytics.js'

const MotionDiv = motion.div

export default function CookieConsent() {
  const [open, setOpen] = useState(() => getConsent() === null)

  const accept = async () => {
    setConsent('accepted')
    const app = globalThis.__firebaseApp
    if (app) await enableAnalytics(app)
    setOpen(false)
  }

  const reject = () => {
    setConsent('rejected')
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open ? (
        <MotionDiv
          className="fixed inset-0 z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label="Cookie consent"
        >
          <MotionDiv
            className="absolute inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <MotionDiv
            className="absolute inset-0 opacity-[0.16] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'repeat',
              backgroundSize: '220px 220px',
            }}
          />

          <div className="absolute inset-x-0 bottom-0 p-4 sm:bottom-8 sm:p-6">
            <MotionDiv
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[rgba(10,10,15,.72)] backdrop-blur-md"
            >
              <div className="p-6 sm:p-7">
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/60">
                      Consentement
                    </p>
                    <h3 className="text-xl font-semibold text-white">
                      Cookies & analytics
                    </h3>
                    <p className="text-sm leading-relaxed text-white/70">
                      Ce portfolio peut activer une mesure d’audience (Firebase Analytics) pour comprendre les pages consultées. Tu peux accepter ou refuser.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="h-10 w-10 shrink-0 rounded-full border border-white/10 bg-white/5"
                    aria-label="Fermer"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="m-auto text-white/70"
                      aria-hidden="true"
                    >
                      <path d="M18 6 6 18" />
                      <path d="M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={accept}
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:opacity-90"
                  >
                    Accepter
                  </button>
                  <button
                    type="button"
                    onClick={reject}
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            </MotionDiv>
          </div>
        </MotionDiv>
      ) : null}
    </AnimatePresence>
  )
}

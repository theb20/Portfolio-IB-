import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router'
import { animations } from '../config/animations.js'

const MotionDiv = motion.div

export default function RouteTransitionOverlay({
  enabled = animations.routeTransition,
}) {
  const location = useLocation()
  const key = `${location.pathname}${location.search}${location.hash}`

  return (
    <AnimatePresence>
      {enabled ? (
        <MotionDiv
          key={key}
          aria-hidden="true"
          className="fixed inset-0 z-[55] pointer-events-none"
          initial={false}
        >
          <MotionDiv
            className="absolute inset-3 sm:inset-6 overflow-hidden rounded-3xl border border-white/10 bg-[rgba(10,10,15,.78)] backdrop-blur-md"
            initial={{ y: '110%', opacity: 0, scale: 0.98 }}
            animate={{
              y: ['110%', '0%', '-110%'],
              opacity: [0, 1, 0],
              scale: [0.98, 1, 0.98],
            }}
            transition={{
              duration: 0.95,
              ease: [0.16, 1, 0.3, 1],
              times: [0, 0.46, 1],
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.14] mix-blend-overlay"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                backgroundRepeat: 'repeat',
                backgroundSize: '220px 220px',
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(700px_300px_at_20%_30%,rgba(212,175,55,.18),transparent_70%),radial-gradient(600px_260px_at_80%_70%,rgba(255,255,255,.10),transparent_70%)]" />
          </MotionDiv>
        </MotionDiv>
      ) : null}
    </AnimatePresence>
  )
}

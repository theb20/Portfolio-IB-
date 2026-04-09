import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import Button from '../../ui/Button.jsx'
import Container from '../../ui/Container.jsx'
import { animations } from '../../config/animations.js'
import TypeWriter from '../../ui/TypeWriter.jsx'
import { fetchContent } from '../../lib/api.js'

const MotionDiv = motion.div

const DEFAULT_SLIDES = [
  {
    video: '/vds/og4.mp4',
    poster: '/og-image.png',
    title: ['Mon secteur', "d'activité"],
    subtitle: 'Experience bespoke visuals where craft and serene luxury converge.',
    cta: { label: 'Mon profil →', to: '/about' },
    duration: 4000,
  },
]

export default function HeroSection({
  animate = animations.hero,
  slideshow = animations.heroSlideshow,
  slides,
  intervalMs = 6000,
}) {
  const [apiSlides, setApiSlides] = useState(null)

  useEffect(() => {
    let mounted = true
    fetchContent('hero')
      .then((data) => {
        if (!mounted) return
        if (Array.isArray(data?.slides) && data.slides.length) setApiSlides(data.slides)
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  const heroSlides = useMemo(() => {
    if (Array.isArray(slides) && slides.length) return slides
    if (apiSlides) return apiSlides
    return DEFAULT_SLIDES
  }, [slides, apiSlides])

  const [active, setActive] = useState(0)
  const slide = heroSlides[active]

  const timerRef   = useRef(null)
  const videoRef   = useRef(null)
  const titleRef   = useRef(null)
  const textRef    = useRef(null)
  const ctaRef     = useRef(null)
  const bandRef    = useRef(null)
  const activeRef  = useRef(active)
  useEffect(() => { activeRef.current = active }, [active])

  // Nettoyage du timer au démontage
  useEffect(() => () => clearTimeout(timerRef.current), [])

  // Démarre le timer à partir du moment où la vidéo joue vraiment (onPlaying)
  const startTimer = () => {
    if (!slideshow || heroSlides.length < 2) return
    clearTimeout(timerRef.current)
    const duration = heroSlides[activeRef.current]?.duration || intervalMs
    timerRef.current = setTimeout(() => {
      setActive((i) => (i + 1) % heroSlides.length)
    }, duration)
  }

  // Animations texte au changement de slide
  useEffect(() => {
    if (!animate) return
    const reset = (el, init, run) => {
      if (!el) return
      el.classList.remove('anim-init-up', 'anim-init-left', 'anim-init-scale', 'anim-init-fade')
      el.classList.remove('anim-in-up', 'anim-in-left', 'anim-in-scale', 'anim-in-fade')
      el.classList.add(init)
      requestAnimationFrame(() => el.classList.add(run))
    }
    reset(titleRef.current, 'anim-init-left', 'anim-in-left')
    reset(textRef.current,  'anim-init-up',   'anim-in-up')
    reset(ctaRef.current,   'anim-init-up',   'anim-in-up')
    reset(bandRef.current,  'anim-init-scale','anim-in-scale')
  }, [active, animate])

  // Ref callback : appelé dès que le <video> est inséré dans le DOM
  const setVideoRef = (el) => {
    if (!el) return
    videoRef.current = el

    const tryPlay = () => {
      if (el.paused) {
        const p = el.play()
        if (p && typeof p.then === 'function') {
          p.then(() => removeListeners()).catch(() => {})
        }
      }
    }

    const removeListeners = () => {
      window.removeEventListener('touchstart', tryPlay, { passive: true })
      window.removeEventListener('pointerdown', tryPlay)
      window.removeEventListener('click', tryPlay)
    }

    el.load()
    tryPlay()
    window.addEventListener('touchstart', tryPlay, { passive: true })
    window.addEventListener('pointerdown', tryPlay)
    window.addEventListener('click', tryPlay)

    const observer = new MutationObserver(() => {
      if (!document.contains(el)) {
        removeListeners()
        observer.disconnect()
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
  }

  return (
    <section className="relative h-screen" data-animate={animate} data-slideshow={slideshow}>
      <div className="absolute inset-0 bg-[#0e1f1a]">
        <AnimatePresence initial={false}>
          <MotionDiv
            key={`${slide.video}-${active}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <video
              ref={setVideoRef}
              key={slide.video}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              disablePictureInPicture
              controls={false}
              poster={slide.poster}
              src={slide.video}
              className="absolute inset-0 h-full w-full object-cover object-center"
              onPlaying={startTimer}
              onCanPlay={(e) => {
                const p = e.currentTarget.play()
                if (p && typeof p.catch === 'function') p.catch(() => {})
              }}
              onError={() => {
                clearTimeout(timerRef.current)
                timerRef.current = setTimeout(() => {
                  setActive((i) => (i + 1) % heroSlides.length)
                }, 1500)
              }}
            />
          </MotionDiv>
        </AnimatePresence>

        <div className="absolute inset-0 bg-[rgba(10,26,20,0.55)]" />
        <div
          className="absolute inset-0 opacity-[0.18] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
          }}
        />
      </div>

      <Container className="relative z-10 flex h-full items-end px-3 pb-12">
        <div className="max-w-xl text-white">
          <h1
            ref={titleRef}
            className="display-title mb-6 text-[clamp(48px,6vw,72px)] leading-[1.05] tracking-[-0.03em]"
          >
            {slide.title.map((line, i) => (
              <span key={`${active}-${i}`} className="block">
                <TypeWriter text={line} animate={animate} />
              </span>
            ))}
          </h1>
          <p ref={textRef} className="mb-6 text-lg text-white/85">
            {slide.subtitle}
          </p>
          <div ref={ctaRef}>
            <Button
              as="link"
              to={slide.cta.to}
              variant="outline"
              className="cta-glow inline-flex items-center gap-2.5 rounded-full border border-white/60 bg-white/10 px-6 py-3 text-[15px] font-medium text-white backdrop-blur-md hover:bg-white/20"
            >
              {slide.cta.label}
            </Button>
          </div>
        </div>
      </Container>

      <div className="absolute bottom-6 right-8">
        <div className="dots">
          {heroSlides.map((_, i) => (
            <span
              key={i}
              className={['dot', i === active ? 'active' : ''].join(' ')}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
import { motion } from 'framer-motion'
const MotionSpan = motion.span

export default function TypeWriter({
  text,
  className = '',
  animate = true,
  speed = 0.04,
}) {
  const letters = Array.from(text)

  return (
    <span className={className} aria-label={text}>
      <MotionSpan initial={false} animate={false} style={{ display: 'inline-block', perspective: 600 }}>
        {letters.map((ch, i) => (
          <MotionSpan
            key={i}
            initial={animate ? { opacity: 0, y: 6, rotateX: -90 } : false}
            animate={animate ? { opacity: 1, y: 0, rotateX: 0 } : false}
            transition={{ delay: i * speed, duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ display: 'inline-block', transformOrigin: 'bottom' }}
          >
            {ch}
          </MotionSpan>
        ))}
      </MotionSpan>
    </span>
  )
}

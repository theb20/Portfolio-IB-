import { Link } from 'react-router'

const base =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:pointer-events-none disabled:opacity-60'

const variants = {
  primary: 'bg-[var(--accent)] text-[var(--bg)] hover:opacity-90',
  ghost:
    'bg-transparent text-[var(--text-h)] hover:bg-[var(--accent-bg)] hover:text-[var(--text-h)]',
  outline:
    'border border-[var(--border)] bg-transparent text-[var(--text-h)] hover:bg-[var(--accent-bg)]',
}

export default function Button({
  as = 'button',
  variant = 'primary',
  className = '',
  ...props
}) {
  const classes = [base, variants[variant] ?? variants.primary, className].join(
    ' ',
  )

  if (as === 'link') return <Link className={classes} {...props} />

  const Tag = as
  return <Tag className={classes} {...props} />
}

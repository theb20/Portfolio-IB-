export default function Card({ as = 'div', className = '', ...props }) {
  const Tag = as
  return (
    <Tag
      className={[
        'rounded-xl border border-[var(--border)] bg-[color-mix(in oklab,var(--bg)_98%,transparent)]',
        className,
      ].join(' ')}
      {...props}
    />
  )
}

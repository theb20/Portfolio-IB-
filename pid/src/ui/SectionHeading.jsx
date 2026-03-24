export default function SectionHeading({ title, subtitle, align = 'left' }) {
  return (
    <div
      className={[
        'space-y-2',
        align === 'center' ? 'text-center' : 'text-left',
      ].join(' ')}
    >
      <h2 className="text-balance text-2xl font-semibold tracking-tight text-[var(--text-h)] sm:text-3xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-2xl text-pretty text-base text-[var(--text)]">
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}

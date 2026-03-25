export default function Container({ className = '', fluid = false, ...props }) {
  return (
    <div
      className={[
        fluid
          ? 'w-screen sm:px-0 lg:px-0'
          : 'mx-auto w-full max-w-6xl sm:px-6 lg:px-0',
        className,
      ].join(' ')}
      {...props}
    />
  )
}

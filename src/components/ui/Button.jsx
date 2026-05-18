import clsx from 'clsx'

const variants = {
  primary:   'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm',
  secondary: 'bg-[var(--bg-elevated)] hover:bg-[var(--border)] text-[var(--text-primary)] border border-[var(--border)]',
  ghost:     'hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
  danger:    'bg-[var(--negative-soft)] hover:border-[var(--negative)] text-[var(--negative)] border border-[var(--negative)]/30',
  success:   'bg-[var(--positive-soft)] hover:border-[var(--positive)] text-[var(--positive)] border border-[var(--positive)]/30',
}

const sizes = {
  xs: 'h-7 px-2.5 text-xs rounded-md',
  sm: 'h-8 px-3 text-xs rounded-[var(--radius-md)]',
  md: 'h-10 px-4 text-sm rounded-[var(--radius-md)]',
  lg: 'h-11 px-5 text-sm rounded-[var(--radius-md)]',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  loading,
  icon: Icon,
  iconRight: IconRight,
  onClick,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-150 select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon size={size === 'xs' || size === 'sm' ? 13 : 15} />
      ) : null}
      {children}
      {IconRight && <IconRight size={size === 'xs' || size === 'sm' ? 13 : 15} />}
    </button>
  )
}

export function IconButton({ icon: Icon, size = 'md', variant = 'ghost', className, ...props }) {
  const iconSizes = { xs: 13, sm: 14, md: 16, lg: 18 }
  const btnSizes = { xs: 'h-6 w-6', sm: 'h-7 w-7', md: 'h-8 w-8', lg: 'h-9 w-9' }

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-[var(--radius-md)] transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant] || variants.ghost,
        btnSizes[size],
        className
      )}
      {...props}
    >
      <Icon size={iconSizes[size] || 16} />
    </button>
  )
}

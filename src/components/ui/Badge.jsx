import clsx from 'clsx'

const variants = {
  default:  'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)]',
  accent:   'bg-[var(--accent-soft)] text-[var(--accent)]',
  positive: 'bg-[var(--positive-soft)] text-[var(--positive)]',
  negative: 'bg-[var(--negative-soft)] text-[var(--negative)]',
  warning:  'bg-[var(--warning-soft)] text-[var(--warning)]',
  ISA:      'bg-indigo-500/10 text-indigo-400',
  PENSION:  'bg-emerald-500/10 text-emerald-400',
  BROKERAGE:'bg-amber-500/10 text-amber-400',
  CMA:      'bg-cyan-500/10 text-cyan-400',
}

export function Badge({ children, variant = 'default', size = 'sm', className }) {
  const sizeClass = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full leading-none',
        sizeClass,
        variants[variant] || variants.default,
        className
      )}
    >
      {children}
    </span>
  )
}

export function AccountTypeBadge({ type }) {
  const labels = { ISA: 'ISA', PENSION: 'Pension', BROKERAGE: 'Brokerage', CMA: 'CMA' }
  return <Badge variant={type}>{labels[type] || type}</Badge>
}

export function AssetClassBadge({ assetClass }) {
  const map = {
    equity:    { label: 'Equity',    variant: 'accent'   },
    bond:      { label: 'Bond',      variant: 'positive' },
    commodity: { label: 'Commodity', variant: 'warning'  },
    cash:      { label: 'Cash',      variant: 'default'  },
  }
  const { label, variant } = map[assetClass] || { label: assetClass, variant: 'default' }
  return <Badge variant={variant}>{label}</Badge>
}

export function PriorityBadge({ priority }) {
  const map = {
    high:   { label: 'High',   variant: 'negative' },
    medium: { label: 'Medium', variant: 'warning'  },
    low:    { label: 'Low',    variant: 'positive' },
  }
  const { label, variant } = map[priority] || { label: priority, variant: 'default' }
  return <Badge variant={variant}>{label}</Badge>
}

import clsx from 'clsx'

export function Card({ children, className, elevated = false, hover = false, onClick, style }) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={clsx(
        'rounded-[var(--radius-card)] border shadow-[var(--shadow-sm)] transition-all duration-200',
        elevated
          ? 'bg-[var(--bg-elevated)] border-[var(--border)]'
          : 'bg-[var(--bg-card)] border-[var(--border)]',
        hover && 'cursor-pointer hover:border-[var(--accent)] hover:bg-[var(--bg-elevated)] hover:shadow-[var(--shadow-md)]',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={clsx('px-5 py-4 border-b border-[var(--border-subtle)]', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={clsx('text-sm font-semibold text-[var(--text-primary)] tracking-wide', className)}>
      {children}
    </h3>
  )
}

export function CardBody({ children, className }) {
  return <div className={clsx('p-5', className)}>{children}</div>
}

export function CardFooter({ children, className }) {
  return (
    <div className={clsx('px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] rounded-b-[var(--radius-card)]', className)}>
      {children}
    </div>
  )
}

export function StatCard({ label, value, sub, trend, icon: Icon, accent = false }) {
  const trendPositive = trend > 0
  const trendNegative = trend < 0

  return (
    <Card className={clsx('p-5', accent && 'border-[var(--accent)] bg-[var(--accent-soft)]')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium mb-1">
            {label}
          </p>
          <p className="text-2xl font-semibold tabular-nums text-[var(--text-primary)] leading-tight truncate">
            {value}
          </p>
          {sub && (
            <p className="text-xs text-[var(--text-secondary)] mt-1 truncate">{sub}</p>
          )}
          {trend !== undefined && (
            <p
              className={clsx(
                'text-xs font-medium mt-1',
                trendPositive && 'positive',
                trendNegative && 'negative',
                !trendPositive && !trendNegative && 'text-[var(--text-muted)]'
              )}
            >
              {trendPositive ? '▲' : trendNegative ? '▼' : '–'}{' '}
              {Math.abs(trend).toFixed(1)}%
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-2.5 rounded-lg bg-[var(--accent-soft)] shrink-0">
            <Icon size={18} style={{ color: 'var(--accent)' }} />
          </div>
        )}
      </div>
    </Card>
  )
}

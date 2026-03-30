import clsx from 'clsx'

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center mb-4">
          <Icon size={22} className="text-[var(--text-muted)]" />
        </div>
      )}
      <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">{title}</p>
      {description && (
        <p className="text-xs text-[var(--text-muted)] max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

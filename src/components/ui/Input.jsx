import clsx from 'clsx'

export function Input({
  label,
  error,
  hint,
  prefix,
  suffix,
  className,
  inputClassName,
  ...props
}) {
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className={clsx(
        'flex items-center gap-2 h-9 px-3 rounded-[var(--radius-md)]',
        'bg-[var(--bg-elevated)] border border-[var(--border)]',
        'focus-within:border-[var(--accent)] transition-colors duration-150',
        error && 'border-[var(--negative)]'
      )}>
        {prefix && (
          <span className="text-xs text-[var(--text-muted)] shrink-0">{prefix}</span>
        )}
        <input
          className={clsx(
            'flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none min-w-0',
            'placeholder:text-[var(--text-muted)]',
            inputClassName
          )}
          {...props}
        />
        {suffix && (
          <span className="text-xs text-[var(--text-muted)] shrink-0">{suffix}</span>
        )}
      </div>
      {error && <p className="text-xs text-[var(--negative)]">{error}</p>}
      {hint && !error && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
    </div>
  )
}

export function Select({ label, error, className, children, ...props }) {
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        className={clsx(
          'h-9 px-3 rounded-[var(--radius-md)] text-sm outline-none cursor-pointer',
          'bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)]',
          'focus:border-[var(--accent)] transition-colors duration-150',
          error && 'border-[var(--negative)]'
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-[var(--negative)]">{error}</p>}
    </div>
  )
}

export function SliderInput({ label, value, onChange, min = 0, max = 100, step = 1, suffix = '%' }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
            {label}
          </label>
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {value}{suffix}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${((value - min) / (max - min)) * 100}%, var(--border) ${((value - min) / (max - min)) * 100}%, var(--border) 100%)`,
        }}
      />
    </div>
  )
}

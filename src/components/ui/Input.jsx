import clsx from 'clsx'

export function Input({
  id,
  label,
  error,
  hint,
  prefix,
  suffix,
  className,
  inputClassName,
  ...props
}) {
  const inputId = id || (label ? `input-${String(label).replace(/\s+/g, '-').toLowerCase()}` : undefined)
  const helperId = inputId ? `${inputId}-helper` : undefined

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <div className={clsx(
        'flex h-10 items-center gap-2 rounded-[var(--radius-md)] px-3',
        'bg-[var(--bg-elevated)] border border-[var(--border)]',
        'focus-within:border-[var(--accent)] transition-colors duration-150',
        error && 'border-[var(--negative)]'
      )}>
        {prefix && (
          <span className="text-xs text-[var(--text-muted)] shrink-0">{prefix}</span>
        )}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? helperId : undefined}
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
      {error && <p id={helperId} className="text-xs text-[var(--negative)]">{error}</p>}
      {hint && !error && <p id={helperId} className="text-xs text-[var(--text-muted)]">{hint}</p>}
    </div>
  )
}

export function Select({ id, label, error, className, children, ...props }) {
  const selectId = id || (label ? `select-${String(label).replace(/\s+/g, '-').toLowerCase()}` : undefined)
  const helperId = selectId ? `${selectId}-helper` : undefined

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? helperId : undefined}
        className={clsx(
          'h-10 cursor-pointer rounded-[var(--radius-md)] px-3 text-sm outline-none',
          'bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)]',
          'focus:border-[var(--accent)] transition-colors duration-150',
          error && 'border-[var(--negative)]'
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p id={helperId} className="text-xs text-[var(--negative)]">{error}</p>}
    </div>
  )
}

export function SliderInput({ label, value, onChange, min = 0, max = 100, step = 1, suffix = '%' }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[var(--text-secondary)]">
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

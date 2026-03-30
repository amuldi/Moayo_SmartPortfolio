import clsx from 'clsx'

export function ProgressBar({ value, max = 100, color, height = 'h-1.5', className, animated = false }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={clsx('w-full bg-[var(--border)] rounded-full overflow-hidden', height, className)}>
      <div
        className={clsx('h-full rounded-full transition-all duration-500', animated && 'animate-pulse-soft')}
        style={{
          width: `${pct}%`,
          background: color || 'var(--accent)',
        }}
      />
    </div>
  )
}

export function ScoreRing({ score, size = 80, strokeWidth = 6, label }) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  const color =
    score >= 80 ? 'var(--positive)' :
    score >= 60 ? 'var(--warning)'  :
                  'var(--negative)'

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="var(--border)" strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        {/* Score text */}
        <text
          x={size / 2} y={size / 2 + 1}
          textAnchor="middle" dominantBaseline="middle"
          fill={color}
          fontSize={size / 4}
          fontWeight="600"
          fontFamily="var(--font-family)"
        >
          {score}
        </text>
      </svg>
      {label && <p className="text-xs text-[var(--text-muted)]">{label}</p>}
    </div>
  )
}

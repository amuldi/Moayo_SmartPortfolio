import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart,
  BarChart, Bar, Cell,
} from 'recharts'
import { CHART_COLORS, formatPct } from '../../utils/formatters.js'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null

  return (
    <div className="px-3 py-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xl min-w-[140px]">
      <p className="text-xs text-[var(--text-muted)] mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
            <span className="text-xs text-[var(--text-secondary)]">{p.name}</span>
          </div>
          <span className="text-xs font-semibold" style={{ color: p.color }}>
            {formatPct(p.value - 100, 1, false)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function PerformanceChart({ series, height = 280, showGrid = true, type = 'area' }) {
  if (!series || series.length === 0) return null

  const data = series[0].data
  const ChartComponent = type === 'area' ? AreaChart : LineChart

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="var(--border)"
            vertical={false}
          />
        )}
        <XAxis
          dataKey="month"
          tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval={11}
        />
        <YAxis
          tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v - 100).toFixed(0)}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={100} stroke="var(--border)" strokeDasharray="4 4" />

        {series.map((s, i) => {
          const color = s.color || CHART_COLORS[i]
          if (type === 'area') {
            return (
              <Area
                key={s.id || i}
                type="monotone"
                dataKey="value"
                name={s.name}
                data={s.data}
                stroke={color}
                strokeWidth={1.5}
                fill={`${color}18`}
                dot={false}
                activeDot={{ r: 3, fill: color }}
              />
            )
          }
          return (
            <Line
              key={s.id || i}
              type="monotone"
              dataKey="value"
              name={s.name}
              data={s.data}
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: color }}
            />
          )
        })}
      </ChartComponent>
    </ResponsiveContainer>
  )
}

// Multi-line comparison chart (for benchmarks)
export function MultiLineChart({ series, height = 300 }) {
  if (!series || series.length === 0) return null

  const len = Math.max(...series.map((s) => s.data.length))
  const merged = Array.from({ length: len }, (_, i) => {
    const row = { month: series[0].data[i]?.month || '' }
    series.forEach((s) => {
      row[s.id] = s.data[i]?.value
    })
    return row
  })

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={merged} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval={11}
        />
        <YAxis
          tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v - 100).toFixed(0)}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={100} stroke="var(--border)" strokeDasharray="4 4" />

        {series.map((s, i) => (
          <Line
            key={s.id}
            type="monotone"
            dataKey={s.id}
            name={s.name}
            stroke={s.color || CHART_COLORS[i]}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

// Monthly return bar chart
export function MonthlyReturnChart({ data, height = 160 }) {
  if (!data || data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
          axisLine={false}
          tickLine={false}
          interval={11}
        />
        <YAxis
          tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v.toFixed(0)}%`}
        />
        <Tooltip
          formatter={(v) => [`${v.toFixed(2)}%`, 'Return']}
          contentStyle={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="return" radius={[2, 2, 0, 0]}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.return >= 0 ? 'var(--positive)' : 'var(--negative)'}
              opacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

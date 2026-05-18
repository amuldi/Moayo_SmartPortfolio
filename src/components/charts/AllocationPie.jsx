import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { CHART_COLORS } from '../../utils/formatters.js'

// 자산군별 고정 색상 (의미 있는 색상 체계)
const ASSET_CLASS_COLORS = {
  'ETF':     '#3B82F6',  // blue
  '주식':    '#5BA3CF',  // sky blue
  '채권':    '#10B981',  // emerald
  '원자재':  '#F59E0B',  // amber
  '현금':    '#94A3B8',  // slate
  '금':      '#EAB308',  // gold
  '금·귀금속': '#EAB308', // gold
  '리츠':    '#8B5CF6',  // purple
  '펀드':    '#EC4899',  // pink
  '기타':    '#64748B',  // neutral
}

// 이름에서 자산군 색상 추출 (차트 데이터 name 기반)
function getColorForName(name, index) {
  return ASSET_CLASS_COLORS[name] || CHART_COLORS[index % CHART_COLORS.length]
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xl">
      <p className="text-xs font-medium text-[var(--text-primary)]">{item.name}</p>
      <p className="text-xs font-semibold mt-0.5" style={{ color: item.payload?.color || 'var(--accent)' }}>
        {item.value.toFixed(1)}%
      </p>
    </div>
  )
}

export function AllocationPie({
  data,
  height = 200,
  showLegend = true,
  innerRadius = 55,
  outerRadius = 80,
  centerLabel,
  centerValue,
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] text-xs text-[var(--text-muted)]" style={{ height }}>
        표시할 비중 데이터가 없습니다
      </div>
    )
  }

  const coloredData = data.map((d, i) => ({ ...d, color: getColorForName(d.name, i) }))

  return (
    <div>
      {/* 차트 영역 (센터 레이블은 이 안에서만) */}
      <div className="relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={coloredData}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={coloredData.length > 1 ? 2 : 0}
              dataKey="value"
              strokeWidth={0}
            >
              {coloredData.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* 센터 레이블 — 차트 영역 안에만 위치 */}
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {centerValue && (
              <p className="text-sm font-bold text-[var(--text-primary)] leading-tight">
                {centerValue}
              </p>
            )}
            {centerLabel && (
              <p className="text-[11px] text-[var(--text-muted)] leading-tight mt-0.5">{centerLabel}</p>
            )}
          </div>
        )}
      </div>

      {/* 범례 — 차트 아래 */}
      {showLegend && (
        <div className="flex flex-col gap-1.5 mt-3">
          {coloredData.map((d, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
                <span className="text-xs text-[var(--text-secondary)] truncate">{d.name}</span>
              </div>
              <span className="text-xs font-semibold text-[var(--text-primary)] shrink-0">
                {d.value.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Stacked bar allocation chart
export function AllocationBar({ data, height = 12 }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return null

  return (
    <div className="flex rounded-full overflow-hidden gap-px" style={{ height }}>
      {data.map((d, i) => (
        <div
          key={i}
          style={{
            width: `${(d.value / total) * 100}%`,
            background: CHART_COLORS[i % CHART_COLORS.length],
          }}
          title={`${d.name}: ${d.value.toFixed(1)}%`}
        />
      ))}
    </div>
  )
}

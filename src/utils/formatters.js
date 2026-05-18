// ─── 통화 포맷 ────────────────────────────────────────────
export const formatKRW = (amount, compact = false) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '—'
  if (compact) {
    const abs = Math.abs(amount)
    const sign = amount < 0 ? '-' : ''
    if (abs >= 100_000_000) return `${sign}${(abs / 100_000_000).toFixed(1)}억`
    if (abs >= 10_000)      return `${sign}${(abs / 10_000).toFixed(0)}만`
    return `${sign}${abs.toLocaleString('ko-KR')}원`
  }
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency', currency: 'KRW', maximumFractionDigits: 0,
  }).format(amount)
}

export const formatNumber = (n, dec = 0) =>
  n?.toLocaleString('ko-KR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) ?? '—'

export const formatCurrency = (amount, currency = 'KRW', compact = false) => {
  if (amount === undefined || amount === null || Number.isNaN(amount)) return '—'
  if (currency === 'KRW') return formatKRW(amount, compact)

  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'USD' ? 2 : 0,
  }).format(amount)
}

export const formatSignedCurrency = (amount, currency = 'KRW') => {
  if (amount === undefined || amount === null || Number.isNaN(amount)) return '—'
  const sign = amount > 0 ? '+' : ''
  return `${sign}${formatCurrency(amount, currency)}`
}

// ─── 수익률 포맷 ──────────────────────────────────────────
export const formatPct = (value, decimals = 2, showSign = true) => {
  if (value === undefined || value === null || isNaN(value)) return '—'
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

export const formatSignedNumber = (value, decimals = 0) => {
  if (value === undefined || value === null || Number.isNaN(value)) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${formatNumber(value, decimals)}`
}

// ─── 색상 헬퍼 ────────────────────────────────────────────
export const getReturnColor = (v) =>
  v > 0 ? 'var(--positive)' : v < 0 ? 'var(--negative)' : 'var(--text-secondary)'

export const getReturnClass = (v) =>
  v > 0 ? 'positive' : v < 0 ? 'negative' : 'text-[var(--text-secondary)]'

export const getSeverityColor = (s) =>
  ({ high: 'var(--negative)', medium: 'var(--warning)', low: 'var(--positive)' }[s] || 'var(--text-secondary)')

export const getSeverityBg = (s) =>
  ({ high: 'var(--negative-soft)', medium: 'var(--warning-soft)', low: 'var(--positive-soft)' }[s] || 'var(--bg-elevated)')

// ─── 점수 ─────────────────────────────────────────────────
export const getScoreLabel = (score) => {
  if (score >= 90) return { label: '우수',   color: 'var(--positive)' }
  if (score >= 75) return { label: '양호',   color: 'var(--positive)' }
  if (score >= 60) return { label: '보통',   color: 'var(--warning)'  }
  if (score >= 40) return { label: '개선필요', color: 'var(--negative)' }
  return              { label: '위험',   color: 'var(--negative)' }
}

// ─── 차트 색상 ────────────────────────────────────────────
export const CHART_COLORS = [
  '#5BA3CF', '#10B981', '#7C3AED', '#F59E0B', '#2D7DD2',
  '#06B6D4', '#059669', '#8B5CF6', '#EF4444', '#0EA5E9',
  '#7BBFE0', '#34D399', '#A78BFA', '#FCD34D', '#38BDF8',
]
export const getChartColor = (i) => CHART_COLORS[i % CHART_COLORS.length]

// ─── 자산군 한국어 ────────────────────────────────────────
export const ASSET_CLASS_KO = {
  equity: '주식', bond: '채권', commodity: '원자재', cash: '현금',
}

export const REGION_KO = {
  '국내': '국내', '미국': '미국', '글로벌': '글로벌', '신흥국': '신흥국',
  Korea: '국내', US: '미국', Global: '글로벌', EM: '신흥국',
}

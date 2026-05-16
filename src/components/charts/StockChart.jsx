import { useState, useEffect, useCallback, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { getAssetInfo, getHistoricalPrices } from '../../services/mockData.js'
import { fetchChart, fetchQuote } from '../../services/stockAPI.js'
import { formatPct } from '../../utils/formatters.js'
import clsx from 'clsx'

const PERIODS = [
  { label: '1일',  range: '1d' },
  { label: '1주',  range: '1w' },
  { label: '1개월', range: '1m' },
  { label: '3개월', range: '3m' },
  { label: '1년',  range: '1y' },
  { label: '5년',  range: '5y' },
]

// 목데이터 fallback (서버 없을 때)
function getMockCandles(ticker, range) {
  const months = { '1d': 0, '1w': 0, '1m': 1, '3m': 3, '1y': 12, '5y': 60 }[range] || 12
  const raw = getHistoricalPrices(ticker, Math.max(months, 2))
  const slice = months === 0 ? raw.slice(-2) : raw.slice(-Math.max(months, 1) - 1)
  return slice.map((p) => ({ time: 0, label: p.month, close: p.price }))
}

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  return (
    <div className="px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xl">
      <p className="text-[11px] text-[var(--text-muted)] mb-1">{label}</p>
      <p className="text-sm font-semibold text-[var(--text-primary)]">
        {currency === 'USD' ? `$${val?.toFixed(2)}` : `₩${val?.toLocaleString('ko-KR')}`}
      </p>
    </div>
  )
}

export function StockChart({ ticker, height = 280, initialQuote = null }) {
  const [periodIdx,    setPeriodIdx]    = useState(4)
  const [candles,      setCandles]      = useState([])
  const [quote,        setQuote]        = useState(initialQuote)
  const [loading,      setLoading]      = useState(false)
  const [isLive,       setIsLive]       = useState(false)   // 실데이터 여부
  const [lastUpdated,  setLastUpdated]  = useState(null)
  const [wsLive,       setWsLive]       = useState(false)   // WS 실시간 수신 중
  const wsRef = useRef(null)

  const asset    = getAssetInfo(ticker)
  const currency = asset.currency || 'USD'
  const range    = PERIODS[periodIdx].range

  // 차트 데이터 로드
  const loadChart = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchChart(ticker, range)
      if (data.candles?.length > 0) {
        setCandles(data.candles)
        setIsLive(true)
      } else {
        setCandles(getMockCandles(ticker, range))
        setIsLive(false)
      }
    } catch {
      // 서버 없음 → mock fallback
      setCandles(getMockCandles(ticker, range))
      setIsLive(false)
    } finally {
      setLoading(false)
    }
  }, [ticker, range])

  // 현재가 조회
  const loadQuote = useCallback(async () => {
    try {
      const q = await fetchQuote(ticker)
      setQuote(q)
      setLastUpdated(new Date())
      setIsLive(true)
    } catch {
      // 서버 없음 → mock 가격 유지
    }
  }, [ticker])

  // 기간 변경 또는 종목 변경 시 차트 재로드
  useEffect(() => { loadChart() }, [loadChart])

  // 마운트 시 현재가 조회
  useEffect(() => {
    if (!initialQuote) loadQuote()
    // 60초마다 현재가 갱신
    const id = setInterval(loadQuote, 60_000)
    return () => clearInterval(id)
  }, [loadQuote, initialQuote])

  // WebSocket 실시간 시세 (로컬/전용 서버에서만 사용)
  useEffect(() => {
    const realtimeEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_REALTIME_WS === 'true'
    if (range !== '1d' || !realtimeEnabled) {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
        setWsLive(false)
      }
      return
    }

    let mounted = true
    let ws
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      ws = new WebSocket(`${protocol}//${window.location.host}/ws`)
      wsRef.current = ws

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'subscribe', ticker }))
      }

      ws.onmessage = (e) => {
        if (!mounted) return
        let msg
        try { msg = JSON.parse(e.data) } catch { return }
        if (msg.type !== 'trade' || msg.ticker !== ticker) return
        setWsLive(true)
        setQuote((prev) => prev ? { ...prev, price: msg.price } : { price: msg.price })
        setLastUpdated(new Date())
        setCandles((prev) => {
          if (!prev.length) return prev
          const copy = [...prev]
          copy[copy.length - 1] = { ...copy[copy.length - 1], close: msg.price }
          return copy
        })
      }

      ws.onclose = () => { if (mounted) setWsLive(false) }
      ws.onerror = () => { if (mounted) setWsLive(false) }
    } catch {
      // WebSocket 미지원 환경 — 무시
    }

    return () => {
      mounted = false
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'unsubscribe', ticker }))
        ws.close()
      }
      wsRef.current = null
      setWsLive(false)
    }
  }, [ticker, range])

  // 가격 계산
  const startPrice  = candles[0]?.close || asset.price || 0
  const currentPrice = quote?.price ?? candles[candles.length - 1]?.close ?? asset.price ?? 0
  const change      = currentPrice - startPrice
  const changePct   = startPrice > 0 ? (change / startPrice) * 100 : 0
  const isPos       = changePct >= 0
  const lineColor   = isPos ? 'var(--positive)' : 'var(--negative)'

  const formatPrice = (v) =>
    currency === 'USD' ? `$${(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `₩${(v || 0).toLocaleString('ko-KR')}`

  const yTickFmt = (v) =>
    currency === 'USD' ? `$${v.toFixed(0)}` : `${(v / 1000).toFixed(0)}k`

  return (
    <div className="flex flex-col h-full">
      {/* 헤더: 가격 정보 */}
      <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-[var(--text-muted)] font-mono">{ticker}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)]">
              {asset.sector || '—'}
            </span>
            {/* 실시간 배지 */}
            {wsLive ? (
              <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-red-500/10 text-red-500">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                </span>
                LIVE
              </span>
            ) : (
              <span className={clsx(
                'flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                isLive
                  ? 'bg-[var(--positive-soft)] text-[var(--positive)]'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
              )}>
                {isLive ? <Wifi size={9} /> : <WifiOff size={9} />}
                {isLive ? '실시간' : '추정'}
              </span>
            )}
          </div>

          <p className="text-2xl font-bold text-[var(--text-primary)] leading-tight">
            {formatPrice(currentPrice)}
          </p>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-semibold" style={{ color: lineColor }}>
              {isPos ? '▲' : '▼'} {formatPct(Math.abs(changePct), 2, false)}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {isPos ? '+' : ''}{formatPrice(change)}
            </span>
            {lastUpdated && (
              <span className="text-[10px] text-[var(--text-muted)]">
                · {lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {/* 오른쪽: 기간 선택 + 새로고침 */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1 bg-[var(--bg-elevated)] rounded-[var(--radius-md)] p-0.5">
            {PERIODS.map((p, i) => (
              <button
                key={p.range}
                onClick={() => setPeriodIdx(i)}
                className={clsx(
                  'px-2.5 py-1 text-xs rounded-md font-medium transition-all duration-150',
                  periodIdx === i
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => { loadChart(); loadQuote() }}
            className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
            새로고침
          </button>
        </div>
      </div>

      {/* 차트 */}
      <div className="flex-1 px-2 relative">
        {loading && candles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={candles} margin={{ top: 4, right: 4, bottom: 4, left: -16 }}>
            <defs>
              <linearGradient id={`grad-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={lineColor} stopOpacity={0.18} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              axisLine={false} tickLine={false}
              interval={Math.max(0, Math.floor(candles.length / 6) - 1)}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              axisLine={false} tickLine={false}
              tickFormatter={yTickFmt}
              width={42}
            />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <ReferenceLine y={startPrice} stroke="var(--border)" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="close"
              stroke={lineColor}
              strokeWidth={1.5}
              fill={`url(#grad-${ticker})`}
              dot={false}
              activeDot={{ r: 3.5, fill: lineColor, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 종목 정보 바 */}
      <div className="px-5 py-3 border-t border-[var(--border)] grid grid-cols-4 gap-3">
        {[
          { label: '시가',      value: quote?.open    != null ? formatPrice(quote.open)    : '—' },
          { label: '고가',      value: quote?.high    != null ? formatPrice(quote.high)    : '—' },
          { label: '저가',      value: quote?.low     != null ? formatPrice(quote.low)     : '—' },
          { label: '전일종가',  value: quote?.prevClose != null ? formatPrice(quote.prevClose) : '—' },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-[10px] text-[var(--text-muted)] mb-0.5">{item.label}</p>
            <p className="text-xs font-semibold text-[var(--text-primary)]">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 주가 데이터 제공자 ────────────────────────────────────
// 1차: yahoo-finance2 (무료, API 키 불필요) — REST 시세·차트
// 2차: Finnhub (API 키 필요) — WebSocket 실시간 체결가 전용

import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

const FALLBACK_FX_RATES = {
  KRW: 1,
  USD: 1450,
  EUR: 1580,
  DKK: 212,
}

let fxCache = null

// ── 심볼 변환 ──────────────────────────────────────────────

// Finnhub WebSocket 구독용 (한국: 6자리 → .KS)
export function toSymbol(ticker) {
  if (/^\d{6}$/.test(ticker)) return `${ticker}.KS`
  return ticker.toUpperCase()
}

// Yahoo Finance용 심볼 (한국: .KS / .KQ, BRK.B → BRK-B)
function toYahoo(ticker) {
  if (/^\d{6}$/.test(ticker)) return `${ticker}.KS`
  // Yahoo Finance는 점(.) 대신 하이픈(-) 사용 (예: BRK.B → BRK-B)
  return ticker.replace(/\.([A-Z])$/, '-$1').toUpperCase()
}

// ── 현재가 조회 ────────────────────────────────────────────
export async function getQuote(ticker) {
  const sym = toYahoo(ticker)

  let d = await _tryQuote(sym)
  if (d) return _buildQuote(ticker, sym, d)

  // KOSPI 실패 → KOSDAQ 재시도
  if (/^\d{6}$/.test(ticker) && sym.endsWith('.KS')) {
    const kq = `${ticker}.KQ`
    d = await _tryQuote(kq)
    if (d) return _buildQuote(ticker, kq, d)
  }

  throw new Error(`${sym}: 시세 없음 (장 마감 또는 미지원 종목)`)
}

async function _tryQuote(symbol) {
  try {
    const d = await yahooFinance.quote(symbol, {}, { validateResult: false })
    if (d?.regularMarketPrice) return d
  } catch {}
  return null
}

function _buildQuote(ticker, symbol, d) {
  const isKRW = /^\d{6}/.test(ticker)
  const round  = (v, n) => (v != null ? parseFloat(v.toFixed(n)) : null)
  return {
    ticker,
    symbol,
    price:     round(d.regularMarketPrice,           isKRW ? 0 : 2),
    change:    round(d.regularMarketChange,           isKRW ? 0 : 2),
    changePct: round(d.regularMarketChangePercent,    2),
    high:      d.regularMarketDayHigh    ?? null,
    low:       d.regularMarketDayLow     ?? null,
    open:      d.regularMarketOpen       ?? null,
    prevClose: d.regularMarketPreviousClose ?? null,
    volume:    d.regularMarketVolume     ?? null,
    currency:  isKRW ? 'KRW' : (d.currency || 'USD'),
    market:    symbol.endsWith('.KS') ? 'KOSPI'
             : symbol.endsWith('.KQ') ? 'KOSDAQ' : 'US',
    updatedAt: new Date().toISOString(),
    source: 'yahoo',
    stale: false,
    isEstimated: false,
    errors: [],
  }
}

export async function getFxRates() {
  if (fxCache && Date.now() - fxCache.cachedAt < 24 * 60 * 60 * 1000) {
    return fxCache.value
  }

  const symbols = {
    USD: 'USDKRW=X',
    EUR: 'EURKRW=X',
    DKK: 'DKKKRW=X',
  }
  const rates = { ...FALLBACK_FX_RATES }
  const errors = []

  await Promise.all(Object.entries(symbols).map(async ([currency, symbol]) => {
    try {
      const data = await _tryQuote(symbol)
      if (data?.regularMarketPrice) rates[currency] = Number(data.regularMarketPrice)
      else errors.push(`${currency}: 데이터 없음`)
    } catch (error) {
      errors.push(`${currency}: ${error.message}`)
    }
  }))

  const value = {
    rates,
    source: errors.length ? 'fallback-mixed' : 'yahoo',
    updatedAt: new Date().toISOString(),
    stale: Boolean(errors.length),
    isEstimated: Boolean(errors.length),
    errors,
  }
  fxCache = { cachedAt: Date.now(), value }
  return value
}

// ── 월봉 히스토리 (백테스트용) ──────────────────────────────
export async function getHistory(ticker, months = 24) {
  const symbol  = toYahoo(ticker)
  const period1 = new Date()
  period1.setMonth(period1.getMonth() - months)

  const rows = await _tryHistorical(symbol, period1, '1mo')
  if (rows?.length) return rows

  // KOSPI → KOSDAQ fallback
  if (/^\d{6}$/.test(ticker) && symbol.endsWith('.KS')) {
    const rows2 = await _tryHistorical(`${ticker}.KQ`, period1, '1mo')
    if (rows2?.length) return rows2
  }
  return []
}

async function _tryHistorical(symbol, period1, interval) {
  try {
    const data = await yahooFinance.historical(symbol, {
      period1,
      period2: new Date(),
      interval,
    }, { validateResult: false })

    if (!data?.length) return null
    return data
      .filter((r) => r.close != null)
      .map((r) => ({
        date:  r.date.toISOString().slice(0, 7),
        close: parseFloat((r.close).toFixed(2)),
      }))
  } catch {
    return null
  }
}

// ── 차트 캔들 (StockChart용) ──────────────────────────────
// range: '1d'|'1w'|'1m'|'3m'|'1y'|'5y'
const CHART_CFG = {
  '1d': { interval: '5m',  days: 1    },
  '1w': { interval: '60m', days: 7    },
  '1m': { interval: '1d',  days: 30   },
  '3m': { interval: '1d',  days: 90   },
  '1y': { interval: '1wk', days: 365  },
  '5y': { interval: '1mo', days: 1825 },
}

export async function getChart(ticker, range = '1y') {
  const sym = toYahoo(ticker)
  const { interval, days } = CHART_CFG[range] || CHART_CFG['1y']
  const period1 = new Date(Date.now() - days * 86_400_000)

  const candles = await _tryChart(sym, period1, interval, range)
  if (candles?.length) return { candles, range }

  // KOSPI → KOSDAQ fallback
  if (/^\d{6}$/.test(ticker) && sym.endsWith('.KS')) {
    const kq      = `${ticker}.KQ`
    const candles2 = await _tryChart(kq, period1, interval, range)
    if (candles2?.length) return { candles: candles2, range }
  }

  return { candles: [], range, error: '데이터 없음' }
}

async function _tryChart(symbol, period1, interval, range) {
  try {
    // yahoo-finance2 chart() — 인트라데이 포함 전 구간 지원
    const result = await yahooFinance.chart(symbol, {
      period1,
      period2: new Date(),
      interval,
    }, { validateResult: false })

    const rows = result?.quotes
    if (!rows?.length) return null

    const isIntraday = ['1d', '1w'].includes(range)
    return rows
      .filter((r) => r.close != null)
      .map((r) => {
        const d = r.date instanceof Date ? r.date : new Date(r.date)
        return {
          time:   d.getTime(),
          label:  isIntraday
            ? d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
            : d.toLocaleDateString('ko-KR', {
                month: 'short', day: 'numeric',
                ...(range === '5y' ? { year: '2-digit' } : {}),
              }),
          open:   r.open,
          high:   r.high,
          low:    r.low,
          close:  r.close,
          volume: r.volume,
        }
      })
  } catch {
    return null
  }
}

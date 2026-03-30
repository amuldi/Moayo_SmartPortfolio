// ─── 실시간 주식 시세 API ─────────────────────────────────
// 백엔드 서버(/api)를 통해 Finnhub(미국) / KIS(한국) 데이터 조회

const BASE = '/api'

// 단일 종목 현재가
export async function fetchQuote(ticker) {
  const res = await fetch(`${BASE}/quote/${encodeURIComponent(ticker)}`)
  if (!res.ok) throw new Error(`시세 조회 실패: ${ticker}`)
  return res.json()
}

// 복수 종목 현재가 (배치) — 포트폴리오 전체 갱신에 사용
export async function fetchQuotes(tickers) {
  if (!tickers || tickers.length === 0) return {}
  const res = await fetch(`${BASE}/quotes`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ tickers }),
  })
  if (!res.ok) throw new Error('시세 배치 조회 실패')
  const { quotes, updatedAt } = await res.json()
  return { quotes, updatedAt }
}

// 월봉 히스토리
export async function fetchHistory(ticker, months = 24) {
  const res = await fetch(`${BASE}/history/${encodeURIComponent(ticker)}?months=${months}`)
  if (!res.ok) throw new Error(`히스토리 조회 실패: ${ticker}`)
  return res.json()
}

// 포트폴리오 전체 시세 갱신 — 컴포넌트에서 직접 호출
export async function refreshPortfolioPrices(holdings) {
  const tickers = [...new Set(holdings.map((h) => h.ticker))]
  return fetchQuotes(tickers)
}

// 차트 캔들 데이터 — range: '1d'|'1w'|'1m'|'3m'|'1y'|'5y'
export async function fetchChart(ticker, range = '1y') {
  const res = await fetch(`${BASE}/chart/${encodeURIComponent(ticker)}?range=${range}`)
  if (!res.ok) throw new Error(`차트 데이터 조회 실패: ${ticker}`)
  return res.json()
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TICKER_RE = /^[A-Z0-9.-]{1,20}$/i
const ACCOUNT_TYPES = new Set(['ISA', 'PENSION', 'BROKERAGE', 'CMA', 'GOLD'])
const MARKETS = new Set(['국내', '미국', '글로벌', '중국', '일본', '유럽', '대만', '기타'])
const CURRENCIES = new Set(['KRW', 'USD', 'EUR', 'DKK'])
const CHART_RANGES = new Set(['1d', '1w', '1m', '3m', '1y', '5y'])

function cleanString(value, max = 160) {
  return String(value || '').trim().slice(0, max)
}

function readNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function validateRegisterBody(body = {}) {
  const username = cleanString(body.username, 40)
  const email = cleanString(body.email, 120).toLowerCase()
  const password = String(body.password || '')

  if (!username) return { error: '사용자 이름을 입력해주세요' }
  if (!EMAIL_RE.test(email)) return { error: '올바른 이메일을 입력해주세요' }
  if (password.length < 8) return { error: '비밀번호는 8자 이상이어야 합니다' }

  return { values: { username, email, password } }
}

export function validateLoginBody(body = {}) {
  const email = cleanString(body.email, 120).toLowerCase()
  const password = String(body.password || '')

  if (!EMAIL_RE.test(email) || !password) {
    return { error: '이메일과 비밀번호를 입력해주세요' }
  }

  return { values: { email, password } }
}

export function validateEmailBody(body = {}) {
  const email = cleanString(body.email, 120).toLowerCase()
  if (!EMAIL_RE.test(email)) return { error: '올바른 이메일을 입력해주세요' }
  return { values: { email } }
}

export function validateOAuthCodeBody(body = {}) {
  const code = cleanString(body.code, 1000)
  const state = cleanString(body.state, 256)
  const redirectUri = cleanString(body.redirectUri, 500)

  if (!code || !state || !redirectUri) {
    return { error: 'OAuth 인증 정보가 필요합니다' }
  }

  return { values: { code, state, redirectUri } }
}

export function sanitizeTicker(value) {
  const ticker = cleanString(value, 20).toUpperCase()
  if (!TICKER_RE.test(ticker)) return null
  return ticker
}

function sanitizeHolding(holding = {}) {
  const ticker = sanitizeTicker(holding.ticker)
  if (!ticker) return null

  const quantity = readNumber(holding.quantity)
  const avgPrice = readNumber(holding.avgPrice)
  const currentPrice = readNumber(holding.currentPrice)
  const purchaseAmount = readNumber(holding.purchaseAmount)
  const marketValue = readNumber(holding.marketValue)
  const pnl = readNumber(holding.pnl)
  const returnPct = readNumber(holding.returnPct)
  const targetWeight = readNumber(holding.targetWeight)
  if (quantity < 0 || avgPrice < 0 || targetWeight < 0 || targetWeight > 100) return null

  const currency = CURRENCIES.has(holding.currency) ? holding.currency : 'KRW'
  const market = MARKETS.has(holding.market) ? holding.market : '기타'

  return {
    id: cleanString(holding.id, 80) || undefined,
    ticker,
    name: cleanString(holding.name || ticker, 80),
    sector: cleanString(holding.sector || '기타', 40),
    region: cleanString(holding.region || market, 40),
    market,
    assetClass: cleanString(holding.assetClass || 'equity', 24),
    currency,
    category: cleanString(holding.category || '기타', 40),
    quantity,
    avgPrice,
    currentPrice,
    purchaseAmount,
    marketValue,
    pnl,
    returnPct,
    targetWeight,
    memo: cleanString(holding.memo, 240),
    createdAt: readNumber(holding.createdAt, Date.now()),
    updatedAt: Date.now(),
  }
}

function sanitizeAccount(account = {}) {
  const type = ACCOUNT_TYPES.has(account.type) ? account.type : 'BROKERAGE'
  const totalCapital = readNumber(account.totalCapital)
  if (totalCapital < 0) return null

  const holdings = Array.isArray(account.holdings)
    ? account.holdings.slice(0, 200).map(sanitizeHolding).filter(Boolean)
    : []

  return {
    id: cleanString(account.id, 80) || undefined,
    name: cleanString(account.name || '새 계좌', 80),
    type,
    baseCurrency: CURRENCIES.has(account.baseCurrency) ? account.baseCurrency : 'KRW',
    totalCapital,
    memo: cleanString(account.memo, 240),
    holdings,
    createdAt: readNumber(account.createdAt, Date.now()),
    updatedAt: Date.now(),
  }
}

export function validatePortfolioBody(body = {}) {
  if (!Array.isArray(body.accounts)) {
    return { error: 'accounts 배열이 필요합니다' }
  }
  if (body.accounts.length > 40) {
    return { error: '계좌는 최대 40개까지 저장할 수 있습니다' }
  }

  const accounts = body.accounts.map(sanitizeAccount)
  if (accounts.some((account) => !account)) {
    return { error: '계좌 또는 보유 종목 데이터 형식이 올바르지 않습니다' }
  }

  const sanitizeWatch = (item = {}) => {
    const ticker = sanitizeTicker(item.ticker)
    if (!ticker) return null
    return {
      ticker,
      name: cleanString(item.name || ticker, 80),
      addedAt: readNumber(item.addedAt, Date.now()),
    }
  }

  const savedPortfolios = Array.isArray(body.savedPortfolios)
    ? body.savedPortfolios.slice(0, 20).map((item) => ({
        id: cleanString(item.id, 80) || undefined,
        name: cleanString(item.name || '포트폴리오', 80),
        accounts: Array.isArray(item.accounts) ? item.accounts.slice(0, 40).map(sanitizeAccount).filter(Boolean) : accounts,
        watchlist: Array.isArray(item.watchlist) ? item.watchlist.slice(0, 100).map(sanitizeWatch).filter(Boolean) : [],
        recentTickers: Array.isArray(item.recentTickers) ? item.recentTickers.slice(0, 20).map(sanitizeTicker).filter(Boolean) : [],
        preferences: typeof item.preferences === 'object' && item.preferences ? item.preferences : {},
        updatedAt: readNumber(item.updatedAt, Date.now()),
      }))
    : []

  return {
    values: {
      currentPortfolioId: cleanString(body.currentPortfolioId || 'default', 80),
      currentPortfolioName: cleanString(body.currentPortfolioName || '기본 포트폴리오', 80),
      accounts,
      savedPortfolios,
      watchlist: Array.isArray(body.watchlist) ? body.watchlist.slice(0, 100).map(sanitizeWatch).filter(Boolean) : [],
      recentTickers: Array.isArray(body.recentTickers) ? body.recentTickers.slice(0, 20).map(sanitizeTicker).filter(Boolean) : [],
      preferences: typeof body.preferences === 'object' && body.preferences ? body.preferences : {},
    },
  }
}

export function validateTickersBody(body = {}) {
  if (!Array.isArray(body.tickers) || body.tickers.length === 0) {
    return { error: 'tickers 배열이 필요합니다' }
  }
  if (body.tickers.length > 60) {
    return { error: '한 번에 최대 60개 종목까지 조회할 수 있습니다' }
  }

  const tickers = [...new Set(body.tickers.map(sanitizeTicker).filter(Boolean))]
  if (!tickers.length) return { error: '조회 가능한 종목 코드가 없습니다' }
  return { values: { tickers } }
}

export function validateHistoryQuery(query = {}) {
  const months = Math.min(Math.max(parseInt(query.months, 10) || 24, 1), 120)
  return { values: { months } }
}

export function validateChartQuery(query = {}) {
  const range = CHART_RANGES.has(query.range) ? query.range : '1y'
  return { values: { range } }
}

import { ACCOUNT_TYPES, ASSET_UNIVERSE } from '../../services/mockData.js'

const FIELD_ALIASES = {
  portfolioName: ['portfolioName', 'portfolio', '포트폴리오명', '포트폴리오이름'],
  accountName: ['accountName', 'account', 'accountAlias', '계좌명', '계좌이름', '계좌별명'],
  accountType: ['accountType', 'type', 'accountKind', '계좌유형', '계좌종류', '계좌구분'],
  accountNumber: ['accountNumber', 'accountNo', '계좌번호'],
  totalCapital: ['totalCapital', 'capital', 'principal', 'assetTotal', '자산총액', '총자산', '투자원금', '원금'],
  ticker: ['ticker', 'symbol', 'code', '종목코드', '티커', '코드'],
  name: ['name', 'holdingName', 'assetName', 'stockName', 'productName', '종목명', '상품명', '자산명'],
  quantity: ['quantity', 'qty', 'shares', 'units', '보유수량', '수량', '잔고수량'],
  avgPrice: ['avgPrice', 'averagePrice', 'costBasis', '평균단가', '평균매입가', '매입단가', '취득단가'],
  currentPrice: ['currentPrice', 'price', '현재가', '현재가격'],
  purchaseAmount: ['purchaseAmount', 'cost', 'buyAmount', '매입금액', '매수금액', '취득금액'],
  marketValue: ['marketValue', 'valuation', 'value', '평가금액', '평가액'],
  pnl: ['pnl', 'profitLoss', 'gainLoss', '평가손익', '손익', '평가차익'],
  returnPct: ['returnPct', 'returnRate', 'profitRate', '손익률', '수익률'],
  currency: ['currency', 'ccy', '통화', '화폐'],
  category: ['category', 'assetCategory', '카테고리', '자산군'],
  targetWeight: ['targetWeight', 'target', '목표비중', '목표비율'],
  memo: ['memo', 'note', '메모', '비고'],
}

const ALIAS_TO_FIELD = Object.entries(FIELD_ALIASES).reduce((map, [field, aliases]) => {
  aliases.forEach((alias) => map.set(cleanKey(alias), field))
  return map
}, new Map())

function cleanKey(value) {
  return String(value || '')
    .trim()
    .replace(/[\s_./()·-]/g, '')
    .toLowerCase()
}

function resolveField(header) {
  return ALIAS_TO_FIELD.get(cleanKey(header)) || cleanKey(header)
}

function parseNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  const raw = String(value ?? '').trim()
  if (!raw || /^[-–—]+$/.test(raw)) return 0

  const isWrappedNegative = raw.startsWith('(') && raw.endsWith(')')
  const normalized = raw
    .replace(/[,+▲△₩$원%\s]/g, '')
    .replace(/[−–—]/g, '-')
    .replace(/[()]/g, '')

  const parsed = Number(normalized)
  if (!Number.isFinite(parsed)) return 0
  return isWrappedNegative ? -Math.abs(parsed) : parsed
}

function normalizeCurrency(value, fallback = 'KRW') {
  const raw = String(value || '').trim().toUpperCase()
  if (['KRW', '원', '원화'].includes(raw)) return 'KRW'
  if (['USD', '달러', '미국달러'].includes(raw)) return 'USD'
  if (['EUR', '유로'].includes(raw)) return 'EUR'
  return raw || fallback
}

function normalizeTicker(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, '')
    .toUpperCase()
}

function normalizeAccountType(value) {
  const raw = String(value || '').trim()
  const key = raw.toUpperCase()
  if (ACCOUNT_TYPES[key]) return key

  const compact = raw.replace(/\s/g, '').toLowerCase()
  if (compact.includes('isa')) return 'ISA'
  if (compact.includes('연금') || compact.includes('irp')) return 'PENSION'
  if (compact.includes('cma')) return 'CMA'
  if (compact.includes('금') || compact.includes('gold')) return 'GOLD'

  const matched = Object.entries(ACCOUNT_TYPES).find(([, meta]) => {
    const label = meta.label.replace(/\s/g, '').toLowerCase()
    const fullName = meta.fullName.replace(/\s/g, '').toLowerCase()
    return compact === label || compact === fullName || fullName.includes(compact)
  })

  return matched?.[0] || 'BROKERAGE'
}

function canonicalizeRow(row = {}) {
  return Object.entries(row).reduce((next, [key, value]) => {
    const field = resolveField(key)
    if (next[field] === undefined || next[field] === '') next[field] = value
    return next
  }, {})
}

function parseCsvLine(line) {
  const cells = []
  let current = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]

    if (char === '"' && quoted && next === '"') {
      current += '"'
      index += 1
      continue
    }

    if (char === '"') {
      quoted = !quoted
      continue
    }

    if (char === ',' && !quoted) {
      cells.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  cells.push(current.trim())
  return cells
}

function parseCsvRows(text) {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim())

  if (lines.length < 2) throw new Error('CSV 파일에 헤더와 데이터가 필요합니다.')

  const headers = parseCsvLine(lines[0]).map(resolveField)
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line)
    return headers.reduce((row, header, index) => {
      row[header] = cells[index] ?? ''
      return row
    }, {})
  })
}

function findAsset(ticker, name) {
  const normalizedTicker = normalizeTicker(ticker)
  const normalizedName = String(name || '').trim().toLowerCase()

  return (
    ASSET_UNIVERSE.find((asset) => asset.ticker.toUpperCase() === normalizedTicker) ||
    ASSET_UNIVERSE.find((asset) => asset.name.toLowerCase() === normalizedName) ||
    ASSET_UNIVERSE.find((asset) => normalizedName && asset.name.toLowerCase().includes(normalizedName)) ||
    null
  )
}

function rowToHolding(row) {
  const item = canonicalizeRow(row)
  const asset = findAsset(item.ticker, item.name)
  const ticker = normalizeTicker(item.ticker || asset?.ticker || item.name)
  const name = String(item.name || asset?.name || ticker).trim()

  if (!ticker && !name) return null

  const quantity = parseNumber(item.quantity)
  const avgPrice = parseNumber(item.avgPrice)
  const currentPrice = parseNumber(item.currentPrice)
  const purchaseAmount = parseNumber(item.purchaseAmount)
  const marketValue = parseNumber(item.marketValue)

  if (quantity <= 0 && avgPrice <= 0 && purchaseAmount <= 0 && marketValue <= 0 && currentPrice <= 0) {
    return null
  }

  return {
    ticker,
    name,
    sector: item.sector || asset?.sector || '기타',
    region: item.region || asset?.region || '기타',
    market: item.market || (asset?.region === '국내' ? '국내' : asset?.region === '미국' ? '미국' : '글로벌'),
    assetClass: item.assetClass || asset?.assetClass || 'equity',
    currency: normalizeCurrency(item.currency, asset?.currency || 'KRW'),
    category: item.category || '',
    quantity,
    avgPrice,
    currentPrice,
    purchaseAmount,
    marketValue,
    pnl: parseNumber(item.pnl),
    returnPct: parseNumber(item.returnPct),
    targetWeight: parseNumber(item.targetWeight),
    memo: String(item.memo || '').trim(),
  }
}

function rowsToPortfolio(rows, fallbackName) {
  const groups = new Map()

  rows.map(canonicalizeRow).forEach((row, index) => {
    const type = normalizeAccountType(row.accountType)
    const accountName = String(row.accountName || row.accountNumber || '').trim()
    const key = `${type}:${accountName || 'default'}`
    const existing = groups.get(key) || {
      name: accountName,
      type,
      totalCapital: 0,
      holdings: [],
      order: index,
    }

    const totalCapital = parseNumber(row.totalCapital)
    if (totalCapital > existing.totalCapital) existing.totalCapital = totalCapital

    const holding = rowToHolding(row)
    if (holding) existing.holdings.push(holding)

    groups.set(key, existing)
  })

  const accounts = Array.from(groups.values())
    .sort((left, right) => left.order - right.order)
    .map((account) => {
      const inferredCapital = account.holdings.reduce((sum, holding) => {
        const purchaseAmount = Number(holding.purchaseAmount || 0)
        if (purchaseAmount > 0) return sum + purchaseAmount
        return sum + Number(holding.quantity || 0) * Number(holding.avgPrice || 0)
      }, 0)

      return {
        name: account.name,
        type: account.type,
        totalCapital: account.totalCapital || inferredCapital,
        holdings: account.holdings,
      }
    })
    .filter((account) => account.holdings.length || account.totalCapital > 0)

  if (!accounts.length) throw new Error('불러올 수 있는 계좌나 종목을 찾지 못했습니다.')

  return {
    name: fallbackName,
    accounts,
    watchlist: [],
    recentTickers: accounts.flatMap((account) => account.holdings.map((holding) => holding.ticker)).slice(0, 8),
  }
}

function normalizeJsonPortfolio(data, fallbackName) {
  const source =
    data?.accounts ? data :
    data?.portfolio?.accounts ? data.portfolio :
    data?.data?.accounts ? data.data :
    Array.isArray(data?.savedPortfolios) && data.savedPortfolios.length ? data.savedPortfolios[0] :
    data

  if (Array.isArray(source)) return rowsToPortfolio(source, fallbackName)
  if (Array.isArray(source?.holdings)) return rowsToPortfolio(source.holdings, source.name || fallbackName)

  if (Array.isArray(source?.accounts)) {
    const accounts = source.accounts.map((account) => {
      const canonical = canonicalizeRow(account)
      const holdings = Array.isArray(account.holdings)
        ? account.holdings.map(rowToHolding).filter(Boolean)
        : []

      return {
        ...account,
        name: String(account.name || canonical.accountName || '').trim(),
        type: normalizeAccountType(account.type || canonical.accountType),
        totalCapital: parseNumber(account.totalCapital ?? canonical.totalCapital),
        holdings,
      }
    }).filter((account) => account.holdings.length || Number(account.totalCapital || 0) > 0)

    if (!accounts.length) throw new Error('불러올 수 있는 계좌나 종목을 찾지 못했습니다.')

    return {
      name: source.name || source.currentPortfolioName || fallbackName,
      accounts,
      watchlist: Array.isArray(source.watchlist) ? source.watchlist : [],
      recentTickers: Array.isArray(source.recentTickers) ? source.recentTickers : [],
      preferences: source.preferences,
    }
  }

  throw new Error('지원하지 않는 포트폴리오 파일 구조입니다.')
}

export function parsePortfolioText(text, fileName = 'portfolio.json') {
  const trimmed = String(text || '').trim()
  if (!trimmed) throw new Error('파일 내용이 비어 있습니다.')

  const baseName = fileName.replace(/\.[^.]+$/, '').trim() || '불러온 포트폴리오'
  const extension = fileName.split('.').pop()?.toLowerCase()

  if (extension === 'csv') {
    return rowsToPortfolio(parseCsvRows(trimmed), baseName)
  }

  if (extension === 'json' || trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return normalizeJsonPortfolio(JSON.parse(trimmed), baseName)
    } catch (error) {
      if (error instanceof SyntaxError) throw new Error('JSON 형식이 올바르지 않습니다.', { cause: error })
      throw error
    }
  }

  throw new Error('지원하는 파일은 JSON 또는 CSV입니다.')
}

export async function parsePortfolioFile(file) {
  const text = await file.text()
  return parsePortfolioText(text, file.name)
}

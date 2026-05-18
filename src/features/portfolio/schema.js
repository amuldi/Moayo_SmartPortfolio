import { ACCOUNT_TYPES, getAssetInfo } from '../../services/mockData.js'

export const FX_RATES = {
  KRW: 1,
  USD: 1450,
  EUR: 1580,
  DKK: 212,
}

export const MARKET_OPTIONS = [
  { value: 'ALL', label: '전체 시장' },
  { value: '국내', label: '국내' },
  { value: '미국', label: '미국' },
  { value: '글로벌', label: '글로벌' },
]

export const PERFORMANCE_FILTERS = [
  { value: 'ALL', label: '전체' },
  { value: 'PROFIT', label: '수익' },
  { value: 'LOSS', label: '손실' },
]

export const HOLDING_SORT_OPTIONS = [
  { value: 'valueDesc', label: '평가금액순' },
  { value: 'returnDesc', label: '수익률순' },
  { value: 'weightDesc', label: '비중순' },
  { value: 'nameAsc', label: '이름순' },
]

export const CATEGORY_OPTIONS = [
  '국내주식',
  '미국주식',
  'ETF',
  '배당주',
  '성장주',
  '채권',
  '원자재',
  '리츠',
  '현금성',
  '기타',
]

export const DEFAULT_PORTFOLIO_PREFERENCES = {
  market: 'ALL',
  category: 'ALL',
  performance: 'ALL',
  sortBy: 'valueDesc',
  period: '1Y',
  search: '',
  accountId: 'ALL',
}

export function createDefaultAccountName(type = 'BROKERAGE', accounts = []) {
  const normalizedType = ACCOUNT_TYPES[type] ? type : 'BROKERAGE'
  const baseName = ACCOUNT_TYPES[normalizedType]?.label || '계좌'
  const existingNames = new Set(accounts.map((account) => account.name).filter(Boolean))

  for (let index = 1; index < 1000; index += 1) {
    const candidate = `${baseName} ${index}`
    if (!existingNames.has(candidate)) return candidate
  }

  return baseName
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function roundNumber(value, digits = 4) {
  const factor = 10 ** digits
  return Math.round(Number(value || 0) * factor) / factor
}

function inferCategory(asset) {
  const { assetClass, region, sector, expenseRatio, name } = asset

  if (assetClass === 'bond') return '채권'
  if (assetClass === 'commodity') return '원자재'
  if (assetClass === 'cash') return '현금성'
  if (sector.includes('리츠') || sector.includes('인프라')) return '리츠'
  if (expenseRatio > 0 || /(ETF|KODEX|TIGER|ACE|KBSTAR|HANARO|SOL)/i.test(name)) return 'ETF'
  if (sector.includes('배당') || name.includes('배당') || name.includes('월배당')) return '배당주'
  if (sector.includes('AI') || sector.includes('반도체') || sector.includes('클라우드') || sector.includes('플랫폼')) return '성장주'
  if (region === '국내') return '국내주식'
  if (region === '미국') return '미국주식'
  return '기타'
}

export function getAssetMarket(asset) {
  if (asset.region === '국내') return '국내'
  if (asset.region === '미국') return '미국'
  return '글로벌'
}

export function normalizeHolding(holding = {}, account = {}) {
  const asset = getAssetInfo(holding.ticker || holding.name || 'UNKNOWN')
  const currentPrice = Number(holding.currentPrice || 0)
  const purchaseAmount = Number(holding.purchaseAmount || 0)
  const marketValue = Number(holding.marketValue || 0)
  const pnl = Number(holding.pnl || 0)
  const returnPct = Number(holding.returnPct || 0)
  const fallbackPrice = holding.avgPrice || currentPrice || (holding.quantity > 0 && purchaseAmount > 0 ? purchaseAmount / holding.quantity : 0) || asset.price || 1
  const inferredCost = Number(account.totalCapital || 0) * (Number(holding.allocation || 0) / 100)
  const inferredQuantity = inferredCost > 0 ? inferredCost / fallbackPrice : 0
  const quantity = Number(holding.quantity ?? inferredQuantity ?? 0)
  const avgPrice =
    Number(holding.avgPrice) > 0
      ? Number(holding.avgPrice)
      : roundNumber(fallbackPrice * (asset.annualReturn >= 0 ? 0.93 : 1.08), asset.currency === 'KRW' ? 0 : 2)

  const merged = {
    id: holding.id || createId('holding'),
    ticker: (holding.ticker || asset.ticker || '').toUpperCase().trim(),
    name: holding.name || asset.name || '이름 없는 종목',
    sector: holding.sector || asset.sector || '기타',
    region: holding.region || asset.region || '기타',
    market: holding.market || getAssetMarket(asset),
    assetClass: holding.assetClass || asset.assetClass || 'equity',
    currency: holding.currency || asset.currency || account.baseCurrency || 'KRW',
    category: holding.category || inferCategory({ ...asset, ...holding }),
    quantity: roundNumber(quantity, 6),
    avgPrice: roundNumber(avgPrice, 2),
    currentPrice: roundNumber(currentPrice, currentPrice >= 1000 ? 2 : 4),
    purchaseAmount: roundNumber(purchaseAmount, 2),
    marketValue: roundNumber(marketValue, 2),
    pnl: roundNumber(pnl, 2),
    returnPct: roundNumber(returnPct, 2),
    targetWeight: Number(holding.targetWeight || 0),
    memo: typeof holding.memo === 'string' ? holding.memo : '',
    createdAt: holding.createdAt || Date.now(),
    updatedAt: Date.now(),
  }

  return merged
}

export function normalizeAccount(account = {}) {
  const type = ACCOUNT_TYPES[account.type] ? account.type : 'BROKERAGE'
  const baseCurrency = account.baseCurrency || 'KRW'
  const holdings = Array.isArray(account.holdings)
    ? account.holdings.map((holding) => normalizeHolding(holding, { ...account, type, baseCurrency }))
    : []

  return {
    id: account.id || createId('account'),
    name: (account.name || '').trim() || createDefaultAccountName(type),
    type,
    baseCurrency,
    totalCapital: Number(account.totalCapital || 0),
    memo: typeof account.memo === 'string' ? account.memo : '',
    holdings,
    createdAt: account.createdAt || Date.now(),
    updatedAt: Date.now(),
  }
}

export function validateAccountInput(values) {
  const errors = {}
  if (!ACCOUNT_TYPES[values.type]) errors.type = '계좌 유형을 다시 선택해 주세요.'

  const capital = Number(String(values.totalCapital || '').replace(/,/g, ''))
  if (!Number.isFinite(capital) || capital < 0) {
    errors.totalCapital = '투자 원금은 0 이상으로 입력해 주세요.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values: {
      name: values.name?.trim() || '',
      type: values.type || 'BROKERAGE',
      totalCapital: capital || 0,
      memo: values.memo?.trim() || '',
    },
  }
}

export function validateHoldingInput(values) {
  const errors = {}
  if (!values.ticker?.trim()) errors.ticker = '종목 코드를 선택해 주세요.'
  if (!values.name?.trim()) errors.name = '종목명을 입력해 주세요.'

  const quantity = Number(values.quantity)
  const avgPrice = Number(values.avgPrice)
  const inputMode = values.inputMode || 'quantity'
  const targetWeight = Number(values.targetWeight || 0)

  if (!Number.isFinite(avgPrice) || avgPrice <= 0) {
    errors.avgPrice = '매수 평균가는 0보다 크게 입력해 주세요.'
  }
  if (inputMode === 'quantity' && (!Number.isFinite(quantity) || quantity <= 0)) {
    errors.quantity = '수량은 0보다 크게 입력해 주세요.'
  }
  if (inputMode === 'weight' && (!Number.isFinite(targetWeight) || targetWeight <= 0 || targetWeight > 100)) {
    errors.targetWeight = '목표 비중은 0보다 크고 100 이하여야 합니다.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values: {
      ticker: values.ticker?.trim().toUpperCase() || '',
      name: values.name?.trim() || '',
      sector: values.sector?.trim() || '기타',
      region: values.region || '국내',
      market: values.market || (values.region === '미국' ? '미국' : values.region === '국내' ? '국내' : '글로벌'),
      assetClass: values.assetClass || 'equity',
      currency: values.currency || 'KRW',
      category: values.category || '기타',
      quantity: roundNumber(quantity, 6),
      avgPrice: roundNumber(avgPrice, values.currency === 'KRW' ? 0 : 2),
      targetWeight: roundNumber(targetWeight, 2),
      inputMode,
      memo: values.memo?.trim() || '',
    },
  }
}

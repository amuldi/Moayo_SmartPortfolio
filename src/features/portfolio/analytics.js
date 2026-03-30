import { ACCOUNT_TYPES, getAssetInfo, getHistoricalPrices } from '../../services/mockData.js'
import { FX_RATES } from './schema.js'

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function round(value, digits = 0) {
  const factor = 10 ** digits
  return Math.round((Number(value) || 0) * factor) / factor
}

function tickerSeed(ticker) {
  return String(ticker || '')
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function fallbackDailyChangePct(asset, ticker) {
  const seed = tickerSeed(ticker)
  const base = ((seed % 19) - 9) * 0.18
  const trend = (asset.annualReturn || 0) / 36
  return clamp(round(base + trend, 2), -5.4, 5.4)
}

export function getQuoteForHolding(holding, livePrices = {}) {
  const asset = getAssetInfo(holding.ticker)
  const quote = livePrices?.[holding.ticker]
  const price = Number(quote?.price ?? asset.price ?? holding.avgPrice ?? 0)
  const changePct = Number.isFinite(quote?.changePct)
    ? Number(quote.changePct)
    : fallbackDailyChangePct(asset, holding.ticker)

  return {
    price,
    changePct,
    currency: quote?.currency || holding.currency || asset.currency || 'KRW',
    source: quote ? 'live' : 'mock',
  }
}

function convertToKrw(amount, currency) {
  return amount * (FX_RATES[currency] || 1)
}

export function buildHoldingMetrics(holding, account, livePrices = {}) {
  const quote = getQuoteForHolding(holding, livePrices)
  const asset = getAssetInfo(holding.ticker)
  const quantity = Number(holding.quantity || 0)
  const avgPrice = Number(holding.avgPrice || 0)
  const invested = quantity * avgPrice
  const marketValue = quantity * quote.price
  const investedKRW = convertToKrw(invested, holding.currency)
  const marketValueKRW = convertToKrw(marketValue, quote.currency)
  const pnl = marketValueKRW - investedKRW
  const pnlPct = investedKRW > 0 ? (pnl / investedKRW) * 100 : 0
  const previousClose = quote.price / (1 + quote.changePct / 100)
  const dailyPnl = convertToKrw((quote.price - previousClose) * quantity, quote.currency)

  return {
    ...holding,
    asset,
    accountId: account.id,
    accountName: account.name,
    accountType: account.type,
    accountLabel: ACCOUNT_TYPES[account.type]?.label || account.type,
    quote,
    quantity,
    avgPrice,
    currentPrice: quote.price,
    currentPriceKRW: convertToKrw(quote.price, quote.currency),
    invested,
    investedKRW,
    marketValue,
    marketValueKRW,
    pnl,
    pnlPct,
    dailyPnl,
    dailyChangePct: quote.changePct,
    region: holding.region || asset.region,
    market: holding.market || (asset.region === '국내' ? '국내' : asset.region === '미국' ? '미국' : '글로벌'),
    category: holding.category || asset.category || '기타',
    sector: holding.sector || asset.sector,
    annualReturn: asset.annualReturn || 0,
    volatility: asset.volatility || 0,
  }
}

function buildMonthlyTimeline(holdings) {
  if (!holdings.length) return []

  const monthMap = new Map()

  holdings.forEach((holding) => {
    const history = getHistoricalPrices(holding.ticker, 12)
    history.forEach((point) => {
      const value = convertToKrw(point.price * holding.quantity, holding.currency)
      monthMap.set(point.month, (monthMap.get(point.month) || 0) + value)
    })
  })

  const timeline = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, portfolioValue]) => ({ month, portfolioValue }))

  const base = timeline[0]?.portfolioValue || 0

  return timeline.map((row) => ({
    ...row,
    performance: base > 0 ? round((row.portfolioValue / base) * 100, 2) : 100,
  }))
}

function summarizeBy(items, key) {
  const map = new Map()
  items.forEach((item) => {
    const label = item[key] || '기타'
    map.set(label, (map.get(label) || 0) + item.marketValueKRW)
  })

  const total = items.reduce((sum, item) => sum + item.marketValueKRW, 0)
  return Array.from(map.entries())
    .map(([name, value]) => ({
      name,
      value: total > 0 ? round((value / total) * 100, 1) : 0,
      amount: value,
    }))
    .sort((a, b) => b.amount - a.amount)
}

function getDiversificationScore(holdings, byCategory, byMarket) {
  if (!holdings.length) return 0
  const largestWeight = Math.max(...holdings.map((holding) => holding.weight))
  const categoryBonus = clamp(byCategory.length * 10, 0, 30)
  const marketBonus = clamp(byMarket.length * 12, 0, 24)
  const concentrationPenalty = clamp(largestWeight * 0.8, 0, 44)
  return clamp(Math.round(50 + categoryBonus + marketBonus - concentrationPenalty), 0, 100)
}

function buildRebalancingSuggestions(holdings) {
  const candidates = holdings.filter((holding) => Number(holding.targetWeight || 0) > 0)
  if (!candidates.length) return []

  return candidates
    .map((holding) => ({
      ticker: holding.ticker,
      name: holding.name,
      currentWeight: holding.weight,
      targetWeight: holding.targetWeight,
      gap: holding.targetWeight - holding.weight,
      action: holding.targetWeight - holding.weight > 0 ? '매수' : '매도',
      amount: (Math.abs(holding.targetWeight - holding.weight) / 100) * holding.marketValueKRW,
    }))
    .filter((item) => Math.abs(item.gap) >= 1)
    .sort((left, right) => Math.abs(right.gap) - Math.abs(left.gap))
}

export function buildPortfolioSnapshot(accounts = [], livePrices = {}) {
  const enrichedAccounts = accounts.map((account) => {
    const holdings = account.holdings.map((holding) => buildHoldingMetrics(holding, account, livePrices))
    const investedKRW = holdings.reduce((sum, holding) => sum + holding.investedKRW, 0)
    const marketValueKRW = holdings.reduce((sum, holding) => sum + holding.marketValueKRW, 0)
    const dailyPnl = holdings.reduce((sum, holding) => sum + holding.dailyPnl, 0)
    const pnl = marketValueKRW - investedKRW
    const cashBuffer = Math.max(Number(account.totalCapital || 0) - investedKRW, 0)

    return {
      ...account,
      holdings,
      investedKRW,
      marketValueKRW,
      pnl,
      returnPct: investedKRW > 0 ? (pnl / investedKRW) * 100 : 0,
      dailyPnl,
      cashBuffer,
    }
  })

  const holdings = enrichedAccounts.flatMap((account) => account.holdings)
  const totalInvestedKRW = holdings.reduce((sum, holding) => sum + holding.investedKRW, 0)
  const totalValueKRW = holdings.reduce((sum, holding) => sum + holding.marketValueKRW, 0)
  const totalDailyPnl = holdings.reduce((sum, holding) => sum + holding.dailyPnl, 0)
  const totalPnl = totalValueKRW - totalInvestedKRW

  const weightedHoldings = holdings
    .map((holding) => ({
      ...holding,
      weight: totalValueKRW > 0 ? (holding.marketValueKRW / totalValueKRW) * 100 : 0,
    }))
    .sort((a, b) => b.marketValueKRW - a.marketValueKRW)

  const byCategory = summarizeBy(weightedHoldings, 'category')
  const byMarket = summarizeBy(weightedHoldings, 'market')
  const byAccount = enrichedAccounts
    .map((account) => ({
      name: account.name,
      value: totalValueKRW > 0 ? round((account.marketValueKRW / totalValueKRW) * 100, 1) : 0,
      amount: account.marketValueKRW,
    }))
    .sort((a, b) => b.amount - a.amount)

  const timeline = buildMonthlyTimeline(weightedHoldings)
  const topGainers = [...weightedHoldings].sort((a, b) => b.pnlPct - a.pnlPct).slice(0, 5)
  const topLosers = [...weightedHoldings].sort((a, b) => a.pnlPct - b.pnlPct).slice(0, 5)
  const profitDistribution = [...weightedHoldings]
    .sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl))
    .slice(0, 8)
    .map((holding) => ({
      name: holding.name,
      value: round(holding.pnl / 10000, 1),
      pnl: holding.pnl,
    }))
  const rebalancingSuggestions = buildRebalancingSuggestions(weightedHoldings)

  return {
    accounts: enrichedAccounts,
    holdings: weightedHoldings,
    totalInvestedKRW,
    totalValueKRW,
    totalPnl,
    totalReturnPct: totalInvestedKRW > 0 ? (totalPnl / totalInvestedKRW) * 100 : 0,
    totalDailyPnl,
    totalDailyChangePct: totalValueKRW > 0 ? (totalDailyPnl / (totalValueKRW - totalDailyPnl || 1)) * 100 : 0,
    holdingCount: weightedHoldings.length,
    biggestHolding: weightedHoldings[0] || null,
    topGainers,
    topLosers,
    byCategory,
    byMarket,
    byAccount,
    timeline,
    profitDistribution,
    rebalancingSuggestions,
    diversificationScore: getDiversificationScore(weightedHoldings, byCategory, byMarket),
  }
}

export function filterAndSortHoldings(holdings, preferences) {
  const query = preferences.search?.trim().toLowerCase() || ''

  const filtered = holdings.filter((holding) => {
    if (preferences.accountId && preferences.accountId !== 'ALL' && holding.accountId !== preferences.accountId) return false
    if (preferences.market && preferences.market !== 'ALL' && holding.market !== preferences.market) return false
    if (preferences.category && preferences.category !== 'ALL' && holding.category !== preferences.category) return false
    if (preferences.performance === 'PROFIT' && holding.pnl < 0) return false
    if (preferences.performance === 'LOSS' && holding.pnl >= 0) return false
    if (!query) return true

    return (
      holding.name.toLowerCase().includes(query) ||
      holding.ticker.toLowerCase().includes(query) ||
      holding.memo.toLowerCase().includes(query)
    )
  })

  const sorted = [...filtered].sort((left, right) => {
    switch (preferences.sortBy) {
      case 'returnDesc':
        return right.pnlPct - left.pnlPct
      case 'weightDesc':
        return right.weight - left.weight
      case 'nameAsc':
        return left.name.localeCompare(right.name, 'ko')
      case 'valueDesc':
      default:
        return right.marketValueKRW - left.marketValueKRW
    }
  })

  return sorted
}

import { ACCOUNT_TYPES, getAssetInfo, getHistoricalPrices } from '../../services/mockData.js'
import { FX_RATES } from './schema.js'
import { getRecommendationsForProfile } from './recommendationEngine.js'

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

function summarizeBySector(items) {
  const map = new Map()
  items.forEach((item) => {
    const label = item.sector || '기타'
    map.set(label, (map.get(label) || 0) + item.marketValueKRW)
  })
  const total = items.reduce((sum, item) => sum + item.marketValueKRW, 0)
  return Array.from(map.entries())
    .map(([name, amount]) => ({
      name,
      value: total > 0 ? round((amount / total) * 100, 1) : 0,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount)
}

function detectOverlap(items) {
  const duplicates = new Map()
  items.forEach((item) => {
    const key = `${item.market}-${item.sector}`
    duplicates.set(key, [...(duplicates.get(key) || []), item])
  })
  return Array.from(duplicates.values())
    .filter((group) => group.length >= 2)
    .slice(0, 4)
    .map((group) => ({
      title: `${group[0].sector} 노출 중복`,
      message: `${group.map((item) => item.name).join(', ')}이(가) 유사한 노출을 만들고 있습니다.`,
    }))
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

function buildDiagnosis(snapshot) {
  const issues = []
  const biggestHolding = snapshot.biggestHolding
  const topSector = snapshot.bySector[0]
  const topMarket = snapshot.byMarket[0]

  if (biggestHolding?.weight >= 30) {
    issues.push({
      title: '집중도 높음',
      severity: 'high',
      description: `${biggestHolding.name} 비중이 ${biggestHolding.weight.toFixed(1)}%입니다. 한 종목 영향이 포트폴리오 전체를 흔들 수 있습니다.`,
    })
  }
  if (topSector?.value >= 45) {
    issues.push({
      title: '섹터 쏠림',
      severity: 'medium',
      description: `${topSector.name} 비중이 ${topSector.value.toFixed(1)}%로 높습니다. 업종 사이클 영향이 커질 수 있습니다.`,
    })
  }
  if (topMarket?.value >= 70) {
    issues.push({
      title: '지역 편중',
      severity: 'medium',
      description: `${topMarket.name} 비중이 ${topMarket.value.toFixed(1)}%입니다. 환율과 한 시장 변동성에 노출됩니다.`,
    })
  }
  if (!issues.length) {
    issues.push({
      title: '구조는 비교적 안정적',
      severity: 'low',
      description: '극단적인 집중도는 보이지 않지만 목표 비중과 계좌 역할 분리는 더 다듬을 수 있습니다.',
    })
  }

  return issues
}

function buildPortfolioScore(snapshot, overlaps, accountConflicts) {
  const concentrationPenalty = snapshot.biggestHolding?.weight >= 30 ? 12 : snapshot.biggestHolding?.weight >= 20 ? 6 : 0
  const overlapPenalty = overlaps.length * 5
  const accountPenalty = accountConflicts.length * 6
  const cashBonus = snapshot.holdings.some((holding) => holding.category === '현금성' && holding.weight >= 3) ? 4 : 0
  const marketBalanceBonus = snapshot.byMarket.length >= 3 ? 4 : snapshot.byMarket.length >= 2 ? 2 : 0
  const rawScore = Math.round(snapshot.diversificationScore - concentrationPenalty - overlapPenalty - accountPenalty + cashBonus + marketBalanceBonus)

  let label = '보완 필요'
  let summary = '집중도와 계좌 역할 분리를 조금만 다듬으면 구조가 훨씬 안정됩니다.'

  if (rawScore >= 85) {
    label = '우수'
    summary = '분산과 계좌 역할이 비교적 잘 맞아 있습니다. 미세 조정 위주로 접근하면 됩니다.'
  } else if (rawScore >= 72) {
    label = '양호'
    summary = '큰 구조 문제는 적지만, 몇몇 비중과 계좌 역할을 정리하면 더 관리하기 쉬워집니다.'
  } else if (rawScore >= 58) {
    label = '보통'
    summary = '성장·방어 자산이 섞여 있고 편중도 일부 보여서, 목표 비중 중심 재정리가 필요합니다.'
  }

  return {
    value: clamp(rawScore, 0, 100),
    label,
    summary,
  }
}

function buildStyleSummary(snapshot) {
  const growthWeight = snapshot.holdings
    .filter((holding) => ['성장주', '미국주식'].includes(holding.category) || holding.volatility >= 28)
    .reduce((sum, holding) => sum + holding.weight, 0)
  const incomeWeight = snapshot.holdings
    .filter((holding) => ['배당주', '리츠', '채권', '현금성'].includes(holding.category))
    .reduce((sum, holding) => sum + holding.weight, 0)
  const cashWeight = snapshot.holdings
    .filter((holding) => holding.category === '현금성')
    .reduce((sum, holding) => sum + holding.weight, 0)

  const tags = []
  if (growthWeight >= 55) tags.push('성장 편향')
  if (incomeWeight >= 35) tags.push('현금흐름 지향')
  if (cashWeight >= 10) tags.push('대기 자금 확보')
  if (snapshot.diversificationScore >= 72) tags.push('분산 양호')
  if (snapshot.diversificationScore <= 55) tags.push('집중 관리 필요')

  const summary =
    growthWeight >= incomeWeight
      ? `현재 구조는 성장 자산 비중이 ${growthWeight.toFixed(1)}%로 높아 수익 기회는 크지만 변동성 체감도도 큰 편입니다.`
      : `현재 구조는 배당·채권·현금성 자산이 ${incomeWeight.toFixed(1)}%를 차지해 방어력은 있지만 성장 자산 노출은 다소 약합니다.`

  return {
    growthWeight,
    incomeWeight,
    cashWeight,
    tags,
    summary,
  }
}

function buildAccountGuides(accounts) {
  return accounts.map((account) => {
    const highGrowth = account.holdings.filter((holding) => ['성장주', '미국주식'].includes(holding.category)).length
    const incomeAssets = account.holdings.filter((holding) => ['배당주', '리츠', '채권'].includes(holding.category)).length
    let role = '장기 적립 담당'
    let note = '핵심 자산을 꾸준히 적립하는 기본 계좌로 유지하는 편이 좋습니다.'

    if (account.type === 'ISA') {
      role = '절세 담당'
      note = '국내 상장 ETF와 장기 보유 자산을 우선 담아 절세 효율을 높이는 구조가 적합합니다.'
    } else if (account.type === 'PENSION') {
      role = '장기 적립 담당'
      note = '연금저축은 회전보다 장기 적립형 ETF와 채권 비중을 안정적으로 가져가는 편이 좋습니다.'
    } else if (highGrowth > incomeAssets) {
      role = '성장 담당'
      note = '고성장 자산 비중이 높습니다. 변동성이 큰 종목은 이 계좌에서 관리하고 절세 계좌에는 단순 ETF를 두는 편이 좋습니다.'
    } else if (incomeAssets > 0) {
      role = '배당 담당'
      note = '배당형/방어형 자산 비중이 높습니다. 현금흐름 목적 자산을 이 계좌에 모으는 전략이 잘 맞습니다.'
    }

    const priority = account.holdings.some((holding) => Math.abs((holding.targetWeight || 0) - holding.weight) >= 5)
      ? '우선 조정 필요'
      : '유지 가능'

    return {
      accountId: account.id,
      name: account.name,
      type: account.type,
      role,
      priority,
      note,
    }
  })
}

function buildAccountConflicts(accounts) {
  return accounts
    .filter((account) => {
      const hasGrowth = account.holdings.some((holding) => ['성장주', '미국주식'].includes(holding.category))
      const hasIncome = account.holdings.some((holding) => ['배당주', '리츠', '채권'].includes(holding.category))
      return hasGrowth && hasIncome && account.holdings.length >= 3
    })
    .map((account) => ({
      accountId: account.id,
      title: `${account.name} 역할이 섞여 있습니다`,
      description: '성장 자산과 배당·방어 자산이 함께 많아 계좌 목적이 흐려져 있습니다. 실행할 때는 코어 ETF와 장기 적립 자산부터 역할별로 다시 나누는 편이 좋습니다.',
    }))
}

function buildProfileAdjustments(snapshot, recommendation, profile) {
  const profileTone = {
    growth: '성장 자산을 늘리되 개별 종목 편중은 줄이는 쪽이 맞습니다.',
    balanced: '한쪽으로 치우치지 않게 코어 ETF와 방어 자산을 같이 맞추는 편이 좋습니다.',
    income: '현금흐름 자산과 방어 자산을 늘리고 고변동 성장주는 줄이는 편이 맞습니다.',
    aggressive: '공격적 구조를 유지하더라도 코어 자산과 현금 버퍼는 남겨두는 편이 좋습니다.',
    defensive: '낙폭 방어를 위해 채권·금·현금성 자산을 충분히 확보하는 쪽이 맞습니다.',
  }[profile] || '현재 구조를 단순화하고 목표 비중 중심으로 재정리하는 편이 좋습니다.'

  const items = recommendation.majorChanges.slice(0, 4).map((change, index) => ({
    id: `${change.ticker}-${index}`,
    title: `${change.name} ${change.gap > 0 ? '확대' : '축소'}`,
    reason: change.gap > 0
      ? `${change.name} 비중이 목표 대비 ${change.gap.toFixed(1)}%p 부족합니다. ${profileTone}`
      : `${change.name} 비중이 목표 대비 ${Math.abs(change.gap).toFixed(1)}%p 높습니다. ${profileTone}`,
    priority: Math.abs(change.gap) >= 12 ? '높음' : Math.abs(change.gap) >= 7 ? '보통' : '낮음',
  }))

  if (!items.length) {
    return [{
      id: 'maintain',
      title: '현재 구조 유지 가능',
      reason: '현재 포트폴리오가 선택한 성향과 크게 어긋나지 않습니다. 큰 교체보다 소폭 리밸런싱으로 충분합니다.',
      priority: '낮음',
    }]
  }

  return items
}

function compareWithRecommendation(snapshot, recommendation) {
  const current = new Map(snapshot.holdings.map((holding) => [holding.ticker, holding.weight]))
  const changes = recommendation.composition.map((item) => ({
    ...item,
    currentWeight: current.get(item.ticker) || 0,
    gap: item.weight - (current.get(item.ticker) || 0),
  }))

  const majorChanges = changes
    .filter((item) => Math.abs(item.gap) >= 5)
    .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
    .slice(0, 5)

  return {
    ...recommendation,
    majorChanges,
    comparison:
      recommendation.composition.length >= 2
        ? `${recommendation.composition[0].name}와 ${recommendation.composition[1].name} 중심으로 코어를 단순화합니다.`
        : '핵심 자산 중심으로 구조를 다시 단순화합니다.',
    summary: majorChanges.length
      ? `${majorChanges[0].name} ${majorChanges[0].gap > 0 ? '확대' : '축소'}가 가장 큰 변화입니다.`
      : '현재 구조와 유사해 전환 난이도가 낮습니다.',
  }
}


export function buildPlanningWorkspace(snapshot, profile = 'balanced') {
  const recommendations = getRecommendationsForProfile(profile).map((item) => compareWithRecommendation(snapshot, item))
  const diagnosis = buildDiagnosis(snapshot)
  const overlaps = detectOverlap(snapshot.holdings)
  const accountGuides = buildAccountGuides(snapshot.accounts)
  const styleSummary = buildStyleSummary(snapshot)
  const accountConflicts = buildAccountConflicts(snapshot.accounts)
  const selectedRecommendation = recommendations[0] || null
  const portfolioScore = buildPortfolioScore(snapshot, overlaps, accountConflicts)
  const profileAdjustments = selectedRecommendation ? buildProfileAdjustments(snapshot, selectedRecommendation, profile) : []

  return {
    diagnosis,
    overlaps,
    accountGuides,
    accountConflicts,
    recommendations,
    styleSummary,
    portfolioScore,
    profileAdjustments,
  }
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
  const bySector = summarizeBySector(weightedHoldings)
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
    bySector,
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

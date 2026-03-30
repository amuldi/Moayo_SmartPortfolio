// ─── Portfolio Analytics ──────────────────────────────────

import { getAssetInfo } from '../services/mockData.js'

// Weighted average of a metric across holdings
export function weightedAverage(holdings, metric) {
  const totalWeight = holdings.reduce((s, h) => s + h.allocation, 0)
  if (totalWeight === 0) return 0
  return holdings.reduce((s, h) => {
    const info = getAssetInfo(h.ticker)
    return s + (info[metric] || 0) * (h.allocation / totalWeight)
  }, 0)
}

// Portfolio expected return (weighted average of asset returns)
export function calcExpectedReturn(holdings) {
  return weightedAverage(holdings, 'annualReturn')
}

// Portfolio volatility (simplified — no correlation matrix)
export function calcPortfolioVolatility(holdings) {
  // Simplified: weighted average vol (lower bound without correlations)
  return weightedAverage(holdings, 'volatility')
}

// Sharpe ratio (assuming 4% risk-free)
export function calcSharpe(expectedReturn, volatility, riskFree = 4) {
  if (volatility === 0) return 0
  return (expectedReturn - riskFree) / volatility
}

// ─── Gap Analysis ─────────────────────────────────────────
export function computePortfolioGaps(currentHoldings, targetHoldings) {
  const gaps = []

  // Assets in target
  targetHoldings.forEach((target) => {
    const current = currentHoldings.find((h) => h.ticker === target.ticker)
    const currentAlloc = current ? current.allocation : 0
    const gap = target.allocation - currentAlloc

    gaps.push({
      ticker: target.ticker,
      name: target.name,
      assetClass: target.assetClass || 'equity',
      region: target.region,
      currentAlloc,
      targetAlloc: target.allocation,
      gap,
      status: Math.abs(gap) < 1 ? 'on-target'
             : gap > 0          ? 'underweight'
             : 'overweight',
    })
  })

  // Assets in current but NOT in target (to sell)
  currentHoldings.forEach((current) => {
    const inTarget = targetHoldings.find((t) => t.ticker === current.ticker)
    if (!inTarget) {
      gaps.push({
        ticker: current.ticker,
        name: current.name,
        assetClass: current.assetClass || 'equity',
        region: current.region,
        currentAlloc: current.allocation,
        targetAlloc: 0,
        gap: -current.allocation,
        status: 'exit',
      })
    }
  })

  gaps.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
  return gaps
}

// ─── Rebalancing Steps Generator ─────────────────────────
export function generateRebalancingSteps(gaps, totalCapital, accounts) {
  const steps = []

  // Step 1: Buy with new cash first (no sells needed)
  const underweightAssets = gaps.filter((g) => g.status === 'underweight' || g.status === 'new')
  const overweightAssets  = gaps.filter((g) => g.status === 'overweight'  || g.status === 'exit')

  // Sell overweight assets
  overweightAssets.forEach((g) => {
    const sellAmount = Math.abs(g.gap / 100) * totalCapital
    const account = findBestAccount(g.ticker, accounts, 'sell')

    steps.push({
      order: steps.length + 1,
      action: 'SELL',
      ticker: g.ticker,
      name: g.name,
      amount: sellAmount,
      allocationChange: g.gap,
      accountType: account?.type,
      accountName: account?.name,
      reason: g.status === 'exit'
        ? `Remove ${g.name} — not in target portfolio`
        : `Reduce ${g.name} from ${g.currentAlloc.toFixed(1)}% to ${g.targetAlloc.toFixed(1)}%`,
      taxNote: getTaxNote(g, account?.type, 'sell'),
    })
  })

  // Buy underweight assets
  underweightAssets.forEach((g) => {
    const buyAmount = Math.abs(g.gap / 100) * totalCapital
    const account = findBestAccount(g.ticker, accounts, 'buy')

    steps.push({
      order: steps.length + 1,
      action: 'BUY',
      ticker: g.ticker,
      name: g.name,
      amount: buyAmount,
      allocationChange: g.gap,
      accountType: account?.type,
      accountName: account?.name,
      reason: g.currentAlloc === 0
        ? `Add ${g.name} — new target position at ${g.targetAlloc.toFixed(1)}%`
        : `Increase ${g.name} from ${g.currentAlloc.toFixed(1)}% to ${g.targetAlloc.toFixed(1)}%`,
      taxNote: getTaxNote(g, account?.type, 'buy'),
    })
  })

  return steps
}

function findBestAccount(ticker, accounts, action) {
  if (!accounts || accounts.length === 0) return null
  // Find accounts that already hold this asset
  const holdingAccount = accounts.find((a) => a.holdings.some((h) => h.ticker === ticker))
  if (holdingAccount) return holdingAccount
  // Otherwise suggest account with most capital
  return accounts.reduce((best, acc) => acc.totalCapital > (best?.totalCapital || 0) ? acc : best, null)
}

function getTaxNote(gap, accountType, action) {
  if (!accountType) return null
  if (accountType === 'PENSION' || accountType === 'ISA') {
    return action === 'sell' ? '절세 계좌 — 매도 시 과세 없음' : null
  }
  if (accountType === 'BROKERAGE' && action === 'sell') {
    if (gap.region !== '국내') return '주의: 해외 자산 매도 시 22% 양도소득세 과세 가능'
    return '국내 주식 매도: 양도소득세 비과세'
  }
  return null
}

// ─── Allocation Validation ────────────────────────────────
export function validateAllocations(holdings) {
  const total = holdings.reduce((s, h) => s + (h.allocation || 0), 0)
  return {
    total,
    isValid: Math.abs(total - 100) < 0.01,
    remaining: 100 - total,
  }
}

// ─── Asset Class Summary ──────────────────────────────────
// 세분화된 카테고리: ETF / 주식 / 채권 / 리츠 / 금·귀금속 / 원자재 / 현금
export function inferDisplayClass(h) {
  const assetClass = h.assetClass || 'equity'
  const sector = h.sector || ''
  if (assetClass === 'bond') return '채권'
  if (assetClass === 'cash') return '현금'
  if (assetClass === 'commodity') return sector.includes('귀금속') ? '금·귀금속' : '원자재'
  // equity: REIT 여부 먼저 확인
  if (sector.includes('리츠') || sector.includes('인프라')) return '리츠'
  // ETF: 운용보수(expenseRatio)가 있으면 ETF, 없으면 개별주식
  const info = getAssetInfo(h.ticker)
  if (info.expenseRatio > 0) return 'ETF'
  return '주식'
}

export function summarizeByAssetClass(holdings) {
  const map = {}
  holdings.forEach((h) => {
    const cls = inferDisplayClass(h)
    map[cls] = (map[cls] || 0) + h.allocation
  })
  // 비중 큰 순서로 정렬
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function summarizeByRegion(holdings) {
  const map = {}
  holdings.forEach((h) => {
    const region = h.region || 'Unknown'
    map[region] = (map[region] || 0) + h.allocation
  })
  return Object.entries(map).map(([name, value]) => ({ name, value }))
}

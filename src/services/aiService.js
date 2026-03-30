// ─── AI Recommendation Engine (Rule-based, pluggable for real AI) ──
import { getAssetInfo } from './mockData.js'
import { calculateTaxEfficiencyScore } from './taxService.js'

// ─── Concentration Risk Analysis ──────────────────────────
function analyzeConcentration(aggregatedHoldings) {
  const warnings = []

  aggregatedHoldings.forEach((h) => {
    if (h.allocation > 30) {
      warnings.push({
        type: 'concentration',
        severity: 'high',
        asset: h.name,
        message: `${h.name} 비중이 ${h.allocation.toFixed(1)}%로 단일 종목 집중 위험이 높습니다`,
        suggestion: `분산 투자를 위해 최대 20~25% 수준으로 축소를 검토하세요`,
      })
    } else if (h.allocation > 20) {
      warnings.push({
        type: 'concentration',
        severity: 'medium',
        asset: h.name,
        message: `${h.name} 비중이 ${h.allocation.toFixed(1)}%로 집중 임계치에 근접하고 있습니다`,
        suggestion: `25%를 초과할 경우 일부 비중 축소를 고려하세요`,
      })
    }
  })

  return warnings
}

// ─── Regional Diversification Analysis ───────────────────
function analyzeRegionalDiversification(aggregatedHoldings) {
  const insights = []
  const byRegion = {}

  aggregatedHoldings.forEach((h) => {
    if (!byRegion[h.region]) byRegion[h.region] = 0
    byRegion[h.region] += h.allocation
  })

  const koreaAlloc   = byRegion['국내'] || 0
  const usAlloc      = byRegion['미국'] || 0
  const globalAlloc  = byRegion['글로벌'] || 0
  const emAlloc      = (byRegion['신흥국'] || 0) + (byRegion['중국'] || 0) + (byRegion['인도'] || 0)

  if (koreaAlloc > 60) {
    insights.push({
      type: 'diversification',
      severity: 'high',
      message: `국내 비중이 ${koreaAlloc.toFixed(0)}%로 홈바이어스가 높습니다`,
      suggestion: '글로벌 ETF(VT, SPY, QQQ 등)를 연금·ISA 계좌에 분산 편입하는 것을 권장합니다',
    })
  }

  if (usAlloc > 70) {
    insights.push({
      type: 'diversification',
      severity: 'medium',
      message: `미국 비중이 ${usAlloc.toFixed(0)}%로 미국 편중이 심합니다`,
      suggestion: '선진국(VEA) 또는 신흥국(VWO) ETF를 5~10% 추가해 지역 분산을 강화하세요',
    })
  }

  if (emAlloc === 0 && koreaAlloc < 30) {
    insights.push({
      type: 'diversification',
      severity: 'low',
      message: '신흥국 노출이 없습니다',
      suggestion: '신흥국(VWO) 5~10% 편입 시 장기 위험조정수익률 개선에 도움이 됩니다',
    })
  }

  return insights
}

// ─── Asset Class Balance Analysis ────────────────────────
function analyzeAssetClassBalance(aggregatedHoldings) {
  const insights = []
  const byClass = { equity: 0, bond: 0, commodity: 0, cash: 0 }

  aggregatedHoldings.forEach((h) => {
    const cls = h.assetClass || 'equity'
    byClass[cls] = (byClass[cls] || 0) + h.allocation
  })

  const equityPct = byClass.equity || 0
  const bondPct = byClass.bond || 0
  const cashPct = byClass.cash || 0
  const commodityPct = byClass.commodity || 0

  if (bondPct < 10 && equityPct > 80) {
    insights.push({
      type: 'allocation',
      severity: 'medium',
      message: `포트폴리오가 주식 ${equityPct.toFixed(0)}% · 채권 ${bondPct.toFixed(0)}%로 주식 편중이 높습니다`,
      suggestion: '채권(TLT, AGG) 10~20% 편입 시 하락장 변동성을 크게 줄일 수 있습니다',
    })
  }

  if (cashPct > 15) {
    insights.push({
      type: 'allocation',
      severity: 'medium',
      message: `현금 비중이 ${cashPct.toFixed(0)}%로 과도합니다 — 인플레이션 손실 위험`,
      suggestion: '5~10% 이상의 초과 현금은 주식·채권 ETF로 단계적 편입을 권장합니다',
    })
  }

  if (commodityPct === 0) {
    insights.push({
      type: 'allocation',
      severity: 'low',
      message: '원자재·인플레이션 헤지 자산이 없습니다',
      suggestion: '금(GLD/IAU) 5~7.5% 편입 시 인플레이션 방어 및 위기 헤지 효과를 기대할 수 있습니다',
    })
  }

  return insights
}

// ─── Rebalancing Gap Analysis ─────────────────────────────
function analyzeRebalancingNeeds(currentAgg, targetHoldings) {
  const suggestions = []

  if (!targetHoldings || targetHoldings.length === 0) return suggestions

  targetHoldings.forEach((target) => {
    const current = currentAgg.find((h) => h.ticker === target.ticker)
    const currentAlloc = current ? current.allocation : 0
    const gap = target.allocation - currentAlloc

    if (Math.abs(gap) > 5) {
      suggestions.push({
        type: 'rebalance',
        severity: Math.abs(gap) > 15 ? 'high' : 'medium',
        asset: target.name,
        ticker: target.ticker,
        currentAlloc,
        targetAlloc: target.allocation,
        gap,
        message: `${target.name}: 목표 대비 ${gap > 0 ? '부족' : '과다'} ${Math.abs(gap).toFixed(1)}%`,
        suggestion: gap > 0
          ? `${target.name} 추가 매수 — 목표 비중보다 ${gap.toFixed(1)}%p 부족합니다`
          : `${target.name} 일부 매도 — 목표 비중보다 ${Math.abs(gap).toFixed(1)}%p 초과합니다`,
      })
    }
  })

  suggestions.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
  return suggestions
}

// ─── Main AI Analysis Function ────────────────────────────
export function generateAIRecommendations(accounts, targetHoldings) {
  const aggregatedHoldings = []
  const total = accounts.reduce((s, a) => s + a.totalCapital, 0)
  const holdingMap = {}

  accounts.forEach((acc) => {
    acc.holdings.forEach((h) => {
      const value = (h.allocation / 100) * acc.totalCapital
      if (holdingMap[h.ticker]) {
        holdingMap[h.ticker].value += value
        holdingMap[h.ticker].accounts.push(acc.type)
      } else {
        holdingMap[h.ticker] = { ...h, value, accounts: [acc.type] }
      }
    })
  })

  Object.values(holdingMap).forEach((h) => {
    aggregatedHoldings.push({
      ...h,
      allocation: total > 0 ? (h.value / total) * 100 : 0,
    })
  })

  const concentrationWarnings = analyzeConcentration(aggregatedHoldings)
  const diversificationInsights = analyzeRegionalDiversification(aggregatedHoldings)
  const allocationInsights = analyzeAssetClassBalance(aggregatedHoldings)
  const rebalancingNeeds = analyzeRebalancingNeeds(aggregatedHoldings, targetHoldings)
  const taxScore = calculateTaxEfficiencyScore(accounts)

  const allInsights = [
    ...concentrationWarnings,
    ...diversificationInsights,
    ...allocationInsights,
    ...rebalancingNeeds,
  ]

  const highPriority = allInsights.filter((i) => i.severity === 'high')
  const mediumPriority = allInsights.filter((i) => i.severity === 'medium')
  const lowPriority = allInsights.filter((i) => i.severity === 'low')

  // Calculate overall portfolio health score
  let healthScore = 100
  healthScore -= highPriority.length * 15
  healthScore -= mediumPriority.length * 7
  healthScore -= lowPriority.length * 3
  healthScore = Math.max(0, Math.min(100, healthScore))

  return {
    healthScore,
    taxEfficiencyScore: taxScore,
    totalInsights: allInsights.length,
    highPriority,
    mediumPriority,
    lowPriority,
    allInsights,
    summary: generateSummary(healthScore, highPriority.length, taxScore),
    aggregatedHoldings,
  }
}

function generateSummary(healthScore, highCount, taxScore) {
  if (healthScore >= 85) {
    return '포트폴리오가 잘 분산되어 있고 효율적으로 구성되어 있습니다. 소폭의 조정으로 수익률을 더욱 최적화할 수 있습니다.'
  }
  if (healthScore >= 70) {
    return `포트폴리오 상태는 양호하나, ${highCount}개 항목에 주의가 필요합니다. 아래 권장사항을 검토해보세요.`
  }
  if (healthScore >= 50) {
    return `몇 가지 개선을 통해 위험조정수익률과 세금 효율을 크게 높일 수 있습니다. 권장 조치를 확인하세요.`
  }
  return '집중도 또는 분산투자 측면에서 중요한 문제가 있습니다. 체계적인 리밸런싱 계획 수립을 권장합니다.'
}

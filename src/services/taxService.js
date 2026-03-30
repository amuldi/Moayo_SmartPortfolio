// ─── Korean Tax-Aware Asset Location Engine ───────────────
//
// 2024 기준 한국 세법 기반
//
// 계좌 유형별 핵심 세금 특성:
//
// [종합위탁 BROKERAGE]
//   - 국내주식 매매차익: 비과세 (소액주주 기준)
//   - 해외주식 매매차익: 250만원 공제 후 22% 양도소득세
//   - 해외 ETF 매매차익: 15.4% 배당소득세
//   - 배당·이자: 15.4% 원천징수
//   - 금융소득 연 2,000만원 초과 시 종합과세 (금소세)
//
// [ISA]
//   - 편입 가능: 국내 주식, 국내 ETF, 채권, 예금, RP 등 (해외 주식 직접투자 불가)
//   - 순이익 비과세 한도: 200만원 (일반형) / 400만원 (서민·농어민형)
//   - 한도 초과분: 9.9% 분리과세 (종합과세 제외)
//   - 3년 이상 유지 필수 (중도해지 시 세제 혜택 상실)
//   - 만기 후 연금계좌 이전 시 이전금액의 10% 추가 세액공제 (최대 300만원)
//
// [연금저축 PENSION_SAVINGS]
//   - 납입금 세액공제: 연 600만원 한도, 공제율 13.2% (총급여 5,500만원 이하: 16.5%)
//   - 운용 중 과세이연 (매매·배당 모두 비과세)
//   - 연금 수령 시: 연금소득세 3.3~5.5% (55~69세: 5.5%, 70~79세: 4.4%, 80세+: 3.3%)
//   - 중도인출 시: 16.5% 기타소득세 (부득이한 사유 제외)
//
// [IRP (개인형 퇴직연금)]
//   - 세액공제 한도: 연금저축 포함 연 900만원 (공제율 동일)
//   - 위험자산(주식형) 투자 비중: 70% 이하 제한
//   - 중도 인출: 원칙 불가 (법정 사유 시 가능), 인출 시 16.5%
//   - 수령 조건: 55세 이상 + 가입기간 5년 이상
//
// [CMA]
//   - 단기 유동성 계좌 (MMF형, RP형, 발행어음형 등)
//   - 이자소득: 15.4% 원천징수
//   - 주식·ETF 매매 불가 (일부 CMA는 주식 매매 가능하나 일반 위탁 계좌와 동일 과세)
//
// [금현물 GOLD]
//   - KRX 금현물 계좌: 양도소득세 비과세, 부가세 면제
//   - 실물 인출 시에만 부가세(10%) 부과

export const TAX_RATES = {
  BROKERAGE: {
    dividendTax:           0.154,  // 배당·이자 원천징수 (지방소득세 포함)
    foreignCapGainsTax:    0.22,   // 해외주식 양도세 (지방소득세 포함)
    foreignEtfGainsTax:    0.154,  // 해외 ETF 매매차익 → 배당소득세로 과세
    domesticCapGains:      0,      // 국내주식 양도세 비과세 (소액주주)
    comprehensiveTaxThreshold: 20000000, // 금융소득 종합과세 기준
  },
  ISA: {
    separateTax:           0.099,  // 비과세 한도 초과분 분리과세
    exemptionStandard:     2000000, // 일반형 비과세 한도
    exemptionPreferred:    4000000, // 서민·농어민형 비과세 한도
    pensionTransferBonus:  0.10,   // 만기 이전 시 추가 세액공제율 (최대 300만원)
    minHoldingYears:       3,
  },
  PENSION: {
    deductionRateGeneral:  0.132,  // 세액공제율 (총급여 5,500만원 초과)
    deductionRateLow:      0.165,  // 세액공제율 (총급여 5,500만원 이하)
    annualLimitSavings:    6000000, // 연금저축 단독 공제 한도
    annualLimitTotal:      9000000, // IRP 포함 합산 공제 한도
    pensionTaxYoung:       0.055,  // 수령 시 연금소득세 55~69세
    pensionTaxMid:         0.044,  // 수령 시 연금소득세 70~79세
    pensionTaxOld:         0.033,  // 수령 시 연금소득세 80세 이상
    earlyWithdrawalTax:    0.165,  // 중도인출 기타소득세
    irpRiskyAssetLimit:    0.70,   // IRP 위험자산 투자 한도
  },
  GOLD: {
    capitalGainsTax:       0,      // KRX 금현물 양도세 비과세
    vatOnPhysical:         0.10,   // 실물 인출 시 부가세
  },
}

// ─── 계좌 유형별 점수 계산 ────────────────────────────────
// assetClass: 'equity' | 'bond' | 'commodity' | 'cash' | 'reit' | 'etf'
// region: '국내' | '해외' | '미국' | '글로벌' 등
// subType: 'growth' | 'dividend' | 'index' | undefined
function scoreAssetInAccount(asset, accountType) {
  const { assetClass, region } = asset
  const isOverseas = region && region !== '국내'
  let score = 0
  const reasons = []

  // ── 연금 계좌 (연금저축 / IRP) ──────────────────────────
  if (accountType === 'PENSION') {
    if (isOverseas && (assetClass === 'equity' || assetClass === 'etf')) {
      score += 50
      reasons.push(
        '해외 ETF/주식: 운용 중 배당·매매차익 완전 과세이연. ' +
        '수령 시 연금소득세 3.3~5.5%로 일반계좌 대비 최대 12~19%p 절세'
      )
    }
    if (isOverseas && assetClass === 'bond') {
      score += 40
      reasons.push(
        '해외 채권 이자(일반계좌 15.4%)를 연금계좌에서 과세이연 처리. ' +
        '수령 시 연금소득세 3.3~5.5% 적용'
      )
    }
    if (assetClass === 'reit') {
      score += 35
      reasons.push(
        '리츠 배당소득(일반계좌 15.4%)을 과세이연. ' +
        '배당 수익률 높을수록 절세 효과 극대화'
      )
    }
    if (assetClass === 'commodity' && isOverseas) {
      score += 25
      reasons.push('해외 원자재 ETF 매매차익·배당 과세이연')
    }
    if (!isOverseas && assetClass === 'equity') {
      score -= 15
      reasons.push(
        '국내 주식은 종합위탁에서 이미 양도세 비과세 — ' +
        '세액공제 한도(연 600~900만원)를 해외자산에 활용하는 것이 유리'
      )
    }
    if (assetClass === 'cash') {
      score -= 35
      reasons.push(
        '현금 보유는 세액공제 한도와 과세이연 효과를 낭비합니다. ' +
        '연금계좌는 수익률 높은 자산 위주로 채우는 것이 최적'
      )
    }
  }

  // ── ISA ──────────────────────────────────────────────────
  if (accountType === 'ISA') {
    // ISA는 해외 주식 직접투자 불가 — 국내 상장 ETF 형태로만 가능
    if (!isOverseas && assetClass === 'equity') {
      score += 40
      reasons.push(
        '국내 주식 배당금: ISA 비과세 한도 내 완전 비과세 (한도 초과분 9.9%). ' +
        '일반계좌 15.4% 대비 최대 5.5%p 절세'
      )
    }
    if (assetClass === 'etf' || (isOverseas && assetClass === 'equity')) {
      // 해외 ETF는 국내 상장 ETF(한국 거래소 상장) 형태로 ISA 편입 가능
      score += 35
      reasons.push(
        '국내 상장 ETF (해외지수 포함): ISA 비과세 한도 내 매매차익·분배금 비과세. ' +
        '일반계좌 15.4% 배당소득세 대비 절세 효과 우수'
      )
    }
    if (assetClass === 'bond') {
      score += 30
      reasons.push(
        '채권 이자소득: ISA 비과세 한도 내 비과세, 한도 초과분 9.9% 분리과세. ' +
        '일반계좌 15.4% 대비 절세 + 금융소득 종합과세 합산 제외'
      )
    }
    if (assetClass === 'commodity') {
      score += 20
      reasons.push(
        '원자재 ETF 수익: 비과세 한도 내 비과세, 초과분 9.9% 분리과세'
      )
    }
    if (assetClass === 'cash') {
      score -= 15
      reasons.push(
        'ISA 비과세 한도(200~400만원)를 저수익 현금에 배정하는 것은 비효율적입니다'
      )
    }
  }

  // ── 종합위탁 BROKERAGE ────────────────────────────────────
  if (accountType === 'BROKERAGE') {
    if (!isOverseas && assetClass === 'equity') {
      score += 45
      reasons.push(
        '국내 주식 매매차익: 소액주주 양도소득세 비과세 — 일반계좌가 최적'
      )
    }
    if (isOverseas && assetClass === 'equity') {
      score -= 30
      reasons.push(
        '해외 주식: 250만원 공제 후 22% 양도소득세. ' +
        '연금계좌 또는 ISA(국내 상장 ETF 형태) 이전 권장'
      )
    }
    if (assetClass === 'etf' && isOverseas) {
      score -= 25
      reasons.push(
        '해외 ETF 매매차익: 15.4% 배당소득세 부과. ' +
        '금융소득 종합과세(연 2,000만원 초과) 합산 리스크 있음'
      )
    }
    if (assetClass === 'bond') {
      score -= 15
      reasons.push(
        '채권 이자 15.4% 과세 + 금융소득 종합과세 합산. ' +
        'ISA 또는 연금계좌 이전 권장'
      )
    }
    if (assetClass === 'reit') {
      score -= 10
      reasons.push(
        '리츠 배당 15.4% 과세. 금융소득 종합과세 합산 주의'
      )
    }
    if (assetClass === 'commodity') {
      score -= 10
      reasons.push(
        '원자재 ETF 수익 과세. ISA·연금계좌 이전으로 절세 가능'
      )
    }
    if (assetClass === 'cash') {
      score += 10
      reasons.push('현금·CMA: 유동성 확보에 최적. 과세 최소화')
    }
  }

  // ── CMA ──────────────────────────────────────────────────
  if (accountType === 'CMA') {
    if (assetClass === 'cash') {
      score += 50
      reasons.push('CMA는 단기 유동성 자금 운용 전용. 이자 15.4% 과세')
    } else {
      score -= 30
      reasons.push('CMA는 주식·ETF·채권 운용보다 단기 현금 관리에 특화된 계좌')
    }
  }

  // ── 금현물 GOLD ───────────────────────────────────────────
  if (accountType === 'GOLD') {
    if (assetClass === 'commodity') {
      score += 60
      reasons.push(
        'KRX 금현물 계좌: 매매차익 양도세 비과세 + 부가세 면제. ' +
        '금 투자 최적 계좌'
      )
    } else {
      score -= 50
      reasons.push('금현물 계좌는 금 현물 거래 전용입니다')
    }
  }

  return { score, reasons }
}

// ─── 최적 계좌 배치 분석 ─────────────────────────────────
export function analyzeAssetLocation(accounts, targetHoldings) {
  const recommendations = []
  const availableAccountTypes = [...new Set(accounts.map((a) => a.type))]

  targetHoldings.forEach((asset) => {
    const scores = availableAccountTypes.map((type) => ({
      type,
      ...scoreAssetInAccount(asset, type),
    }))

    scores.sort((a, b) => b.score - a.score)
    const best = scores[0]

    const currentLocations = []
    accounts.forEach((acc) => {
      const holding = acc.holdings.find((h) => h.ticker === asset.ticker)
      if (holding) currentLocations.push(acc.type)
    })

    const isOptimal =
      currentLocations.length === 0 || currentLocations.includes(best.type)

    recommendations.push({
      ticker: asset.ticker,
      name: asset.name,
      assetClass: asset.assetClass,
      region: asset.region,
      optimalAccount: best.type,
      score: best.score,
      reasons: best.reasons,
      currentLocations,
      isOptimal,
      allScores: scores,
    })
  })

  return recommendations
}

// ─── 매도 시 예상 세금 계산 ───────────────────────────────
export function estimateTaxCost(sellAction, accountType) {
  const { gain = 0, assetClass, region } = sellAction
  const isOverseas = region && region !== '국내'

  // 연금 계좌: 운용 중 비과세 (수령 시 연금소득세)
  if (accountType === 'PENSION') {
    return {
      taxAmount: 0,
      rate: 0,
      note: '연금계좌 내 매도: 과세 없음. 수령 시 연금소득세 3.3~5.5% 적용',
    }
  }

  // ISA: 비과세 한도 내 비과세, 초과분 9.9%
  if (accountType === 'ISA') {
    const taxableGain = Math.max(0, gain - TAX_RATES.ISA.exemptionStandard)
    return {
      taxAmount: taxableGain * TAX_RATES.ISA.separateTax,
      rate: taxableGain > 0 ? TAX_RATES.ISA.separateTax : 0,
      note: `ISA: 200만원 비과세 한도 초과분 ${(TAX_RATES.ISA.separateTax * 100).toFixed(1)}% 분리과세. 종합과세 합산 제외`,
    }
  }

  if (accountType === 'BROKERAGE') {
    // 국내 주식: 양도세 비과세
    if (!isOverseas && assetClass === 'equity') {
      return {
        taxAmount: 0,
        rate: 0,
        note: '국내 주식 매매차익: 소액주주 기준 양도소득세 비과세',
      }
    }
    // 해외 주식: 250만원 공제 후 22%
    if (isOverseas && assetClass === 'equity') {
      const taxableGain = Math.max(0, gain - 2500000)
      return {
        taxAmount: taxableGain * TAX_RATES.BROKERAGE.foreignCapGainsTax,
        rate: TAX_RATES.BROKERAGE.foreignCapGainsTax,
        note: `해외 주식: 250만원 공제 후 22% 양도소득세 (${(taxableGain / 10000).toFixed(0)}만원 과세)`,
      }
    }
    // 해외 ETF / 국내 ETF (주식형 제외): 15.4% 배당소득세
    if (assetClass === 'etf' || assetClass === 'reit') {
      return {
        taxAmount: Math.max(0, gain) * TAX_RATES.BROKERAGE.foreignEtfGainsTax,
        rate: TAX_RATES.BROKERAGE.foreignEtfGainsTax,
        note: 'ETF/리츠 수익: 15.4% 배당소득세. 연 2,000만원 초과 시 종합과세 합산',
      }
    }
    // 채권·이자
    if (assetClass === 'bond') {
      return {
        taxAmount: Math.max(0, gain) * TAX_RATES.BROKERAGE.interestTax,
        rate: TAX_RATES.BROKERAGE.interestTax,
        note: '채권 이자소득: 15.4% 원천징수. 연 2,000만원 초과 시 종합과세',
      }
    }
  }

  return { taxAmount: 0, rate: 0, note: '해당 계좌 유형의 세금 규정 없음' }
}

// ─── 포트폴리오 세금 효율 점수 ───────────────────────────
export function calculateTaxEfficiencyScore(accounts) {
  let totalScore = 0
  let totalWeight = 0

  accounts.forEach((acc) => {
    acc.holdings.forEach((holding) => {
      const assetInfo = { assetClass: holding.assetClass, region: holding.region }
      const { score } = scoreAssetInAccount(assetInfo, acc.type)
      const weight = holding.allocation
      totalScore += score * weight
      totalWeight += weight
    })
  })

  const rawScore = totalWeight > 0 ? totalScore / totalWeight : 0
  // 정규화: 0~100 점수로 변환
  return Math.min(100, Math.max(0, 50 + rawScore * 1.2))
}

// ─── 세금 최적화 실행 단계 생성 ──────────────────────────
export function generateTaxOptimizationSteps(accounts, targetHoldings) {
  const recommendations = analyzeAssetLocation(accounts, targetHoldings)
  const steps = []

  // 계좌 이동 권장
  recommendations
    .filter((r) => !r.isOptimal && r.currentLocations.length > 0)
    .forEach((r) => {
      const currentType = r.currentLocations[0]
      const targetType = r.optimalAccount

      steps.push({
        priority: r.score > 35 ? 'high' : r.score > 15 ? 'medium' : 'low',
        type: 'relocate',
        asset: r.name,
        ticker: r.ticker,
        from: currentType,
        to: targetType,
        reason: r.reasons[0] || '세금 효율 개선',
        taxSaving: estimateTaxSaving(r.assetClass, r.region, currentType, targetType),
      })
    })

  // 신규 매수 시 최적 계좌 안내
  recommendations
    .filter((r) => r.currentLocations.length === 0)
    .forEach((r) => {
      steps.push({
        priority: 'medium',
        type: 'buy',
        asset: r.name,
        ticker: r.ticker,
        from: null,
        to: r.optimalAccount,
        reason: `${r.optimalAccount} 계좌에서 매수 권장: ${r.reasons[0] || ''}`,
        taxSaving: null,
      })
    })

  steps.sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 }
    return p[a.priority] - p[b.priority]
  })

  return steps
}

function estimateTaxSaving(assetClass, region, fromAccount, toAccount) {
  const isOverseas = region && region !== '국내'

  if (fromAccount === 'BROKERAGE') {
    if (toAccount === 'PENSION') {
      if (isOverseas && (assetClass === 'equity' || assetClass === 'etf')) {
        return '배당·매매차익 과세이연, 수령 시 연금소득세 3.3~5.5% (최대 19%p 절세)'
      }
      if (assetClass === 'reit') {
        return '리츠 배당 과세이연 (15.4% → 3.3~5.5%)'
      }
      if (assetClass === 'bond') {
        return '이자소득 과세이연 (15.4% → 3.3~5.5%)'
      }
    }
    if (toAccount === 'ISA') {
      if (!isOverseas && assetClass === 'equity') {
        return '배당소득세 절감 (15.4% → 0% 한도 내 / 초과분 9.9%)'
      }
      if (assetClass === 'etf' || assetClass === 'bond') {
        return '15.4% → 비과세 한도 내 0% / 초과분 9.9% + 종합과세 합산 제외'
      }
    }
  }
  if (fromAccount === 'BROKERAGE' || fromAccount === 'ISA') {
    if (toAccount === 'GOLD' && assetClass === 'commodity') {
      return '금 매매차익 양도세 비과세 + 부가세 면제'
    }
  }
  return '절세 규모는 수익·세율 구간에 따라 달라집니다'
}

import { getAssetInfo } from './mockData.js'

// ─── Historical Monthly Returns (2015–2024) ───────────────
// Realistic approximations based on actual index performance
const HISTORICAL_MONTHLY_RETURNS = {
  // Equity
  SPY:  [ 0.031,-0.031, 0.013,-0.023, 0.012, 0.013,-0.019, 0.021, 0.015, 0.019,-0.018, 0.037,
          0.018, 0.024,-0.013, 0.014, 0.002, 0.019, 0.021,-0.049, 0.032, 0.023,-0.013, 0.021,
         -0.042,-0.085, 0.125,-0.023,-0.078, 0.022,-0.007, 0.071, 0.088,-0.004, 0.108, 0.005,
          0.011, 0.021,-0.012, 0.091, 0.047, 0.003,-0.021, 0.035, 0.062,-0.006,-0.002, 0.038,
         -0.038,-0.030,-0.112,-0.079,-0.034, 0.048, 0.104,-0.043,-0.097,-0.074, 0.076, 0.054,
          0.068, 0.037,-0.012, 0.049, 0.011, 0.031, 0.033, 0.023,-0.019, 0.057, 0.048, 0.012 ],
  QQQ:  [ 0.041,-0.018, 0.022,-0.011, 0.018, 0.021,-0.009, 0.031, 0.024, 0.034,-0.011, 0.052,
          0.032, 0.039,-0.019, 0.021, 0.011, 0.032, 0.041,-0.072, 0.049, 0.041,-0.021, 0.031,
         -0.021,-0.113, 0.162,-0.018,-0.094, 0.037,-0.009, 0.089, 0.107, 0.006, 0.131, 0.011,
          0.023, 0.034,-0.017, 0.112, 0.058, 0.007,-0.028, 0.048, 0.079,-0.008,-0.004, 0.051,
         -0.087,-0.071,-0.187,-0.131,-0.037, 0.087, 0.204,-0.078,-0.181,-0.109, 0.141, 0.079,
          0.118, 0.071,-0.009, 0.079, 0.027, 0.042, 0.061, 0.033,-0.024, 0.068, 0.067, 0.019 ],
  TLT:  [ 0.021, 0.011,-0.018, 0.023, 0.012,-0.009,-0.012, 0.018, 0.021,-0.014, 0.011, 0.014,
          0.018,-0.009, 0.012, 0.021,-0.015, 0.008, 0.017,-0.021, 0.019, 0.015,-0.018, 0.012,
          0.062, 0.072,-0.028, 0.034,-0.042, 0.037,-0.027, 0.044, 0.011, 0.009,-0.041, 0.021,
         -0.024,-0.012, 0.031,-0.019, 0.018,-0.028, 0.024,-0.041, 0.038,-0.022, 0.017,-0.019,
         -0.053,-0.042,-0.078,-0.091,-0.049,-0.031,-0.024,-0.019,-0.092,-0.062,-0.071,-0.057,
         -0.024,-0.018, 0.033, 0.021, 0.019,-0.014, 0.011, 0.021,-0.028, 0.031, 0.024, 0.009 ],
  GLD:  [ 0.014,-0.024, 0.021,-0.015, 0.008,-0.011, 0.018, 0.024,-0.018, 0.026, 0.011,-0.021,
          0.009, 0.014,-0.024, 0.021, 0.031,-0.018, 0.024, 0.024,-0.024, 0.018, 0.009, 0.021,
          0.031, 0.044,-0.021, 0.024,-0.041, 0.034,-0.028, 0.038, 0.028, 0.024,-0.018, 0.031,
         -0.018, 0.022,-0.014, 0.031, 0.012,-0.018, 0.024, 0.038,-0.018, 0.011, 0.031, 0.018,
          0.021, 0.018,-0.031, 0.031, 0.021, 0.011, 0.014, 0.038, 0.018,-0.024, 0.028, 0.031,
          0.011,-0.014, 0.024, 0.021,-0.011, 0.018, 0.031,-0.018, 0.028, 0.041, 0.021, 0.011 ],
  VEA:  [ 0.018,-0.024, 0.008,-0.018, 0.011, 0.021,-0.024, 0.018, 0.014, 0.021,-0.021, 0.024,
          0.014, 0.021,-0.014, 0.018, 0.008, 0.024, 0.018,-0.042, 0.024, 0.018,-0.014, 0.018,
         -0.038,-0.071, 0.098,-0.018,-0.071, 0.018,-0.011, 0.048, 0.061, 0.001, 0.071,-0.001,
          0.008, 0.018,-0.018, 0.061, 0.028, 0.001,-0.018, 0.021, 0.041,-0.008,-0.001, 0.021,
         -0.048,-0.038,-0.091,-0.071,-0.024, 0.038, 0.081,-0.041,-0.088,-0.064, 0.054, 0.041,
          0.051, 0.028,-0.018, 0.038, 0.008, 0.021, 0.024, 0.018,-0.021, 0.041, 0.031, 0.008 ],
  AGG:  [ 0.008, 0.006,-0.008, 0.011, 0.004,-0.004,-0.006, 0.009, 0.011,-0.006, 0.004, 0.008,
          0.009,-0.004, 0.006, 0.011,-0.008, 0.004, 0.009,-0.011, 0.011, 0.008,-0.009, 0.006,
          0.021, 0.031,-0.014, 0.018,-0.021, 0.018,-0.014, 0.021, 0.006, 0.004,-0.018, 0.011,
         -0.011,-0.006, 0.014,-0.009, 0.009,-0.014, 0.011,-0.021, 0.018,-0.011, 0.008,-0.009,
         -0.024,-0.018,-0.038,-0.044,-0.024,-0.014,-0.011,-0.009,-0.044,-0.028,-0.034,-0.026,
         -0.011,-0.008, 0.016, 0.011, 0.009,-0.007, 0.006, 0.011,-0.014, 0.016, 0.011, 0.004 ],
  TIGER200: [0.021,-0.031,0.014,-0.028,0.011,0.018,-0.024,0.021,0.014,0.018,-0.028,0.031,
             0.018,0.024,-0.018,0.021,0.008,0.024,0.018,-0.048,0.028,0.021,-0.018,0.024,
             -0.041,-0.081,0.108,-0.021,-0.078,0.024,-0.009,0.051,0.071,0.001,0.078,-0.001,
             0.009,0.021,-0.021,0.071,0.031,0.001,-0.021,0.024,0.048,-0.009,-0.001,0.024,
             -0.051,-0.041,-0.098,-0.078,-0.028,0.041,0.088,-0.048,-0.094,-0.068,0.058,0.044,
             0.054,0.031,-0.021,0.041,0.009,0.024,0.028,0.021,-0.024,0.044,0.034,0.009],
}

// Fallback generator for assets without explicit history
function generateMonthlyReturns(annualReturn, volatility, count, seedOffset = 0) {
  const monthlyReturn = annualReturn / 100 / 12
  const monthlyVol = volatility / 100 / Math.sqrt(12)
  const returns = []
  let seed = ((annualReturn * 10000 + volatility * 100 + seedOffset) >>> 0) || 1
  for (let i = 0; i < count; i++) {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff
    const u1 = Math.max((seed >>> 0) / 0xffffffff, 1e-10)
    seed = (seed * 1664525 + 1013904223) & 0xffffffff
    const u2 = (seed >>> 0) / 0xffffffff
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    returns.push(monthlyReturn + z * monthlyVol)
  }
  return returns
}

function getMonthlyReturns(ticker) {
  if (HISTORICAL_MONTHLY_RETURNS[ticker]) return HISTORICAL_MONTHLY_RETURNS[ticker]
  const asset = getAssetInfo(ticker)
  return generateMonthlyReturns(asset.annualReturn, asset.volatility, 72)
}

// ─── Core Backtest Engine ─────────────────────────────────
export function runBacktest(holdings, startDate, endDate, initialCapital = 100) {
  const months = 72 // 72개월(6년) 백테스트

  // Get return series for each asset
  const assetReturns = holdings.map((h) => ({
    ticker: h.ticker,
    weight: h.allocation / 100,
    returns: getMonthlyReturns(h.ticker).slice(-months),
  }))

  // Calculate portfolio monthly returns
  const portfolioReturns = []
  const len = Math.min(...assetReturns.map((a) => a.returns.length))

  for (let i = 0; i < len; i++) {
    let ret = 0
    assetReturns.forEach((a) => {
      ret += a.weight * (a.returns[i] || 0)
    })
    portfolioReturns.push(ret)
  }

  // Build equity curve
  const now = new Date()
  const equityCurve = [{ date: '', value: initialCapital, month: 'Start' }]
  let value = initialCapital
  let peak = initialCapital
  let maxDrawdown = 0

  for (let i = 0; i < portfolioReturns.length; i++) {
    value = value * (1 + portfolioReturns[i])
    if (value > peak) peak = value
    const drawdown = (peak - value) / peak
    if (drawdown > maxDrawdown) maxDrawdown = drawdown

    const d = new Date(now.getFullYear(), now.getMonth() - portfolioReturns.length + i, 1)
    equityCurve.push({
      date: d.toISOString().slice(0, 7),
      value: parseFloat(value.toFixed(2)),
      month: d.toLocaleString('en', { month: 'short', year: '2-digit' }),
      return: portfolioReturns[i],
    })
  }

  // Calculate stats
  const totalReturn = (value - initialCapital) / initialCapital
  const years = len / 12
  const cagr = Math.pow(1 + totalReturn, 1 / Math.max(years, 0.1)) - 1

  const mean = portfolioReturns.reduce((a, b) => a + b, 0) / portfolioReturns.length
  const variance = portfolioReturns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / portfolioReturns.length
  const monthlyVol = Math.sqrt(variance)
  const annualVol = monthlyVol * Math.sqrt(12)

  const riskFreeMonthly = 0.04 / 12 // 4% annual risk-free
  const excessReturns = portfolioReturns.map((r) => r - riskFreeMonthly)
  const excessMean = excessReturns.reduce((a, b) => a + b, 0) / excessReturns.length
  const sharpe = annualVol > 0 ? (excessMean * 12) / annualVol : 0

  // Monthly win rate
  const positiveMonths = portfolioReturns.filter((r) => r > 0).length
  const winRate = positiveMonths / portfolioReturns.length

  // Best/worst months
  const sortedReturns = [...portfolioReturns].sort((a, b) => a - b)
  const bestMonth = sortedReturns[sortedReturns.length - 1]
  const worstMonth = sortedReturns[0]

  return {
    equityCurve,
    stats: {
      totalReturn: totalReturn * 100,
      cagr: cagr * 100,
      annualVol: annualVol * 100,
      sharpe: parseFloat(sharpe.toFixed(2)),
      maxDrawdown: maxDrawdown * 100,
      winRate: winRate * 100,
      bestMonth: bestMonth * 100,
      worstMonth: worstMonth * 100,
      monthCount: len,
    },
    monthlyReturns: portfolioReturns.map((r, i) => ({
      month: equityCurve[i + 1]?.month || '',
      return: r * 100,
    })),
  }
}

// ─── Run benchmark backtests for comparison ───────────────
export function runBenchmarkBacktest(benchmark) {
  return runBacktest(benchmark.composition, null, null, 100)
}

// ─── Future Projection (deterministic Monte Carlo) ────────
export function runFutureProjection(holdings, years, initialCapital = 10000000) {
  const months = years * 12

  // Generate future returns with a distinct seed offset per holding index
  const assetReturns = holdings.map((h, idx) => {
    const asset = getAssetInfo(h.ticker)
    const seedOffset = 999983 + idx * 7919 // prime offsets for distinct sequences
    return {
      weight: h.allocation / 100,
      returns: generateMonthlyReturns(asset.annualReturn, asset.volatility, months, seedOffset),
    }
  })

  // Monthly portfolio returns
  const portfolioReturns = []
  for (let i = 0; i < months; i++) {
    let ret = 0
    assetReturns.forEach((a) => { ret += a.weight * (a.returns[i] || 0) })
    portfolioReturns.push(ret)
  }

  // Build equity curve (monthly points)
  const now = new Date()
  const equityCurve = [{ value: initialCapital, normalized: 100, month: '현재', year: 0 }]
  let value = initialCapital
  let normalized = 100
  let peak = 100
  let maxDrawdown = 0

  for (let i = 0; i < portfolioReturns.length; i++) {
    value *= (1 + portfolioReturns[i])
    normalized *= (1 + portfolioReturns[i])
    if (normalized > peak) peak = normalized
    const dd = (peak - normalized) / peak
    if (dd > maxDrawdown) maxDrawdown = dd

    const d = new Date(now.getFullYear(), now.getMonth() + i + 1, 1)
    const yearLabel = `${d.getFullYear()}년`
    const monthLabel = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`
    equityCurve.push({
      value: Math.round(value),
      normalized: parseFloat(normalized.toFixed(2)),
      month: monthLabel,
      yearLabel,
      year: Math.floor((i + 1) / 12),
    })
  }

  const totalReturn = (value - initialCapital) / initialCapital
  const cagr = Math.pow(value / initialCapital, 1 / Math.max(years, 0.1)) - 1
  const mean = portfolioReturns.reduce((a, b) => a + b, 0) / portfolioReturns.length
  const variance = portfolioReturns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / portfolioReturns.length
  const annualVol = Math.sqrt(variance * 12)
  const excessMean = mean - 0.04 / 12
  const sharpe = annualVol > 0 ? (excessMean * 12) / annualVol : 0
  const winRate = portfolioReturns.filter((r) => r > 0).length / portfolioReturns.length

  return {
    equityCurve,
    stats: {
      initialCapital,
      finalValue: Math.round(value),
      profit: Math.round(value - initialCapital),
      totalReturn: totalReturn * 100,
      cagr: cagr * 100,
      annualVol: annualVol * 100,
      sharpe: parseFloat(sharpe.toFixed(2)),
      maxDrawdown: maxDrawdown * 100,
      winRate: winRate * 100,
      years,
    },
  }
}

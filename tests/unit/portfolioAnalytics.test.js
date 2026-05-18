import { describe, expect, it } from 'vitest'
import { buildPortfolioSnapshot } from '../../src/features/portfolio/analytics.js'

describe('portfolio analytics', () => {
  it('calculates KRW value with live FX rates', () => {
    const snapshot = buildPortfolioSnapshot(
      [{
        id: 'a1',
        name: '종합계좌',
        type: 'BROKERAGE',
        totalCapital: 0,
        holdings: [{
          id: 'h1',
          ticker: 'SPY',
          name: 'SPY',
          quantity: 2,
          avgPrice: 400,
          currency: 'USD',
          targetWeight: 50,
        }],
      }],
      { SPY: { price: 500, changePct: 0, currency: 'USD' } },
      { KRW: 1, USD: 1300 }
    )

    expect(snapshot.totalValueKRW).toBe(1_300_000)
    expect(snapshot.totalInvestedKRW).toBe(1_040_000)
    expect(snapshot.totalReturnPct).toBeCloseTo(25, 2)
  })

  it('builds target-weight rebalancing reference amounts', () => {
    const snapshot = buildPortfolioSnapshot(
      [{
        id: 'a1',
        name: 'ISA',
        type: 'ISA',
        totalCapital: 0,
        holdings: [
          { id: 'h1', ticker: '005930', name: '삼성전자', quantity: 10, avgPrice: 70000, currency: 'KRW', targetWeight: 30 },
          { id: 'h2', ticker: '069500', name: 'KODEX 200', quantity: 10, avgPrice: 30000, currency: 'KRW', targetWeight: 70 },
        ],
      }],
      {
        '005930': { price: 70000, changePct: 0, currency: 'KRW' },
        '069500': { price: 30000, changePct: 0, currency: 'KRW' },
      }
    )

    const kodex = snapshot.rebalancingSuggestions.find((item) => item.ticker === '069500')
    expect(kodex.action).toBe('비중 확대 검토')
    expect(kodex.amount).toBeCloseTo(400000, 0)
  })
})

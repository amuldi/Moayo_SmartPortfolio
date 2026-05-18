import { describe, expect, it } from 'vitest'
import { validatePortfolioBody, validateRegisterBody, validateTickersBody } from '../../server/validation.js'

describe('server validation', () => {
  it('rejects weak registration input', () => {
    expect(validateRegisterBody({ username: '', email: 'bad', password: 'short' }).error).toBeTruthy()
  })

  it('sanitizes portfolio payloads', () => {
    const parsed = validatePortfolioBody({
      accounts: [{
        id: 'a1',
        name: 'ISA',
        type: 'ISA',
        totalCapital: 1000000,
        holdings: [{
          id: 'h1',
          ticker: '005930',
          name: '삼성전자',
          quantity: 1,
          avgPrice: 70000,
          targetWeight: 25,
        }],
      }],
    })

    expect(parsed.error).toBeUndefined()
    expect(parsed.values.accounts[0].holdings[0].ticker).toBe('005930')
  })

  it('deduplicates ticker batch requests', () => {
    const parsed = validateTickersBody({ tickers: ['spy', 'SPY', '005930'] })
    expect(parsed.values.tickers).toEqual(['SPY', '005930'])
  })
})

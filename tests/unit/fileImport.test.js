import { describe, expect, it } from 'vitest'
import { parsePortfolioText } from '../../src/features/portfolio/fileImport.js'

describe('portfolio file import', () => {
  it('imports Korean CSV columns into account and holding data', () => {
    const csv = [
      '계좌명,계좌유형,자산총액,종목코드,종목명,보유수량,평균단가,통화,카테고리,목표비중',
      '종합계좌,종합위탁,1000000,005930,삼성전자,10,70000,KRW,국내주식,40',
    ].join('\n')

    const portfolio = parsePortfolioText(csv, 'sample.csv')

    expect(portfolio.accounts).toHaveLength(1)
    expect(portfolio.accounts[0].type).toBe('BROKERAGE')
    expect(portfolio.accounts[0].holdings[0]).toMatchObject({
      ticker: '005930',
      name: '삼성전자',
      quantity: 10,
      avgPrice: 70000,
      targetWeight: 40,
    })
  })
})

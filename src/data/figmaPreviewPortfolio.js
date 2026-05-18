export const FIGMA_PREVIEW_PORTFOLIO = {
  id: 'figma-preview',
  name: '한국 성장·배당 혼합 포트폴리오',
  watchlist: [
    { ticker: '005930', name: '삼성전자', addedAt: 1760000000000 },
    { ticker: '105560', name: 'KB금융', addedAt: 1760000000000 },
    { ticker: '360750', name: 'TIGER 미국S&P500', addedAt: 1760000000000 },
  ],
  recentTickers: ['005930', '000660', '360750', '459580', '130680', '088980'],
  accounts: [
    {
      id: 'preview-isa',
      name: 'ISA 절세계좌',
      type: 'ISA',
      totalCapital: 48000000,
      memo: '국내상장 ETF와 배당 자산 중심',
      holdings: [
        { id: 'isa-01', ticker: '360750', quantity: 620, avgPrice: 18400, targetWeight: 26, memo: '장기 코어 ETF' },
        { id: 'isa-02', ticker: '459580', quantity: 720, avgPrice: 13200, targetWeight: 16, memo: '배당 방어축' },
        { id: 'isa-03', ticker: '130680', quantity: 160, avgPrice: 103500, targetWeight: 12, memo: '단기채 완충' },
      ],
    },
    {
      id: 'preview-brokerage',
      name: '국내 주식 종합계좌',
      type: 'BROKERAGE',
      totalCapital: 84000000,
      memo: '국내 대형주와 금융주 위성 전략',
      holdings: [
        { id: 'br-01', ticker: '005930', quantity: 280, avgPrice: 53500, targetWeight: 15, memo: '반도체 대표주' },
        { id: 'br-02', ticker: '000660', quantity: 86, avgPrice: 174000, targetWeight: 13, memo: 'AI 메모리 노출' },
        { id: 'br-03', ticker: '105560', quantity: 180, avgPrice: 82000, targetWeight: 10, memo: '고배당 금융주' },
        { id: 'br-04', ticker: '088980', quantity: 980, avgPrice: 13250, targetWeight: 8, memo: '인프라 배당' },
      ],
    },
    {
      id: 'preview-pension',
      name: '연금저축 장기계좌',
      type: 'PENSION',
      totalCapital: 56000000,
      memo: '장기 복리형 글로벌 분산',
      holdings: [
        { id: 'pn-01', ticker: '133690', quantity: 190, avgPrice: 108000, targetWeight: 18, memo: '미국 성장주' },
        { id: 'pn-02', ticker: '305080', quantity: 1250, avgPrice: 8900, targetWeight: 10, memo: '미국채 헤지' },
        { id: 'pn-03', ticker: '411060', quantity: 540, avgPrice: 16800, targetWeight: 6, memo: '금 현물 분산' },
      ],
    },
  ],
}

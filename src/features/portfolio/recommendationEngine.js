import { getAssetInfo } from '../../services/mockData.js'

export const INVESTOR_PROFILES = [
  { value: 'growth', label: '성장형', desc: '장기 성장 자산 비중을 높이고 싶음' },
  { value: 'balanced', label: '균형형', desc: '성장과 방어의 균형을 원함' },
  { value: 'income', label: '배당형', desc: '현금흐름과 안정성을 우선함' },
  { value: 'aggressive', label: '공격형', desc: '변동성을 감수하고 수익 추구' },
  { value: 'defensive', label: '안정형', desc: '낙폭 방어와 분산을 더 중시' },
]

const MODEL_PORTFOLIOS = {
  growth: [
    {
      id: 'growth_core',
      name: '성장 집중 코어',
      tags: ['성장형', '미국 중심', 'ETF+핵심주'],
      risk: '중상',
      rebalanceDifficulty: '보통',
      forUser: '미국 성장주와 ETF를 장기 적립하고 싶은 사용자',
      rationale: '현재 포트폴리오의 개별 종목 편중을 줄이고 성장 자산을 ETF 중심으로 압축합니다.',
      composition: [
        { ticker: 'QQQ', weight: 30 },
        { ticker: 'VUG', weight: 20 },
        { ticker: 'SPY', weight: 20 },
        { ticker: 'NVDA', weight: 10 },
        { ticker: 'MSFT', weight: 10 },
        { ticker: 'CASH', weight: 10 },
      ],
    },
    {
      id: 'growth_krus',
      name: '한미 성장 혼합',
      tags: ['성장형', '국내+미국', '분산형'],
      risk: '중',
      rebalanceDifficulty: '낮음',
      forUser: '국내 계좌를 유지하면서 미국 성장 비중도 가져가고 싶은 사용자',
      rationale: '국내 핵심주와 미국 ETF를 함께 두어 환율과 지역 편중을 완화합니다.',
      composition: [
        { ticker: '005930', weight: 15 },
        { ticker: '000660', weight: 10 },
        { ticker: '360750', weight: 20 },
        { ticker: 'QQQ', weight: 20 },
        { ticker: 'VTI', weight: 15 },
        { ticker: 'CASH', weight: 20 },
      ],
    },
  ],
  balanced: [
    {
      id: 'balanced_global',
      name: '글로벌 균형 배분',
      tags: ['균형형', '글로벌 ETF', '장기 적립'],
      risk: '중',
      rebalanceDifficulty: '낮음',
      forUser: '단순하고 유지하기 쉬운 구조를 원하는 사용자',
      rationale: '지역/스타일/방어 자산을 섞어 변동성을 완화합니다.',
      composition: [
        { ticker: 'VT', weight: 35 },
        { ticker: 'SPY', weight: 15 },
        { ticker: 'VEA', weight: 10 },
        { ticker: 'TLT', weight: 20 },
        { ticker: 'GLD', weight: 10 },
        { ticker: 'CASH', weight: 10 },
      ],
    },
    {
      id: 'balanced_isa',
      name: 'ISA 친화 균형형',
      tags: ['균형형', 'ISA 활용', '국내상장 ETF'],
      risk: '중하',
      rebalanceDifficulty: '낮음',
      forUser: '절세계좌 중심으로 단순하게 운용하고 싶은 사용자',
      rationale: '국내 상장 ETF 위주로 구성해 ISA와 연금계좌에서 유지하기 쉽습니다.',
      composition: [
        { ticker: '360750', weight: 25 },
        { ticker: '069500', weight: 20 },
        { ticker: '114460', weight: 15 },
        { ticker: '132030', weight: 15 },
        { ticker: '305080', weight: 10 },
        { ticker: 'CASH', weight: 15 },
      ],
    },
  ],
  income: [
    {
      id: 'income_dividend',
      name: '배당 현금흐름형',
      tags: ['배당형', '현금흐름', '방어형'],
      risk: '중하',
      rebalanceDifficulty: '보통',
      forUser: '분기·월배당 기반 현금흐름을 선호하는 사용자',
      rationale: '배당 ETF와 리츠 비중을 높여 수익률보다 현금흐름 안정성을 우선합니다.',
      composition: [
        { ticker: 'SCHD', weight: 25 },
        { ticker: 'JEPI', weight: 20 },
        { ticker: 'O', weight: 10 },
        { ticker: '280930', weight: 15 },
        { ticker: 'TLT', weight: 15 },
        { ticker: 'CASH', weight: 15 },
      ],
    },
    {
      id: 'income_pension',
      name: '연금 적립 배당형',
      tags: ['배당형', '연금형', '장기 적립'],
      risk: '중하',
      rebalanceDifficulty: '낮음',
      forUser: '연금저축/IRP에서 장기 적립과 재투자를 병행하려는 사용자',
      rationale: '연금계좌에서 유지하기 쉬운 배당·채권 혼합 구조로 변동성을 낮춥니다.',
      composition: [
        { ticker: 'SCHD', weight: 20 },
        { ticker: 'VYM', weight: 20 },
        { ticker: 'TLT', weight: 25 },
        { ticker: 'AGG', weight: 15 },
        { ticker: 'GLD', weight: 10 },
        { ticker: 'CASH', weight: 10 },
      ],
    },
  ],
  aggressive: [
    {
      id: 'aggressive_ai',
      name: '공격형 AI 모멘텀',
      tags: ['공격형', 'AI', '고변동'],
      risk: '상',
      rebalanceDifficulty: '상',
      forUser: '고성장 업종에 집중하고 주기적 점검이 가능한 사용자',
      rationale: '반도체와 AI 종목 중심으로 압축하되, 현금 버퍼를 최소한 유지합니다.',
      composition: [
        { ticker: 'NVDA', weight: 20 },
        { ticker: 'TSM', weight: 15 },
        { ticker: 'AVGO', weight: 15 },
        { ticker: 'SOXX', weight: 20 },
        { ticker: 'QQQ', weight: 20 },
        { ticker: 'CASH', weight: 10 },
      ],
    },
    {
      id: 'aggressive_tactical',
      name: '공격형 전술 배분',
      tags: ['공격형', '테마', '단계 전환 추천'],
      risk: '상',
      rebalanceDifficulty: '상',
      forUser: '시장 상황에 따라 리밸런싱을 자주 할 수 있는 사용자',
      rationale: '집중 종목과 테마 ETF를 함께 두되, 한 번에 바꾸기보다 단계 전환을 전제로 합니다.',
      composition: [
        { ticker: 'QQQ', weight: 25 },
        { ticker: 'SOXL', weight: 10 },
        { ticker: 'PLTR', weight: 10 },
        { ticker: 'IONQ', weight: 10 },
        { ticker: 'VUG', weight: 25 },
        { ticker: 'CASH', weight: 20 },
      ],
    },
  ],
  defensive: [
    {
      id: 'defensive_allweather',
      name: '방어형 올웨더',
      tags: ['안정형', '방어형', '분산'],
      risk: '중하',
      rebalanceDifficulty: '낮음',
      forUser: '낙폭을 줄이고 장기 보유 스트레스를 낮추고 싶은 사용자',
      rationale: '주식과 채권, 금, 현금을 고르게 배분해 급락 구간 대응력을 높입니다.',
      composition: [
        { ticker: 'SPY', weight: 20 },
        { ticker: 'VT', weight: 20 },
        { ticker: 'TLT', weight: 25 },
        { ticker: 'GLD', weight: 15 },
        { ticker: 'KTB-10Y', weight: 10 },
        { ticker: 'CASH', weight: 10 },
      ],
    },
    {
      id: 'defensive_krcore',
      name: '안정형 국내 코어',
      tags: ['안정형', '국내 중심', '절세형'],
      risk: '중하',
      rebalanceDifficulty: '낮음',
      forUser: '국내 상장 상품 위주로 단순하게 관리하려는 사용자',
      rationale: '국내 상장 ETF, 채권, 현금을 섞어 절세 계좌 운영과 관리 편의성을 높입니다.',
      composition: [
        { ticker: '069500', weight: 20 },
        { ticker: '114460', weight: 20 },
        { ticker: '132030', weight: 20 },
        { ticker: '396150', weight: 10 },
        { ticker: 'GOLD', weight: 10 },
        { ticker: 'CASH', weight: 20 },
      ],
    },
  ],
}

function buildCompositionMeta(composition) {
  return composition.map((item) => {
    const asset = getAssetInfo(item.ticker)
    return { ...item, name: asset.name, category: asset.sector }
  })
}

export function getRecommendationsForProfile(profile = 'balanced') {
  const models = MODEL_PORTFOLIOS[profile] || MODEL_PORTFOLIOS.balanced
  return models.map((model) => ({
    ...model,
    composition: buildCompositionMeta(model.composition),
  }))
}


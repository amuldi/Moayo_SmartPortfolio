import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, BadgePlus, CheckCircle2, Copy, Gauge,
  Sparkles, Target,
} from 'lucide-react'
import clsx from 'clsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Select } from '../components/ui/Input.jsx'
import { AllocationPie } from '../components/charts/AllocationPie.jsx'
import { MultiLineChart, MonthlyReturnChart } from '../components/charts/PerformanceChart.jsx'
import usePortfolioStore from '../store/portfolioStore.js'
import useAuthStore from '../store/authStore.js'
import { buildPlanningWorkspace, buildPortfolioSnapshot } from '../features/portfolio/analytics.js'
import { INVESTOR_PROFILES } from '../features/portfolio/recommendationEngine.js'
import { formatCurrency, formatPct } from '../utils/formatters.js'
import { runBacktest, runFutureProjection } from '../services/backtestService.js'

function EmptyState() {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)]">
        <Target size={20} />
      </div>
      <p className="mt-4 text-lg font-semibold text-[var(--text-primary)]">분석할 포트폴리오 없음</p>
      <Link to="/portfolio" className="mt-5 inline-flex">
        <Button icon={BadgePlus}>포트폴리오 추가</Button>
      </Link>
    </Card>
  )
}

function SectionTitle({ title }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
    </div>
  )
}

const ANALYSIS_VIEWS = [
  { id: 'overview', label: '핵심 요약' },
  { id: 'adjust', label: '조정안' },
  { id: 'accounts', label: '계좌별 가이드' },
  { id: 'backtest', label: '백테스트' },
]

export default function Analysis() {
  const { accounts, livePrices, fxRates, currentPortfolioName, refreshStatus, refreshError, lastPriceUpdateAt } = usePortfolioStore()
  const { isGuest } = useAuthStore()
  const [profile, setProfile] = useState('balanced')
  const [selectedRecommendationId, setSelectedRecommendationId] = useState('')
  const [shareCopied, setShareCopied] = useState(false)
  const [activeView, setActiveView] = useState('overview')

  const snapshot = useMemo(() => buildPortfolioSnapshot(accounts, livePrices, fxRates), [accounts, livePrices, fxRates])
  const planning = useMemo(() => buildPlanningWorkspace(snapshot, profile), [snapshot, profile])

  const selectedRecommendation = useMemo(() => {
    return (
      planning.recommendations.find((item) => item.id === selectedRecommendationId) ||
      planning.recommendations[0] ||
      null
    )
  }, [planning.recommendations, selectedRecommendationId])

  const shareText = useMemo(() => {
    if (!selectedRecommendation) return ''
    return [
      `${currentPortfolioName} 진단 결과`,
      `현재 수익률 ${formatPct(snapshot.totalReturnPct, 2)} · 최대 비중 ${snapshot.biggestHolding?.name || '-'} ${snapshot.biggestHolding?.weight?.toFixed(1) || 0}%`,
      `추천 포트폴리오: ${selectedRecommendation.name}`,
      `핵심 변화: ${selectedRecommendation.summary}`,
    ].join('\n')
  }, [currentPortfolioName, selectedRecommendation, snapshot.biggestHolding, snapshot.totalReturnPct])

  const transitionPlan = useMemo(() => {
    if (!selectedRecommendation) return null
    const trims = selectedRecommendation.majorChanges.filter((item) => item.gap < 0)
    const adds = selectedRecommendation.majorChanges.filter((item) => item.gap > 0)
    return {
      headline:
        trims[0] && adds[0]
          ? `${trims[0].name} 비중을 줄여 ${adds[0].name}를 채우는 구조 전환이 핵심입니다.`
          : '현재 구조를 정리하고 코어 자산을 늘리는 흐름이 핵심입니다.',
      phases: [
        {
          step: '초과 비중 정리',
          description: trims[0]
            ? `${trims[0].name}처럼 목표 대비 비중이 큰 자산을 먼저 줄여 이동 자금을 확보합니다.`
            : '현재 구조에서 비중이 큰 종목부터 먼저 정리할지 점검합니다.',
        },
        {
          step: '코어 자산 채우기',
          description: adds[0]
            ? `${adds[0].name}처럼 목표 대비 부족한 코어 자산부터 채우면 전체 구조가 빠르게 안정됩니다.`
            : '핵심 ETF와 방어 자산부터 먼저 채워 구조를 안정화합니다.',
        },
        {
          step: '계좌 역할 고정',
          description: '절세계좌는 장기 적립용, 종합계좌는 성장 자산 조정용으로 나누면 다음 리밸런싱도 쉬워집니다.',
        },
      ],
    }
  }, [selectedRecommendation])

  const currentBacktest = useMemo(() => {
    if (!snapshot.holdings.length) return null
    return runBacktest(
      snapshot.holdings.map((holding) => ({ ticker: holding.ticker, allocation: holding.weight })),
      null,
      null,
      100
    )
  }, [snapshot.holdings])

  const targetBacktest = useMemo(() => {
    if (!selectedRecommendation?.composition?.length) return null
    return runBacktest(
      selectedRecommendation.composition.map((holding) => ({ ticker: holding.ticker, allocation: holding.weight })),
      null,
      null,
      100
    )
  }, [selectedRecommendation])

  const futureProjection = useMemo(() => {
    if (!selectedRecommendation?.composition?.length) return null
    return runFutureProjection(
      selectedRecommendation.composition.map((holding) => ({ ticker: holding.ticker, allocation: holding.weight })),
      5,
      Math.max(Math.round(snapshot.totalInvestedKRW || 0), 10000000)
    )
  }, [selectedRecommendation, snapshot.totalInvestedKRW])

  const backtestSeries = useMemo(() => {
    if (!currentBacktest || !targetBacktest) return []
    return [
      {
        id: 'current',
        name: '현재 포트폴리오',
        data: currentBacktest.equityCurve.slice(1).map((item) => ({ month: item.month, value: item.value })),
        color: '#5BA3CF',
      },
      {
        id: 'target',
        name: selectedRecommendation?.name || '추천 포트폴리오',
        data: targetBacktest.equityCurve.slice(1).map((item) => ({ month: item.month, value: item.value })),
        color: '#10B981',
      },
    ]
  }, [currentBacktest, targetBacktest, selectedRecommendation])

  const executionStrategies = selectedRecommendation
    ? [
        {
          id: 'now',
          label: '즉시 조정',
          tone: 'warning',
          title: '한 번에 목표 구조로 맞추기',
          desc: '집중도와 중복 노출이 높을 때 검토할 수 있습니다. 다만 체감 변동성이 커질 수 있어 조정 순서를 나눠 확인하는 편이 좋습니다.',
        },
        {
          id: 'split',
          label: '분할 전환',
          tone: 'good',
          title: '2~4회로 나눠 이동',
          desc: '가장 추천하는 방식입니다. 초과 비중 종목을 먼저 줄이고, 부족한 ETF와 방어 자산을 월별로 채우면 심리적 부담이 적습니다.',
        },
        {
          id: 'rule',
          label: '기준선 도달 시 전환',
          tone: 'neutral',
          title: '비중 이탈이 커질 때만 조정',
          desc: '현재 구조가 아주 나쁘지 않을 때 적합합니다. 목표 비중과의 차이가 5%p 이상 벌어지는 자산만 우선 조정합니다.',
        },
      ]
    : []

  const actionChecklist = selectedRecommendation
    ? [
        `1단계: ${selectedRecommendation.majorChanges[0]?.gap < 0 ? selectedRecommendation.majorChanges[0].name : snapshot.biggestHolding?.name || '초과 비중 자산'} 비중부터 줄입니다.`,
        '2단계: 줄인 자금은 목표 포트폴리오의 코어 ETF부터 채웁니다.',
        '3단계: ISA와 연금저축은 절세계좌 역할에 맞게 단순 ETF와 장기 적립 자산을 우선 배치합니다.',
        '4단계: 현금 비중을 5~10% 남겨 두고 나머지는 2~4회로 나눠 전환합니다.',
      ]
    : []

  const executionRows = useMemo(() => {
    if (!selectedRecommendation) return []
    const accountByRole = {
      buy: snapshot.accounts.find((account) => ['ISA', 'PENSION'].includes(account.type)) || snapshot.accounts[0],
      sell: snapshot.accounts.find((account) => account.type === 'BROKERAGE') || snapshot.accounts[0],
    }

    return selectedRecommendation.majorChanges.map((change) => {
      const amount = Math.abs(change.gap / 100) * snapshot.totalValueKRW
      const action = change.gap > 0 ? '비중 확대 검토' : '비중 축소 검토'
      const account = change.gap > 0 ? accountByRole.buy : accountByRole.sell
      return {
        ...change,
        action,
        amount,
        accountName: account?.name || '계좌 선택 필요',
        taxNote: change.gap > 0
          ? '절세계좌 여유가 있으면 장기 보유 자산부터 검토하는 편이 관리가 쉽습니다.'
          : '일반계좌 비중 축소는 양도세와 배당 과세 영향을 확인한 뒤 나눠 검토하세요.',
      }
    })
  }, [selectedRecommendation, snapshot.accounts, snapshot.totalValueKRW])

  const summaryCards = [
    {
      label: '현재 가장 큰 문제',
      value: planning.diagnosis[0]?.title || '구조 점검 필요',
      desc: planning.diagnosis[0]?.description || '현재 구조를 먼저 점검해 보세요.',
    },
    {
      label: '추천 포트폴리오',
      value: selectedRecommendation?.name || '-',
      desc: selectedRecommendation?.summary || '추천 포트폴리오를 선택해 주세요.',
    },
    {
      label: '가장 먼저 할 일',
      value: actionChecklist[0]?.replace('1단계: ', '') || '초과 비중 자산 점검',
      desc: transitionPlan?.headline || '목표 비중 중심으로 순서를 정리해 보세요.',
    },
    {
      label: '구조 상태',
      value: `${planning.portfolioScore.value}점 · ${planning.portfolioScore.label}`,
      desc: planning.portfolioScore.summary,
    },
  ]

  const handleCopyShare = async () => {
    if (!shareText) return
    try {
      await navigator.clipboard.writeText(shareText)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 1800)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-secondary)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6">
        <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">리밸런싱</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {refreshError
                ? '기본 시세 기준'
                : lastPriceUpdateAt
                  ? `${new Date(lastPriceUpdateAt).toLocaleString('ko-KR')} 기준`
                  : refreshStatus === 'loading'
                    ? '시세 갱신 중'
                    : '포트폴리오 분석'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/portfolio">
              <Button variant="secondary" icon={ArrowRight}>포트폴리오 수정</Button>
            </Link>
            {isGuest && (
              <Link to="/register">
                <Button icon={Sparkles}>결과 저장하고 다시 보기</Button>
              </Link>
            )}
          </div>
          </div>
        </div>

        {!snapshot.holdingCount ? (
          <EmptyState />
        ) : (
          <>
            <Card>
              <CardBody className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div>
                  <p className="text-xs font-semibold text-[var(--accent)]">포트폴리오 조정 요약</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{currentPortfolioName}</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((item) => (
                      <div key={item.label} className="flex h-full min-h-[118px] flex-col justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                        <p className="text-xs font-medium text-[var(--text-muted)]">{item.label}</p>
                        <div className="mt-3">
                          <p className="text-sm font-semibold leading-6 text-[var(--text-primary)]">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 xl:sticky xl:top-24">
                  <Select label="투자 성향" value={profile} onChange={(event) => setProfile(event.target.value)}>
                    {INVESTOR_PROFILES.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </Select>
                  <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] p-4">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs text-[var(--text-muted)]">포트폴리오 점수</p>
                        <div className="mt-1 flex items-end gap-2">
                          <p className="text-3xl font-bold text-[var(--text-primary)]">{planning.portfolioScore.value}</p>
                          <p className="pb-1 text-sm font-semibold text-[var(--accent)]">{planning.portfolioScore.label}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-[var(--accent-soft)] px-2 py-1 text-[11px] text-[var(--accent)]">
                        핵심 지표
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] p-3">
                        <p className="text-[11px] text-[var(--text-muted)]">분산 점수</p>
                        <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{snapshot.diversificationScore}</p>
                      </div>
                      <div className="rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] p-3">
                        <p className="text-[11px] text-[var(--text-muted)]">주의 항목</p>
                        <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                          {planning.overlaps.length + planning.accountConflicts.length}개
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <div className="sticky top-0 z-10 -mx-4 border-y border-[var(--border)] bg-[var(--bg-secondary)]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
              <div className="flex gap-2 overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] p-1 no-scrollbar">
                {ANALYSIS_VIEWS.map((view) => (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => setActiveView(view.id)}
                    className={clsx(
                      'shrink-0 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-all',
                      activeView === view.id
                        ? 'bg-[var(--accent)] text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                    )}
                  >
                    {view.label}
                  </button>
                ))}
              </div>
            </div>

            {activeView === 'overview' && (
              <>
                <div className="grid gap-4">
                  <Card>
                    <CardHeader>
                      <SectionTitle
                        title="성향별 수정 사안"
                        desc="선택한 투자 성향 기준으로 지금 구조에서 우선 손봐야 할 항목을 정리합니다."
                      />
                    </CardHeader>
                    <CardBody className="space-y-3">
                      {planning.profileAdjustments.map((item) => (
                        <div key={item.id} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</p>
                            <span className="rounded-full bg-[var(--bg-elevated)] px-2 py-1 text-[11px] text-[var(--text-secondary)]">{item.priority}</span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.reason}</p>
                        </div>
                      ))}
                    </CardBody>
                  </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                  <Card>
                    <CardHeader>
                      <SectionTitle
                        title="현재 구조 진단"
                        desc="왜 이 구조를 바꿔야 하는지 먼저 이해할 수 있게 설명합니다."
                      />
                    </CardHeader>
                    <CardBody className="space-y-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                          <p className="text-xs text-[var(--text-muted)]">집중도</p>
                          <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">{snapshot.biggestHolding?.weight.toFixed(1) || 0}%</p>
                          <p className="mt-1 text-xs text-[var(--text-secondary)]">{snapshot.biggestHolding?.name || '대표 종목 없음'}</p>
                        </div>
                        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                          <p className="text-xs text-[var(--text-muted)]">섹터 편중</p>
                          <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">{snapshot.bySector[0]?.value.toFixed(1) || 0}%</p>
                          <p className="mt-1 text-xs text-[var(--text-secondary)]">{snapshot.bySector[0]?.name || '섹터 없음'}</p>
                        </div>
                        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                          <p className="text-xs text-[var(--text-muted)]">지역 편중</p>
                          <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">{snapshot.byMarket[0]?.value.toFixed(1) || 0}%</p>
                          <p className="mt-1 text-xs text-[var(--text-secondary)]">{snapshot.byMarket[0]?.name || '시장 없음'}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {planning.styleSummary.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-[var(--bg-elevated)] px-2 py-1 text-[11px] text-[var(--text-secondary)]">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                          <p className="text-sm font-semibold text-[var(--text-primary)]">현재 투자 스타일 해석</p>
                          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{planning.styleSummary.summary}</p>
                        </div>
                        {planning.diagnosis.map((item) => (
                          <div key={item.title} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] p-4">
                            <div className="flex items-center gap-2">
                              <Gauge size={15} className={clsx(item.severity === 'high' ? 'text-[var(--negative)]' : item.severity === 'medium' ? 'text-[var(--warning)]' : 'text-[var(--positive)]')} />
                              <p className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</p>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader>
                      <SectionTitle
                        title="현재 구조 한눈에 보기"
                        desc="카테고리와 계좌 배치를 함께 보면 어떤 역할이 비어 있는지 빠르게 보입니다."
                      />
                    </CardHeader>
                    <CardBody className="grid gap-4">
                      <AllocationPie
                        data={snapshot.byCategory}
                        height={220}
                        centerLabel="현재 비중"
                        centerValue={`${snapshot.holdingCount}종목`}
                      />
                      <AllocationPie
                        data={snapshot.byAccount}
                        height={220}
                        centerLabel="계좌별 비중"
                        centerValue={`${snapshot.accounts.length}개 계좌`}
                      />
                    </CardBody>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <SectionTitle
                      title="추천 포트폴리오 비교"
                      desc="현재 구조보다 나은 대안을 2개 이상 비교하고, 바뀌는 점을 바로 확인합니다."
                    />
                  </CardHeader>
                  <CardBody className="grid gap-4 lg:grid-cols-2">
                    {planning.recommendations.map((recommendation) => (
                      <button
                        key={recommendation.id}
                        type="button"
                        onClick={() => {
                          setSelectedRecommendationId(recommendation.id)
                          setActiveView('adjust')
                        }}
                        className={clsx(
                          'rounded-[var(--radius-card)] border p-5 text-left transition-all',
                          selectedRecommendation?.id === recommendation.id
                            ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                            : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]'
                        )}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-bold text-[var(--text-primary)]">{recommendation.name}</p>
                          {recommendation.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-[var(--bg-elevated)] px-2 py-1 text-[11px] text-[var(--text-secondary)]">{tag}</span>
                          ))}
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{recommendation.rationale}</p>
                        <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">{recommendation.comparison}</p>
                        <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                          <p className="text-xs text-[var(--text-muted)]">현재 대비 핵심 변화</p>
                          <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{recommendation.summary}</p>
                        </div>
                      </button>
                    ))}
                  </CardBody>
                </Card>
              </>
            )}

            {selectedRecommendation && (
              <>
                {activeView === 'adjust' && (
                  <>
                    <Card>
                      <CardHeader>
                        <SectionTitle
                          title="포트폴리오 조정안"
                          desc="현재 상태에서 목표 구조로 가기 위해 무엇을 줄이고 늘릴지 가장 중요한 항목만 먼저 보여줍니다."
                        />
                      </CardHeader>
                      <CardBody className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
                        <div className="space-y-3">
                          {executionRows.map((change) => (
                            <div key={change.ticker} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] p-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-[var(--text-primary)]">{change.name}</p>
                                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                                    현재 {change.currentWeight.toFixed(1)}% → 목표 {change.weight.toFixed(1)}%
                                  </p>
                                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                                    우선 계좌: {change.accountName}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className={clsx('text-sm font-semibold', change.gap > 0 ? 'positive' : 'negative')}>
                                    {change.action} {Math.abs(change.gap).toFixed(1)}%p
                                  </p>
                                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                                    참고 금액 {formatCurrency(change.amount, 'KRW', true)}
                                  </p>
                                </div>
                              </div>
                              <p className="mt-3 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] px-3 py-2 text-xs leading-5 text-[var(--text-secondary)]">
                                {change.taxNote}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="rounded-[var(--radius-card)] border border-[var(--accent)] bg-[var(--accent-soft)] p-5">
                          <div className="flex items-center gap-2">
                            <Target size={16} className="text-[var(--accent)]" />
                            <p className="text-sm font-semibold text-[var(--text-primary)]">추천 조정 순서</p>
                          </div>
                          {transitionPlan && (
                            <div className="mt-3 rounded-[var(--radius-md)] bg-white/70 p-3">
                              <p className="text-sm font-medium text-[var(--text-primary)]">{transitionPlan.headline}</p>
                            </div>
                          )}
                          <div className="mt-4 space-y-3">
                            {actionChecklist.map((item) => (
                              <div key={item} className="flex items-start gap-2">
                                <CheckCircle2 size={14} className="mt-0.5 text-[var(--accent)]" />
                                <p className="text-sm leading-6 text-[var(--text-secondary)]">{item}</p>
                              </div>
                            ))}
                          </div>
                          <p className="mt-4 text-[11px] leading-5 text-[var(--text-muted)]">
                            조정 금액은 현재 평가금액 기준의 참고값이며 실제 체결가, 세금, 수수료에 따라 달라질 수 있습니다.
                          </p>
                        </div>
                      </CardBody>
                    </Card>

                    <div className="grid gap-4 xl:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <SectionTitle
                            title="전환 단계별 계획"
                            desc="처음부터 모든 걸 바꾸기보다, 순서대로 따라가기 쉽게 정리했습니다."
                          />
                        </CardHeader>
                        <CardBody className="space-y-3">
                          {transitionPlan?.phases.map((phase) => (
                            <div key={phase.step} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] p-4">
                              <p className="text-sm font-semibold text-[var(--text-primary)]">{phase.step}</p>
                              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{phase.description}</p>
                            </div>
                          ))}
                        </CardBody>
                      </Card>

                      <Card>
                        <CardHeader>
                          <SectionTitle
                            title="전환 방식 선택"
                            desc="내 투자 성향과 심리적 부담에 맞는 조정 방식만 골라서 보면 됩니다."
                          />
                        </CardHeader>
                        <CardBody className="space-y-3">
                          {executionStrategies.map((strategy) => (
                            <div key={strategy.id} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] p-4">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-[var(--text-primary)]">{strategy.title}</p>
                                <span className="rounded-full bg-[var(--bg-elevated)] px-2 py-1 text-[11px] text-[var(--text-secondary)]">{strategy.label}</span>
                              </div>
                              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{strategy.desc}</p>
                            </div>
                          ))}
                        </CardBody>
                      </Card>
                    </div>
                  </>
                )}

                {activeView === 'accounts' && (
                  <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                    <Card>
                      <CardHeader>
                        <SectionTitle
                          title="계좌별 조정 가이드"
                          desc="계좌마다 역할을 명확히 나누면 다음 리밸런싱도 더 쉬워집니다."
                        />
                      </CardHeader>
                      <CardBody className="space-y-3">
                        {planning.accountGuides.map((guide) => (
                          <div key={guide.accountId} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-[var(--text-primary)]">{guide.name}</p>
                              <div className="flex gap-2">
                                <span className="rounded-full bg-[var(--accent-soft)] px-2 py-1 text-[11px] text-[var(--accent)]">{guide.role}</span>
                                <span className="rounded-full bg-[var(--bg-elevated)] px-2 py-1 text-[11px] text-[var(--text-secondary)]">{guide.priority}</span>
                              </div>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{guide.note}</p>
                          </div>
                        ))}
                      </CardBody>
                    </Card>

                    <Card>
                      <CardHeader>
                        <SectionTitle
                          title="계좌 충돌과 중복 노출"
                          desc="계좌 역할이 섞여 있거나 비슷한 노출이 겹치는 부분만 따로 모았습니다."
                        />
                      </CardHeader>
                      <CardBody className="space-y-3">
                        {planning.accountConflicts.length > 0 ? planning.accountConflicts.map((item) => (
                          <div key={item.accountId} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                            <p className="text-sm font-medium text-[var(--text-primary)]">{item.title}</p>
                            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.description}</p>
                          </div>
                        )) : (
                          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">
                            현재 계좌 역할 충돌은 크지 않습니다.
                          </div>
                        )}

                        {planning.overlaps.length > 0 && (
                          <div className="rounded-[var(--radius-md)] border border-[var(--warning)]/40 bg-[var(--warning-soft)] p-4">
                            <p className="text-sm font-semibold text-[var(--text-primary)]">중복 노출 체크</p>
                            <div className="mt-2 space-y-2">
                              {planning.overlaps.map((item) => (
                                <p key={item.title} className="text-sm text-[var(--text-secondary)]">{item.message}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </div>
                )}

                {activeView === 'backtest' && (
                  <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                    <Card>
                      <CardHeader>
                        <SectionTitle
                          title="백테스팅 비교"
                          desc="현재 포트폴리오와 추천 포트폴리오를 같은 기준으로 비교해 구조 변화가 과거 흐름에 어떤 차이를 냈는지 봅니다."
                        />
                      </CardHeader>
                      <CardBody className="space-y-4">
                        <MultiLineChart series={backtestSeries} height={280} />
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                            <p className="text-xs text-[var(--text-muted)]">현재 누적 수익률</p>
                            <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{formatPct(currentBacktest?.stats.totalReturn || 0, 1)}</p>
                          </div>
                          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                            <p className="text-xs text-[var(--text-muted)]">추천 누적 수익률</p>
                            <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{formatPct(targetBacktest?.stats.totalReturn || 0, 1)}</p>
                          </div>
                          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                            <p className="text-xs text-[var(--text-muted)]">추천 최대 낙폭</p>
                            <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{formatPct(-(targetBacktest?.stats.maxDrawdown || 0), 1, false)}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardHeader>
                        <SectionTitle
                          title="월별 수익과 5년 전망"
                          desc="최근 월별 흐름과 추천 구조 기준 5년 누적 경로를 함께 보여줍니다."
                        />
                      </CardHeader>
                      <CardBody className="space-y-4">
                        <MonthlyReturnChart data={currentBacktest?.monthlyReturns?.slice(-24) || []} height={180} />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                            <p className="text-xs text-[var(--text-muted)]">5년 예상 평가금액</p>
                            <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                              {formatCurrency(futureProjection?.stats.finalValue || 0, 'KRW', true)}
                            </p>
                          </div>
                          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                            <p className="text-xs text-[var(--text-muted)]">예상 CAGR</p>
                            <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                              {formatPct(futureProjection?.stats.cagr || 0, 1)}
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                )}

                <Card>
                    <CardHeader>
                      <SectionTitle
                        title="저장·공유하고 다시 보기"
                        desc="결과를 저장해 다음 리밸런싱 때 이어서 보거나, 공유용 요약으로 바로 전달할 수 있습니다."
                      />
                    </CardHeader>
                  <CardBody className="grid gap-4 lg:grid-cols-[1fr_auto]">
                    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">공유 요약 문구</p>
                      <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--text-secondary)]">{shareText}</pre>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button icon={Copy} onClick={handleCopyShare}>
                        {shareCopied ? '복사 완료' : '요약 복사'}
                      </Button>
                      {isGuest ? (
                        <Link to="/register">
                          <Button variant="secondary" className="w-full">회원가입하고 저장</Button>
                        </Link>
                      ) : (
                        <Link to="/portfolio">
                          <Button variant="secondary" className="w-full">포트폴리오 수정</Button>
                        </Link>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle, ArrowRight, BadgePlus, ChartNoAxesCombined, ShieldCheck,
  TrendingDown, TrendingUp,
} from 'lucide-react'
import {
  BarChart, Bar, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { AllocationPie } from '../components/charts/AllocationPie.jsx'
import { PerformanceChart } from '../components/charts/PerformanceChart.jsx'
import usePortfolioStore from '../store/portfolioStore.js'
import { buildPortfolioSnapshot } from '../features/portfolio/analytics.js'
import { formatCurrency, formatPct, formatSignedCurrency } from '../utils/formatters.js'
import clsx from 'clsx'

function AnalysisEmptyState() {
  return (
    <Card className="p-8">
      <p className="text-lg font-semibold text-[var(--text-primary)]">분석할 포트폴리오가 아직 없습니다</p>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
        종목 수량과 평균단가가 있어야 손익 비교, 비중 분석, 변화 추이를 계산할 수 있습니다.
      </p>
      <Link to="/portfolio" className="mt-5 inline-flex">
        <Button icon={BadgePlus}>포트폴리오 만들기</Button>
      </Link>
    </Card>
  )
}

function InsightCard({ title, description, tone = 'neutral', icon: Icon }) {
  const toneClass = {
    neutral: 'border-[var(--border)] bg-[var(--bg-card)]',
    warning: 'border-[var(--warning)] bg-[var(--warning-soft)]',
    good: 'border-[var(--positive)] bg-[var(--positive-soft)]',
  }[tone]

  return (
    <Card className={`p-4 ${toneClass}`}>
      <div className="flex items-start gap-3">
        <div className="rounded-[var(--radius-md)] bg-[var(--bg-card)] p-2">
          <Icon size={16} className="text-[var(--text-primary)]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
          <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{description}</p>
        </div>
      </div>
    </Card>
  )
}

export default function Analysis() {
  const { accounts, livePrices } = usePortfolioStore()

  const snapshot = useMemo(
    () => buildPortfolioSnapshot(accounts, livePrices),
    [accounts, livePrices]
  )

  const timelineSeries = useMemo(() => {
    if (!snapshot.timeline.length) return []
    return [
      {
        id: 'portfolio',
        name: '포트폴리오',
        data: snapshot.timeline.map((item) => ({ month: item.month, value: item.performance })),
      },
    ]
  }, [snapshot.timeline])

  const concentrationRisk = snapshot.biggestHolding?.weight >= 35
  const marketDiversified = snapshot.byMarket.length >= 2
  const categoryDiversified = snapshot.byCategory.length >= 4

  const insights = [
    {
      title: concentrationRisk ? '단일 종목 집중도가 높습니다' : '단일 종목 집중도가 안정적입니다',
      description: snapshot.biggestHolding
        ? `${snapshot.biggestHolding.name} 비중이 ${snapshot.biggestHolding.weight.toFixed(1)}%입니다. ${concentrationRisk ? '30% 이상이면 변동성이 급격히 커질 수 있습니다.' : '주요 종목이 있어도 과도한 쏠림은 아닙니다.'}`
        : '보유 종목이 없습니다.',
      tone: concentrationRisk ? 'warning' : 'good',
      icon: concentrationRisk ? AlertTriangle : ShieldCheck,
    },
    {
      title: marketDiversified ? '시장 분산이 확보되어 있습니다' : '시장 분산을 늘려 보세요',
      description: `현재 ${snapshot.byMarket.length}개 시장에 분산되어 있습니다. ${marketDiversified ? '국내와 해외 노출이 같이 있어 한쪽 시장 충격을 줄이는 데 유리합니다.' : '국내와 미국, 글로벌 ETF를 함께 담으면 지역 편중 완화에 도움이 됩니다.'}`,
      tone: marketDiversified ? 'good' : 'neutral',
      icon: ChartNoAxesCombined,
    },
    {
      title: categoryDiversified ? '카테고리 구성이 균형적입니다' : '카테고리 구성을 조금 더 넓힐 수 있습니다',
      description: `현재 ${snapshot.byCategory.length}개 카테고리로 구성되어 있습니다. ${categoryDiversified ? '배당주, 성장주, ETF, 채권 등의 역할이 나뉘면 포트폴리오 해석이 쉬워집니다.' : 'ETF, 배당주, 채권 등 역할이 다른 자산을 섞으면 리스크 관리가 쉬워집니다.'}`,
      tone: categoryDiversified ? 'good' : 'neutral',
      icon: snapshot.totalPnl >= 0 ? TrendingUp : TrendingDown,
    },
  ]

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">분석</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              자산 비중, 손익 기여, 분산 상태를 정리해 보여줍니다.
            </p>
          </div>
          <Link to="/portfolio">
            <Button icon={ArrowRight}>보유 종목 수정</Button>
          </Link>
        </div>

        {!snapshot.holdingCount ? (
          <AnalysisEmptyState />
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>포트폴리오 변화 추이</CardTitle>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">최근 1년의 누적 흐름을 기준값 100으로 비교합니다.</p>
                </CardHeader>
                <CardBody>
                  <PerformanceChart series={timelineSeries} height={300} />
                </CardBody>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>핵심 지표</CardTitle>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">현재 기준 종합 요약</p>
                </CardHeader>
                <CardBody className="space-y-4">
                  {[
                    ['분산 점수', `${snapshot.diversificationScore}점`, '카테고리, 시장, 집중도를 함께 반영'],
                    ['총 수익률', formatPct(snapshot.totalReturnPct, 2), formatSignedCurrency(snapshot.totalPnl, 'KRW')],
                    ['오늘 변동', formatPct(snapshot.totalDailyChangePct, 2), formatSignedCurrency(snapshot.totalDailyPnl, 'KRW')],
                    ['최대 비중 종목', snapshot.biggestHolding?.name || '-', snapshot.biggestHolding ? `${snapshot.biggestHolding.weight.toFixed(1)}%` : ''],
                  ].map(([label, value, description]) => (
                    <div key={label} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                      <p className="text-xs text-[var(--text-muted)]">{label}</p>
                      <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">{value}</p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">{description}</p>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>자산 카테고리 비중</CardTitle>
                </CardHeader>
                <CardBody>
                  <AllocationPie
                    data={snapshot.byCategory}
                    height={260}
                    centerLabel="현재 비중"
                    centerValue={`${snapshot.holdingCount}종목`}
                  />
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>계좌별 보유 비중</CardTitle>
                </CardHeader>
                <CardBody>
                  <AllocationPie
                    data={snapshot.byAccount}
                    height={260}
                    centerLabel="계좌 분산"
                    centerValue={`${snapshot.accounts.length}개`}
                  />
                </CardBody>
              </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <Card>
                <CardHeader>
                  <CardTitle>종목별 손익 기여</CardTitle>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">손익 절대 금액 기준 상위 종목</p>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={snapshot.profitDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}만`} />
                      <Tooltip
                        formatter={(value, _, item) => [formatSignedCurrency(item.payload.pnl, 'KRW'), '손익']}
                        contentStyle={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          borderRadius: 12,
                          color: 'var(--text-primary)',
                        }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {snapshot.profitDistribution.map((item) => (
                          <Cell key={item.name} fill={item.pnl >= 0 ? 'var(--positive)' : 'var(--negative)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>해석 포인트</CardTitle>
                </CardHeader>
                <CardBody className="space-y-3">
                  {insights.map((insight) => (
                    <InsightCard key={insight.title} {...insight} />
                  ))}
                </CardBody>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>수익 상위 종목</CardTitle>
                </CardHeader>
                <div className="divide-y divide-[var(--border)]">
                  {snapshot.topGainers.map((holding) => (
                    <div key={`${holding.accountId}-${holding.id}`} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{holding.name}</p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">{holding.accountName} · {holding.weight.toFixed(1)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold positive">{formatPct(holding.pnlPct, 2)}</p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">{formatSignedCurrency(holding.pnl, 'KRW')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>손실 상위 종목</CardTitle>
                </CardHeader>
                <div className="divide-y divide-[var(--border)]">
                  {snapshot.topLosers.map((holding) => (
                    <div key={`${holding.accountId}-${holding.id}`} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{holding.name}</p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">{holding.accountName} · {holding.weight.toFixed(1)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold negative">{formatPct(holding.pnlPct, 2)}</p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">{formatSignedCurrency(holding.pnl, 'KRW')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>리밸런싱 제안</CardTitle>
                <p className="mt-1 text-xs text-[var(--text-muted)]">목표 비중이 입력된 종목만 계산합니다.</p>
              </CardHeader>
              <div className="divide-y divide-[var(--border)]">
                {snapshot.rebalancingSuggestions.length ? snapshot.rebalancingSuggestions.map((item) => (
                  <div key={item.ticker} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{item.name}</p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        현재 {item.currentWeight.toFixed(1)}% → 목표 {item.targetWeight.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={clsx('text-sm font-semibold', item.gap > 0 ? 'positive' : 'negative')}>
                        {item.action} {Math.abs(item.gap).toFixed(1)}%p
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">약 {formatCurrency(item.amount, 'KRW', true)}</p>
                    </div>
                  </div>
                )) : (
                  <div className="px-5 py-10 text-center text-sm text-[var(--text-secondary)]">
                    종목 수정 화면에서 목표 비중을 입력하면 리밸런싱 제안이 표시됩니다.
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

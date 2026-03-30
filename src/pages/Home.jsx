import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, BadgePlus, BriefcaseBusiness,
  CircleDollarSign, RefreshCw, TrendingDown, TrendingUp, Wallet,
} from 'lucide-react'
import { Card, CardBody, CardHeader, CardTitle, StatCard } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { AllocationPie } from '../components/charts/AllocationPie.jsx'
import { PerformanceChart } from '../components/charts/PerformanceChart.jsx'
import usePortfolioStore from '../store/portfolioStore.js'
import { buildPortfolioSnapshot } from '../features/portfolio/analytics.js'
import { formatCurrency, formatPct, formatSignedCurrency } from '../utils/formatters.js'
import clsx from 'clsx'

function EmptyDashboard() {
  return (
    <Card className="py-16 text-center">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 px-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]">
          <Wallet size={24} className="text-[var(--text-muted)]" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">포트폴리오를 먼저 등록해 주세요</h2>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          계좌와 종목을 입력하면 평가금액, 손익, 자산 비중, 기간별 흐름이 자동으로 연결됩니다.
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          <Link to="/portfolio">
            <Button icon={BadgePlus}>첫 계좌 만들기</Button>
          </Link>
          <Link to="/analysis">
            <Button variant="secondary">분석 화면 보기</Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

export default function Home() {
  const {
    accounts,
    livePrices,
    watchlist,
    recentTickers,
    savedPortfolios,
    refreshPrices,
    refreshStatus,
    refreshError,
    lastPriceUpdateAt,
  } = usePortfolioStore()

  const snapshot = useMemo(
    () => buildPortfolioSnapshot(accounts, livePrices),
    [accounts, livePrices]
  )

  const performanceSeries = useMemo(() => {
    if (!snapshot.timeline.length) return []
    return [
      {
        id: 'portfolio',
        name: '포트폴리오',
        data: snapshot.timeline.map((item) => ({ month: item.month, value: item.performance })),
      },
    ]
  }, [snapshot.timeline])

  const topSummary = [
    {
      label: '총 평가금액',
      value: formatCurrency(snapshot.totalValueKRW, 'KRW', true),
      sub: `${snapshot.holdingCount}개 종목 · ${snapshot.accounts.length}개 계좌`,
      icon: Wallet,
    },
    {
      label: '총 투자원금',
      value: formatCurrency(snapshot.totalInvestedKRW, 'KRW', true),
      sub: '입력한 수량과 평균단가 기준',
      icon: CircleDollarSign,
    },
    {
      label: '총 손익',
      value: formatSignedCurrency(snapshot.totalPnl, 'KRW'),
      sub: `총 수익률 ${formatPct(snapshot.totalReturnPct, 2)}`,
      icon: snapshot.totalPnl >= 0 ? TrendingUp : TrendingDown,
    },
    {
      label: '오늘 변동',
      value: formatSignedCurrency(snapshot.totalDailyPnl, 'KRW'),
      sub: `일간 등락 ${formatPct(snapshot.totalDailyChangePct, 2)}`,
      icon: BriefcaseBusiness,
    },
  ]

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-primary)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">홈</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              투자 현황과 오늘 변동을 빠르게 확인합니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={RefreshCw}
              loading={refreshStatus === 'loading'}
              onClick={refreshPrices}
            >
              시세 새로고침
            </Button>
            <Link to="/portfolio">
              <Button icon={ArrowRight}>포트폴리오 관리</Button>
            </Link>
          </div>
        </div>

        {refreshError && (
          <Card className="border-[var(--warning)] bg-[var(--warning-soft)] px-4 py-3">
            <p className="text-sm font-medium text-[var(--text-primary)]">{refreshError}</p>
          </Card>
        )}

        {!snapshot.holdingCount ? (
          <EmptyDashboard />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {topSummary.map((item) => (
                <StatCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  sub={item.sub}
                  icon={item.icon}
                  accent={false}
                />
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <CardTitle>기간별 포트폴리오 변화</CardTitle>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">최근 1년 기준 누적 흐름</p>
                  </div>
                  <div className="text-right text-xs text-[var(--text-muted)]">
                    <p>최종 수익률</p>
                    <p className={clsx('mt-1 font-semibold', snapshot.totalReturnPct >= 0 ? 'positive' : 'negative')}>
                      {formatPct(snapshot.totalReturnPct, 2)}
                    </p>
                  </div>
                </CardHeader>
                <CardBody>
                  <PerformanceChart series={performanceSeries} height={280} />
                </CardBody>
              </Card>

              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <CardTitle>자산 비중 요약</CardTitle>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">카테고리별 현재 비중</p>
                  </div>
                  <div className="text-right text-xs text-[var(--text-muted)]">
                    <p>최대 보유</p>
                    <p className="mt-1 font-semibold text-[var(--text-primary)]">
                      {snapshot.biggestHolding?.name || '-'}
                    </p>
                  </div>
                </CardHeader>
                <CardBody>
                  <AllocationPie
                    data={snapshot.byCategory}
                    height={260}
                    centerLabel="현재 보유"
                    centerValue={`${snapshot.holdingCount}종목`}
                  />
                </CardBody>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <CardTitle>손익 상위 · 하위 종목</CardTitle>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">현재 보유 기준 수익률 비교</p>
                  </div>
                  <Link to="/analysis" className="text-xs font-medium text-[var(--accent)]">더 보기</Link>
                </CardHeader>
                <div className="grid gap-0 divide-y divide-[var(--border)]">
                  {[...snapshot.topGainers.slice(0, 3), ...snapshot.topLosers.slice(0, 3)].map((holding) => (
                    <div key={`${holding.accountId}-${holding.id}`} className="flex items-center gap-3 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{holding.name}</p>
                          <span className="text-xs text-[var(--text-muted)]">{holding.ticker}</span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">
                          {holding.accountName} · 비중 {holding.weight.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={clsx('text-sm font-semibold', holding.pnl >= 0 ? 'positive' : 'negative')}>
                          {formatPct(holding.pnlPct, 2)}
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">{formatSignedCurrency(holding.pnl, 'KRW')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>계좌 현황</CardTitle>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {lastPriceUpdateAt
                      ? `${new Date(lastPriceUpdateAt).toLocaleString('ko-KR')} 기준`
                      : '기본 시세 기준'}
                  </p>
                </CardHeader>
                <div className="space-y-3 px-5 py-4">
                  {snapshot.accounts.map((account) => (
                    <div key={account.id} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{account.name}</p>
                          <p className="mt-1 text-xs text-[var(--text-secondary)]">
                            {account.holdings.length}종목 · 현금 여력 {formatCurrency(account.cashBuffer, 'KRW', true)}
                          </p>
                        </div>
                        <p className={clsx('text-sm font-semibold', account.pnl >= 0 ? 'positive' : 'negative')}>
                          {formatPct(account.returnPct, 2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>최근 조회 종목</CardTitle>
                </CardHeader>
                <div className="space-y-2 px-5 py-4">
                  {(recentTickers.length ? recentTickers : snapshot.holdings.slice(0, 5).map((item) => item.ticker)).slice(0, 5).map((ticker) => {
                    const item = snapshot.holdings.find((holding) => holding.ticker === ticker)
                    return (
                      <div key={ticker} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{item?.name || ticker}</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{ticker}</p>
                      </div>
                    )
                  })}
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>관심 종목</CardTitle>
                </CardHeader>
                <div className="space-y-2 px-5 py-4">
                  {(watchlist.length ? watchlist : snapshot.holdings.slice(0, 4).map((item) => ({ ticker: item.ticker, name: item.name }))).slice(0, 5).map((item) => (
                    <div key={item.ticker} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{item.name}</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">{item.ticker}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>최근 수정 포트폴리오</CardTitle>
                </CardHeader>
                <div className="space-y-2 px-5 py-4">
                  {savedPortfolios.slice(0, 5).map((portfolio) => (
                    <div key={portfolio.id} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{portfolio.name}</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">{new Date(portfolio.updatedAt).toLocaleDateString('ko-KR')}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

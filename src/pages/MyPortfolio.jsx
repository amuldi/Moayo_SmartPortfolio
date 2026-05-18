import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BarChart3, FolderOpen, Pencil, Plus, RefreshCw, Save, Search,
  ShieldCheck, Star, Trash2, TrendingUp, Upload, WalletCards, Wifi, WifiOff,
} from 'lucide-react'
import clsx from 'clsx'
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card.jsx'
import { Button, IconButton } from '../components/ui/Button.jsx'
import { Input, Select } from '../components/ui/Input.jsx'
import usePortfolioStore from '../store/portfolioStore.js'
import { buildPortfolioSnapshot, filterAndSortHoldings } from '../features/portfolio/analytics.js'
import {
  CATEGORY_OPTIONS,
  HOLDING_SORT_OPTIONS,
  MARKET_OPTIONS,
  PERFORMANCE_FILTERS,
} from '../features/portfolio/schema.js'
import { parsePortfolioFile } from '../features/portfolio/fileImport.js'
import { AccountFormModal } from '../features/portfolio/AccountFormModal.jsx'
import { HoldingFormModal } from '../features/portfolio/HoldingFormModal.jsx'
import { formatCurrency, formatPct, formatSignedCurrency } from '../utils/formatters.js'

function SaveBanner({ saveStatus, saveError, lastSavedAt }) {
  if (saveStatus === 'idle' && !saveError) return null

  const tone =
    saveStatus === 'error'
      ? 'border-[var(--negative)] bg-[var(--negative-soft)]'
      : 'border-[var(--border)] bg-[var(--bg-card)]'

  return (
    <Card className={`px-4 py-3 ${tone}`}>
      <p className="text-xs font-medium text-[var(--text-secondary)]">
        {saveStatus === 'saving' && '변경사항을 저장 중입니다.'}
        {saveStatus === 'saved' && `변경사항이 저장되었습니다${lastSavedAt ? ` · ${new Date(lastSavedAt).toLocaleTimeString('ko-KR')}` : ''}`}
        {saveStatus === 'error' && saveError}
      </p>
    </Card>
  )
}

function PriceFeedBadge({ realtimeStatus, refreshStatus, refreshError, realtimeError, lastPriceUpdateAt }) {
  const isRealtime = realtimeStatus === 'live' || realtimeStatus === 'connected'
  const isConnecting = realtimeStatus === 'connecting' || refreshStatus === 'loading'
  const hasError = realtimeStatus === 'error' || refreshStatus === 'error'
  const Icon = isRealtime ? Wifi : WifiOff
  const label = isRealtime
    ? realtimeStatus === 'live' ? '실시간 체결 반영' : '실시간 연결됨'
    : isConnecting ? '시세 연결 중'
      : hasError ? '시세 연결 확인 필요'
        : '30초 자동 갱신'
  const updatedAt = lastPriceUpdateAt ? new Date(lastPriceUpdateAt).toLocaleTimeString('ko-KR') : null
  const tone = isRealtime
    ? 'border-[var(--positive)] bg-[var(--positive-soft)] text-[var(--positive)]'
    : hasError
      ? 'border-[var(--negative)] bg-[var(--negative-soft)] text-[var(--negative)]'
      : 'border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]'

  return (
    <div
      className={clsx('inline-flex max-w-full items-center gap-2 rounded-[var(--radius-md)] border px-3 py-1.5 text-xs font-semibold', tone)}
      title={realtimeError || refreshError || undefined}
    >
      <Icon size={13} />
      <span className="truncate">{label}</span>
      {updatedAt && <span className="shrink-0 font-medium text-[var(--text-muted)]">· {updatedAt}</span>}
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, sub, tone = 'neutral' }) {
  const toneClass = tone === 'positive' ? 'positive' : tone === 'negative' ? 'negative' : 'text-[var(--accent)]'

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--text-muted)]">{label}</p>
          <p className="mt-2 truncate text-xl font-semibold tabular-nums text-[var(--text-primary)]">{value}</p>
          {sub && <p className={clsx('mt-1 text-xs font-semibold tabular-nums', toneClass)}>{sub}</p>}
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)]">
          <Icon size={17} />
        </div>
      </div>
    </div>
  )
}

function AccountOverviewCard({ account, onEdit, onAddHolding, onDelete }) {
  const accountTone = account.pnl >= 0 ? 'positive' : 'negative'

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{account.name}</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{account.accountLabel || account.type} · {account.holdings.length}종목</p>
          </div>
          <div className="flex items-center gap-1">
            <IconButton icon={Pencil} size="sm" onClick={onEdit} />
            <IconButton icon={Trash2} size="sm" className="text-[var(--negative)]" onClick={onDelete} />
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium text-[var(--text-muted)]">평가금액</p>
        <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
          {formatCurrency(account.marketValueKRW, 'KRW', true)}
        </p>
        <p className={clsx('mt-1 text-sm font-semibold tabular-nums', accountTone)}>
          {formatSignedCurrency(account.pnl, 'KRW')} · {formatPct(account.returnPct, 2)}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] p-3">
            <p className="text-[var(--text-muted)]">투자원금</p>
            <p className="mt-1 font-semibold tabular-nums text-[var(--text-primary)]">{formatCurrency(account.totalCapital, 'KRW', true)}</p>
          </div>
          <div className="rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] p-3">
            <p className="text-[var(--text-muted)]">현금 여력</p>
            <p className="mt-1 font-semibold tabular-nums text-[var(--text-primary)]">{formatCurrency(account.cashBuffer, 'KRW', true)}</p>
          </div>
        </div>
        <Button size="sm" icon={Plus} className="mt-4 w-full" onClick={onAddHolding}>종목 추가</Button>
      </div>
    </Card>
  )
}

function HoldingsTable({ holdings, watchlist, onToggleWatchlist, onEdit, onDelete }) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)] lg:block">
        <table className="min-w-full border-separate border-spacing-0 bg-[var(--bg-card)]">
          <thead className="bg-[var(--bg-elevated)]">
            <tr className="text-left text-xs text-[var(--text-muted)]">
              {['종목', '계좌', '수량', '평균단가', '현재가', '평가금액', '손익', '비중', '메모', ''].map((label) => (
                <th key={label} className="border-b border-[var(--border)] px-4 py-3 font-semibold">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding) => (
              <tr key={`${holding.accountId}-${holding.id}`} className="text-sm transition-colors hover:bg-[var(--bg-elevated)]">
                <td className="border-b border-[var(--border-subtle)] px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => onToggleWatchlist(holding)} className={clsx(watchlist.includes(holding.ticker) ? 'text-amber-500' : 'text-[var(--text-muted)]')}>
                      <Star size={14} fill={watchlist.includes(holding.ticker) ? 'currentColor' : 'none'} />
                    </button>
                    <p className="font-semibold text-[var(--text-primary)]">{holding.name}</p>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{holding.ticker} · {holding.category}</p>
                </td>
                <td className="border-b border-[var(--border-subtle)] px-4 py-4 text-[var(--text-secondary)]">{holding.accountName}</td>
                <td className="border-b border-[var(--border-subtle)] px-4 py-4 text-[var(--text-secondary)]">{holding.quantity.toLocaleString('ko-KR')}</td>
                <td className="border-b border-[var(--border-subtle)] px-4 py-4 text-[var(--text-secondary)]">{formatCurrency(holding.avgPrice, holding.currency)}</td>
                <td className="border-b border-[var(--border-subtle)] px-4 py-4 text-[var(--text-secondary)]">{formatCurrency(holding.currentPrice, holding.currency)}</td>
                <td className="border-b border-[var(--border-subtle)] px-4 py-4 font-semibold tabular-nums text-[var(--text-primary)]">{formatCurrency(holding.marketValueKRW, 'KRW', true)}</td>
                <td className={clsx('border-b border-[var(--border-subtle)] px-4 py-4 font-semibold', holding.pnl >= 0 ? 'positive' : 'negative')}>
                  <p>{formatSignedCurrency(holding.pnl, 'KRW')}</p>
                  <p className="mt-1 text-xs">{formatPct(holding.pnlPct, 2)}</p>
                </td>
                <td className="border-b border-[var(--border-subtle)] px-4 py-4">
                  <div className="flex min-w-24 items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
                      <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${Math.min(holding.weight, 100)}%` }} />
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-[var(--text-primary)]">{holding.weight.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="border-b border-[var(--border-subtle)] px-4 py-4 text-xs text-[var(--text-secondary)]">{holding.memo || '-'}</td>
                <td className="border-b border-[var(--border-subtle)] px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <IconButton icon={Pencil} size="sm" onClick={() => onEdit(holding)} />
                    <IconButton icon={Trash2} size="sm" className="text-[var(--negative)]" onClick={() => onDelete(holding)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 lg:hidden">
        {holdings.map((holding) => (
          <Card key={`${holding.accountId}-${holding.id}`} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => onToggleWatchlist(holding)} className={clsx(watchlist.includes(holding.ticker) ? 'text-amber-500' : 'text-[var(--text-muted)]')}>
                    <Star size={14} fill={watchlist.includes(holding.ticker) ? 'currentColor' : 'none'} />
                  </button>
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{holding.name}</p>
                </div>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{holding.ticker} · {holding.accountName}</p>
              </div>
              <div className="flex gap-1">
                <IconButton icon={Pencil} size="sm" onClick={() => onEdit(holding)} />
                <IconButton icon={Trash2} size="sm" className="text-[var(--negative)]" onClick={() => onDelete(holding)} />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[var(--text-muted)]">평가금액</p>
                <p className="mt-1 font-semibold text-[var(--text-primary)]">{formatCurrency(holding.marketValueKRW, 'KRW', true)}</p>
              </div>
              <div>
                <p className="text-[var(--text-muted)]">손익</p>
                <p className={clsx('mt-1 font-semibold', holding.pnl >= 0 ? 'positive' : 'negative')}>
                  {formatSignedCurrency(holding.pnl, 'KRW')}
                </p>
              </div>
              <div>
                <p className="text-[var(--text-muted)]">수량 / 평균단가</p>
                <p className="mt-1 font-medium text-[var(--text-primary)]">
                  {holding.quantity.toLocaleString('ko-KR')} · {formatCurrency(holding.avgPrice, holding.currency)}
                </p>
              </div>
              <div>
                <p className="text-[var(--text-muted)]">비중</p>
                <p className="mt-1 font-medium text-[var(--text-primary)]">{holding.weight.toFixed(1)}%</p>
              </div>
            </div>
            {holding.memo && <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">{holding.memo}</p>}
          </Card>
        ))}
      </div>
    </>
  )
}

export default function MyPortfolio() {
  const {
    accounts,
    livePrices,
    fxRates,
    preferences,
    currentPortfolioName,
    savedPortfolios,
    hasUnsavedChanges,
    watchlist,
    setPortfolioPreferences,
    resetPortfolioPreferences,
    renameCurrentPortfolio,
    createPortfolioWorkspace,
    replaceCurrentPortfolio,
    loadPortfolioSnapshot,
    deletePortfolioSnapshot,
    addAccount,
    updateAccount,
    removeAccount,
    addToWatchlist,
    removeFromWatchlist,
    addHolding,
    updateHolding,
    removeHolding,
    refreshPrices,
    refreshStatus,
    refreshError,
    realtimeStatus,
    realtimeError,
    saveStatus,
    saveError,
    lastSavedAt,
    lastPriceUpdateAt,
  } = usePortfolioStore()

  const [accountModal, setAccountModal] = useState({ open: false, account: null })
  const [holdingModal, setHoldingModal] = useState({ open: false, accountId: null, holding: null })
  const [portfolioNameDraft, setPortfolioNameDraft] = useState(currentPortfolioName)
  const [importStatus, setImportStatus] = useState(null)
  const fileInputRef = useRef(null)

  const snapshot = useMemo(
    () => buildPortfolioSnapshot(accounts, livePrices, fxRates),
    [accounts, livePrices, fxRates]
  )

  const visibleHoldings = useMemo(
    () => filterAndSortHoldings(snapshot.holdings, preferences),
    [snapshot.holdings, preferences]
  )

  const totalCashBuffer = snapshot.accounts.reduce((sum, account) => sum + account.cashBuffer, 0)
  const targetWeightIssues = snapshot.accounts.filter((account) => {
    const totalTargetWeight = account.holdings.reduce((sum, holding) => sum + Number(holding.targetWeight || 0), 0)
    return totalTargetWeight > 0 && Math.abs(totalTargetWeight - 100) >= 0.5
  }).length

  const portfolioMetrics = [
    {
      label: '총 평가금액',
      value: formatCurrency(snapshot.totalValueKRW, 'KRW', true),
      sub: `${snapshot.accounts.length}개 계좌 · ${snapshot.holdingCount}개 종목`,
      icon: WalletCards,
    },
    {
      label: '누적 손익',
      value: formatSignedCurrency(snapshot.totalPnl, 'KRW'),
      sub: formatPct(snapshot.totalReturnPct, 2),
      icon: TrendingUp,
      tone: snapshot.totalPnl >= 0 ? 'positive' : 'negative',
    },
    {
      label: '현금성 여력',
      value: formatCurrency(totalCashBuffer, 'KRW', true),
      sub: snapshot.totalValueKRW > 0 ? `${((totalCashBuffer / snapshot.totalValueKRW) * 100).toFixed(1)}% 대기` : '대기 자금 없음',
      icon: ShieldCheck,
    },
    {
      label: '최대 보유 비중',
      value: snapshot.biggestHolding ? `${snapshot.biggestHolding.weight.toFixed(1)}%` : '0%',
      sub: snapshot.biggestHolding?.name || '대표 종목 없음',
      icon: BarChart3,
    },
  ]

  const activeAccount = holdingModal.accountId
    ? snapshot.accounts.find((account) => account.id === holdingModal.accountId)
    : null

  useEffect(() => {
    setPortfolioNameDraft(currentPortfolioName)
  }, [currentPortfolioName])

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasUnsavedChanges) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const handleSubmitAccount = (values) => {
    if (accountModal.account) updateAccount(accountModal.account.id, values)
    else addAccount(values)
  }

  const handleSubmitHolding = (values) => {
    if (!holdingModal.accountId) return
    if (holdingModal.holding) updateHolding(holdingModal.accountId, holdingModal.holding.id, values)
    else addHolding(holdingModal.accountId, values)
  }

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const imported = await parsePortfolioFile(file)
      if (accounts.length) {
        const confirmed = window.confirm('현재 포트폴리오를 파일 내용으로 교체할까요?')
        if (!confirmed) return
      }

      replaceCurrentPortfolio(imported)
      setPortfolioNameDraft(imported.name || '불러온 포트폴리오')
      setImportStatus({
        tone: 'success',
        message: `${imported.accounts.length}개 계좌를 불러왔습니다.`,
      })
    } catch (error) {
      setImportStatus({
        tone: 'error',
        message: error.message || '파일을 불러오지 못했습니다.',
      })
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-secondary)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:py-6">
        <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-[var(--text-primary)]">내 포트폴리오</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <PriceFeedBadge
                  realtimeStatus={realtimeStatus}
                  refreshStatus={refreshStatus}
                  refreshError={refreshError}
                  realtimeError={realtimeError}
                  lastPriceUpdateAt={lastPriceUpdateAt}
                />
              </div>
            </div>
            <div className="grid w-full gap-2 sm:grid-cols-2 lg:w-auto xl:grid-cols-4">
              <Button
                variant="secondary"
                size="sm"
                icon={FolderOpen}
                className="w-full lg:min-w-[132px]"
                onClick={() => createPortfolioWorkspace('새 포트폴리오')}
              >
                새 포트폴리오
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={Upload}
                className="w-full lg:min-w-[132px]"
                onClick={() => fileInputRef.current?.click()}
              >
                파일 불러오기
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                className="w-full lg:min-w-[132px]"
                loading={refreshStatus === 'loading'}
                onClick={refreshPrices}
              >
                시세 갱신
              </Button>
              <Button
                size="sm"
                icon={Plus}
                className="w-full lg:min-w-[132px]"
                onClick={() => setAccountModal({ open: true, account: null })}
              >
                계좌 추가
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv,application/json,text/csv"
                className="hidden"
                onChange={handleImportFile}
              />
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {portfolioMetrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
        </div>

        <SaveBanner saveStatus={saveStatus} saveError={saveError} lastSavedAt={lastSavedAt} />
        {importStatus && (
          <Card className={clsx(
            'px-4 py-3',
            importStatus.tone === 'error'
              ? 'border-[var(--negative)] bg-[var(--negative-soft)]'
              : 'border-[var(--positive)] bg-[var(--positive-soft)]'
          )}>
            <p className="text-sm font-medium text-[var(--text-primary)]">{importStatus.message}</p>
          </Card>
        )}

        <Card>
          <CardBody className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_136px] md:items-end">
              <Input
                className="min-w-0"
                label="포트폴리오 이름"
                value={portfolioNameDraft}
                onChange={(event) => setPortfolioNameDraft(event.target.value)}
                onBlur={() => renameCurrentPortfolio(portfolioNameDraft)}
              />
              <Button
                variant="secondary"
                icon={Save}
                className="w-full"
                onClick={() => renameCurrentPortfolio(portfolioNameDraft)}
              >
                이름 저장
              </Button>
              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-3 md:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-medium text-[var(--text-secondary)]">관리 상태</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-[var(--radius-sm)] bg-[var(--bg-card)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                      저장본 {savedPortfolios.length}개
                    </span>
                    <span className={clsx(
                      'rounded-[var(--radius-sm)] px-2.5 py-1 text-xs font-semibold',
                      targetWeightIssues ? 'bg-[var(--warning-soft)] text-[var(--warning)]' : 'bg-[var(--positive-soft)] text-[var(--positive)]'
                    )}>
                      목표 비중 {targetWeightIssues ? `${targetWeightIssues}개 점검` : '정상'}
                    </span>
                    <span className="rounded-[var(--radius-sm)] bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--accent)]">
                      분산 점수 {snapshot.diversificationScore}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="min-w-0">
              <p className="mb-1.5 text-xs font-medium text-[var(--text-secondary)]">저장된 포트폴리오</p>
              <div className="max-h-24 space-y-2 overflow-y-auto pr-1">
                {savedPortfolios.map((item) => (
                  <div key={item.id} className="flex min-h-10 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2">
                    <button type="button" onClick={() => loadPortfolioSnapshot(item.id)} className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{item.name}</p>
                    </button>
                    <span className="shrink-0 text-xs text-[var(--text-muted)]">{new Date(item.updatedAt).toLocaleDateString('ko-KR')}</span>
                    {savedPortfolios.length > 1 && (
                      <IconButton icon={Trash2} size="xs" className="text-[var(--negative)]" onClick={() => deletePortfolioSnapshot(item.id)} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {!snapshot.accounts.length ? (
          <Card className="py-14 text-center">
            <div className="mx-auto max-w-lg px-6">
              <p className="text-lg font-semibold text-[var(--text-primary)]">계좌 없음</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">첫 계좌를 추가해 포트폴리오를 시작하세요.</p>
              <div className="mt-5 flex justify-center">
                <Button icon={Plus} onClick={() => setAccountModal({ open: true, account: null })}>
                  계좌 추가
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
              {snapshot.accounts.map((account) => (
                <AccountOverviewCard
                  key={account.id}
                  account={account}
                  onEdit={() => setAccountModal({ open: true, account })}
                  onAddHolding={() => setHoldingModal({ open: true, accountId: account.id, holding: null })}
                  onDelete={() => {
                    if (window.confirm(`"${account.name}" 계좌를 삭제하시겠습니까? 보유 종목도 함께 삭제됩니다.`)) {
                      removeAccount(account.id)
                    }
                  }}
                />
              ))}
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              {snapshot.accounts.map((account) => {
                const totalTargetWeight = account.holdings.reduce((sum, holding) => sum + Number(holding.targetWeight || 0), 0)
                const isBalanced = Math.abs(totalTargetWeight - 100) < 0.5 || totalTargetWeight === 0
                return (
                  <Card key={`${account.id}-target`} className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{account.name} 목표 비중 합계</p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">
                          {totalTargetWeight === 0 ? '목표 비중 없음' : isBalanced ? '균형' : '조정 필요'}
                        </p>
                      </div>
                      <span className={clsx('text-sm font-semibold', isBalanced ? 'positive' : 'negative')}>
                        {totalTargetWeight.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                      <div
                        className={clsx('h-full rounded-full', isBalanced ? 'bg-[var(--positive)]' : 'bg-[var(--warning)]')}
                        style={{ width: `${Math.min(totalTargetWeight, 100)}%` }}
                      />
                    </div>
                  </Card>
                )
              })}
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <CardTitle>보유 종목</CardTitle>
                  </div>
                  <div className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-6">
                    <Input
                      className="xl:col-span-2"
                      label="검색"
                      value={preferences.search}
                      prefix={<Search size={14} />}
                      placeholder="종목명, 티커, 메모"
                      onChange={(event) => setPortfolioPreferences({ search: event.target.value })}
                    />
                    <Select
                      label="계좌"
                      value={preferences.accountId}
                      onChange={(event) => setPortfolioPreferences({ accountId: event.target.value })}
                    >
                      <option value="ALL">전체 계좌</option>
                      {snapshot.accounts.map((account) => (
                        <option key={account.id} value={account.id}>{account.name}</option>
                      ))}
                    </Select>
                    <Select
                      label="시장"
                      value={preferences.market}
                      onChange={(event) => setPortfolioPreferences({ market: event.target.value })}
                    >
                      {MARKET_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </Select>
                    <Select
                      label="카테고리"
                      value={preferences.category}
                      onChange={(event) => setPortfolioPreferences({ category: event.target.value })}
                    >
                      <option value="ALL">전체 카테고리</option>
                      {CATEGORY_OPTIONS.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </Select>
                    <Select
                      label="수익 상태"
                      value={preferences.performance}
                      onChange={(event) => setPortfolioPreferences({ performance: event.target.value })}
                    >
                      {PERFORMANCE_FILTERS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </Select>
                    <Select
                      label="정렬"
                      value={preferences.sortBy}
                      onChange={(event) => setPortfolioPreferences({ sortBy: event.target.value })}
                    >
                      {HOLDING_SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
                    총 {visibleHoldings.length}개 종목 · 평가금액 {formatCurrency(
                      visibleHoldings.reduce((sum, holding) => sum + holding.marketValueKRW, 0),
                      'KRW',
                      true
                    )}
                  </p>
                  <Button variant="secondary" size="sm" onClick={resetPortfolioPreferences}>필터 초기화</Button>
                </div>
              </CardHeader>
              <CardBody>
                {visibleHoldings.length ? (
                  <HoldingsTable
                    holdings={visibleHoldings}
                    watchlist={watchlist.map((item) => item.ticker)}
                    onToggleWatchlist={(holding) => {
                      if (watchlist.find((item) => item.ticker === holding.ticker)) removeFromWatchlist(holding.ticker)
                      else addToWatchlist(holding.ticker, holding.name)
                    }}
                    onEdit={(holding) => setHoldingModal({ open: true, accountId: holding.accountId, holding })}
                    onDelete={(holding) => {
                      if (window.confirm(`${holding.name} 종목을 삭제하시겠습니까?`)) {
                        removeHolding(holding.accountId, holding.id)
                      }
                    }}
                  />
                ) : (
                  <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-10 text-center">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">조건에 맞는 종목이 없습니다</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </>
        )}
      </div>

      <AccountFormModal
        open={accountModal.open}
        account={accountModal.account}
        onClose={() => setAccountModal({ open: false, account: null })}
        onSubmit={handleSubmitAccount}
      />

      <HoldingFormModal
        open={holdingModal.open}
        holding={holdingModal.holding}
        accountLabel={activeAccount?.name}
        existingTickers={activeAccount?.holdings.map((holding) => holding.ticker) || []}
        accountTotalCapital={activeAccount?.totalCapital || 0}
        onClose={() => setHoldingModal({ open: false, accountId: null, holding: null })}
        onSubmit={handleSubmitHolding}
      />

    </div>
  )
}

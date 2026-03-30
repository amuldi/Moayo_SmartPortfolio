import { useEffect, useMemo, useState } from 'react'
import {
  FolderOpen, Pencil, Plus, RefreshCw, Save, Search, Star, Trash2,
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
      <p className="text-sm font-medium text-[var(--text-primary)]">
        {saveStatus === 'saving' && '변경사항을 저장 중입니다.'}
        {saveStatus === 'saved' && `변경사항이 저장되었습니다${lastSavedAt ? ` · ${new Date(lastSavedAt).toLocaleTimeString('ko-KR')}` : ''}`}
        {saveStatus === 'error' && saveError}
      </p>
    </Card>
  )
}

function AccountOverviewCard({ account, onEdit, onAddHolding, onDelete }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{account.name}</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            {account.holdings.length}종목 · 투자원금 {formatCurrency(account.totalCapital, 'KRW', true)}
          </p>
          <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">
            {formatCurrency(account.marketValueKRW, 'KRW', true)}
          </p>
          <p className={clsx('mt-1 text-xs font-medium', account.pnl >= 0 ? 'positive' : 'negative')}>
            {formatSignedCurrency(account.pnl, 'KRW')} · {formatPct(account.returnPct, 2)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <IconButton icon={Pencil} size="sm" onClick={onEdit} />
          <IconButton icon={Trash2} size="sm" className="text-[var(--negative)]" onClick={onDelete} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] p-3">
        <div>
          <p className="text-xs text-[var(--text-muted)]">현금 여력</p>
          <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{formatCurrency(account.cashBuffer, 'KRW', true)}</p>
        </div>
        <Button size="sm" icon={Plus} onClick={onAddHolding}>종목 추가</Button>
      </div>
    </Card>
  )
}

function HoldingsTable({ holdings, watchlist, onToggleWatchlist, onEdit, onDelete }) {
  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-xs text-[var(--text-muted)]">
              {['종목', '계좌', '수량', '평균단가', '현재가', '평가금액', '손익', '비중', '메모', ''].map((label) => (
                <th key={label} className="border-b border-[var(--border)] px-4 py-3 font-medium">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding) => (
              <tr key={`${holding.accountId}-${holding.id}`} className="text-sm">
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
                <td className="border-b border-[var(--border-subtle)] px-4 py-4 font-medium text-[var(--text-primary)]">{formatCurrency(holding.marketValueKRW, 'KRW', true)}</td>
                <td className={clsx('border-b border-[var(--border-subtle)] px-4 py-4 font-semibold', holding.pnl >= 0 ? 'positive' : 'negative')}>
                  <p>{formatSignedCurrency(holding.pnl, 'KRW')}</p>
                  <p className="mt-1 text-xs">{formatPct(holding.pnlPct, 2)}</p>
                </td>
                <td className="border-b border-[var(--border-subtle)] px-4 py-4 text-[var(--text-secondary)]">{holding.weight.toFixed(1)}%</td>
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
    preferences,
    currentPortfolioName,
    savedPortfolios,
    hasUnsavedChanges,
    watchlist,
    setPortfolioPreferences,
    resetPortfolioPreferences,
    renameCurrentPortfolio,
    createPortfolioWorkspace,
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
    saveStatus,
    saveError,
    lastSavedAt,
  } = usePortfolioStore()

  const [accountModal, setAccountModal] = useState({ open: false, account: null })
  const [holdingModal, setHoldingModal] = useState({ open: false, accountId: null, holding: null })
  const [portfolioNameDraft, setPortfolioNameDraft] = useState(currentPortfolioName)

  const snapshot = useMemo(
    () => buildPortfolioSnapshot(accounts, livePrices),
    [accounts, livePrices]
  )

  const visibleHoldings = useMemo(
    () => filterAndSortHoldings(snapshot.holdings, preferences),
    [snapshot.holdings, preferences]
  )

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

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">내 포트폴리오</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              계좌와 보유 종목을 정리하고 손익을 확인합니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={FolderOpen}
              onClick={() => createPortfolioWorkspace(prompt('새 포트폴리오 이름을 입력하세요.', '새 포트폴리오') || '새 포트폴리오')}
            >
              새 포트폴리오
            </Button>
            <Button
              variant="secondary"
              icon={RefreshCw}
              loading={refreshStatus === 'loading'}
              onClick={refreshPrices}
            >
              시세 새로고침
            </Button>
            <Button icon={Plus} onClick={() => setAccountModal({ open: true, account: null })}>
              계좌 추가
            </Button>
          </div>
        </div>

        <SaveBanner saveStatus={saveStatus} saveError={saveError} lastSavedAt={lastSavedAt} />

        <Card>
          <CardBody className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <Input
                label="포트폴리오 이름"
                value={portfolioNameDraft}
                onChange={(event) => setPortfolioNameDraft(event.target.value)}
                onBlur={() => renameCurrentPortfolio(portfolioNameDraft)}
              />
              <div className="flex items-end gap-2">
                <Button variant="secondary" icon={Save} onClick={() => renameCurrentPortfolio(portfolioNameDraft)}>
                  이름 저장
                </Button>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">저장된 포트폴리오</p>
              <div className="max-h-28 space-y-2 overflow-y-auto">
                {savedPortfolios.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2">
                    <button type="button" onClick={() => loadPortfolioSnapshot(item.id)} className="min-w-0 flex-1 text-left">
                      <p className="truncate text-xs font-semibold text-[var(--text-primary)]">{item.name}</p>
                      <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{new Date(item.updatedAt).toLocaleDateString('ko-KR')}</p>
                    </button>
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
          <Card className="py-16 text-center">
            <div className="mx-auto max-w-xl px-6">
            <p className="text-lg font-semibold text-[var(--text-primary)]">아직 등록된 계좌가 없습니다</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              계좌를 만든 뒤 종목을 추가하면 평가금액, 손익, 비중, 오늘 변동이 자동으로 연결됩니다.
            </p>
            <Button className="mt-5" icon={Plus} onClick={() => setAccountModal({ open: true, account: null })}>
              첫 계좌 만들기
            </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

            <div className="grid gap-4 lg:grid-cols-2">
              {snapshot.accounts.map((account) => {
                const totalTargetWeight = account.holdings.reduce((sum, holding) => sum + Number(holding.targetWeight || 0), 0)
                const isBalanced = Math.abs(totalTargetWeight - 100) < 0.5 || totalTargetWeight === 0
                return (
                  <Card key={`${account.id}-target`} className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{account.name} 목표 비중 합계</p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">
                          {totalTargetWeight === 0 ? '아직 목표 비중이 설정되지 않았습니다.' : '종목별 목표 비중 합계가 100%인지 확인하세요.'}
                        </p>
                      </div>
                      <span className={clsx('text-sm font-semibold', isBalanced ? 'positive' : 'negative')}>
                        {totalTargetWeight.toFixed(1)}%
                      </span>
                    </div>
                  </Card>
                )
              })}
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <CardTitle>보유 종목 관리</CardTitle>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">검색, 필터, 수정, 삭제를 한 화면에서 처리합니다.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <Input
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
                    <div className="grid grid-cols-2 gap-3">
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
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-[var(--text-secondary)]">
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
                    <p className="mt-2 text-xs text-[var(--text-secondary)]">검색어나 필터를 조정하거나, 계좌에 새 종목을 추가해 보세요.</p>
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

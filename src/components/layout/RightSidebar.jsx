import { useState, useMemo } from 'react'
import { Plus, ChevronRight, Star, StarOff, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AddAssetModal } from '../portfolio/AddAssetModal.jsx'
import usePortfolioStore from '../../store/portfolioStore.js'
import { ASSET_UNIVERSE, getAssetInfo } from '../../services/mockData.js'
import { formatKRW, formatPct, getReturnColor, CHART_COLORS } from '../../utils/formatters.js'
import clsx from 'clsx'

// ── 관심종목 추가 검색 ──────────────────────────────────
function WatchlistSearch({ onAdd, existing }) {
  const [q, setQ] = useState('')
  const results = useMemo(() => {
    if (!q) return []
    return ASSET_UNIVERSE
      .filter((a) => a.ticker.toLowerCase().includes(q.toLowerCase()) || a.name.includes(q))
      .slice(0, 6)
  }, [q])

  return (
    <div className="px-3 pb-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="종목명 또는 티커 검색..."
        className="w-full h-8 px-3 text-xs rounded-lg border outline-none"
        style={{
          background: 'var(--bg-elevated)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
        }}
      />
      {results.length > 0 && (
        <div
          className="mt-1.5 rounded-xl border overflow-hidden"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          {results.map((a) => {
            const already = existing.includes(a.ticker)
            return (
              <button
                key={a.ticker}
                onClick={() => { if (!already) { onAdd(a.ticker, a.name); setQ('') } }}
                disabled={already}
                className="w-full flex items-center justify-between px-3 py-2 text-left border-b last:border-0 transition-colors"
                style={{
                  borderColor: 'var(--border-subtle)',
                  opacity: already ? 0.45 : 1,
                }}
                onMouseEnter={(e) => { if (!already) e.currentTarget.style.background = 'var(--bg-elevated)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{a.name}</p>
                  <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{a.ticker}</p>
                </div>
                {already
                  ? <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>추가됨</span>
                  : <Star size={12} style={{ color: 'var(--accent)' }} />
                }
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── 메인 사이드바 ───────────────────────────────────────
export function RightSidebar({ selectedTicker, onSelectTicker }) {
  const {
    accounts, getAggregatedHoldings, addHolding,
    livePrices, watchlist, addToWatchlist, removeFromWatchlist,
  } = usePortfolioStore()
  const [tab, setTab] = useState('holdings') // 'holdings' | 'watchlist'
  const [showAddModal, setShowAddModal] = useState(false)

  const totalCapital = useMemo(
    () => accounts.reduce((s, a) => s + a.totalCapital, 0),
    [accounts]
  )

  const holdings = useMemo(() => getAggregatedHoldings(), [accounts])

  const totalReturn = useMemo(() => {
    if (!holdings.length) return null
    let weighted = 0; let covered = 0
    holdings.forEach((h) => {
      const q = livePrices[h.ticker]
      if (q?.changePct != null && !q.error) {
        weighted += q.changePct * (h.allocation / 100)
        covered  += h.allocation
      }
    })
    return covered > 0 ? weighted : null
  }, [holdings, livePrices])

  const existingTickers = holdings.map((h) => h.ticker)

  const handleAdd = (asset) => {
    const firstAccount = accounts[0]
    if (firstAccount) addHolding(firstAccount.id, asset)
  }

  return (
    <aside
      className="w-72 shrink-0 border-l flex flex-col h-full overflow-hidden"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
    >
      {/* ── 헤더: 총 평가금액 ─────────────────────────── */}
      <div className="px-4 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-0.5">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>내 자산</h2>
          <Link
            to="/portfolio"
            className="flex items-center gap-0.5 text-xs hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            관리 <ChevronRight size={11} />
          </Link>
        </div>
        <p className="text-2xl font-bold leading-tight mt-2" style={{ color: 'var(--text-primary)' }}>
          {formatKRW(totalCapital, true)}
        </p>
        {totalReturn != null ? (
          <p className={clsx('text-xs font-medium mt-0.5', totalReturn >= 0 ? 'positive' : 'negative')}>
            {formatPct(totalReturn, 2, true)} 오늘
          </p>
        ) : (
          <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
            시세 로딩 중...
          </p>
        )}
      </div>

      {/* ── 탭 ────────────────────────────────────────── */}
      <div
        className="flex border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}
      >
        {[
          { id: 'holdings',  label: `보유 (${holdings.length})` },
          { id: 'watchlist', label: `관심 (${watchlist.length})` },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex-1 py-2.5 text-xs font-medium transition-all"
            style={{
              color: tab === id ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent',
              background: 'transparent',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── 보유 탭 ───────────────────────────────────── */}
      {tab === 'holdings' && (
        <>
          <div className="flex-1 overflow-y-auto">
            {holdings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>보유 종목 없음</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  포트폴리오에 종목을 추가해보세요
                </p>
              </div>
            ) : (
              holdings
                .sort((a, b) => b.allocation - a.allocation)
                .map((holding, i) => {
                  const q = livePrices[holding.ticker]
                  const ret = q?.changePct ?? null
                  const price = q?.price ?? null
                  const isSelected = selectedTicker === holding.ticker
                  const retColor = ret != null ? getReturnColor(ret) : 'var(--text-muted)'
                  const isKRW = q?.currency === 'KRW' || /^\d{6}$/.test(holding.ticker)

                  return (
                    <button
                      key={holding.ticker}
                      onClick={() => onSelectTicker(holding.ticker)}
                      className={clsx(
                        'w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-100',
                        'border-b last:border-0',
                        isSelected ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--bg-elevated)]'
                      )}
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className="text-xs font-semibold truncate"
                            style={{ color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}
                          >
                            {holding.name}
                          </span>
                          <span className="text-xs font-semibold shrink-0 ml-2" style={{ color: retColor }}>
                            {ret != null ? formatPct(ret, 2, true) : '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            {price != null
                              ? isKRW ? `₩${price.toLocaleString('ko-KR')}` : `$${price.toFixed(2)}`
                              : `비중 ${holding.allocation.toFixed(1)}%`
                            }
                          </span>
                          <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                            {formatKRW(holding.value, true)}
                          </span>
                        </div>
                        <div className="mt-1.5 h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, holding.allocation)}%`,
                              background: CHART_COLORS[i % CHART_COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    </button>
                  )
                })
            )}
          </div>

          <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center justify-center gap-1.5 h-9 rounded-[var(--radius-md)] text-xs font-medium border border-dashed transition-all duration-150"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.color = 'var(--accent)'
                e.currentTarget.style.background = 'var(--accent-soft)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <Plus size={13} />
              종목 추가
            </button>
          </div>
        </>
      )}

      {/* ── 관심종목 탭 ───────────────────────────────── */}
      {tab === 'watchlist' && (
        <>
          <WatchlistSearch
            onAdd={addToWatchlist}
            existing={watchlist.map((w) => w.ticker)}
          />
          <div className="flex-1 overflow-y-auto">
            {watchlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Star size={24} style={{ color: 'var(--text-muted)' }} className="mb-2" />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  위 검색창에서 종목을 추가하세요
                </p>
              </div>
            ) : (
              watchlist.map((item) => {
                const q = livePrices[item.ticker]
                const price = q?.price ?? null
                const ret = q?.changePct ?? null
                const isSelected = selectedTicker === item.ticker
                const retColor = ret != null ? getReturnColor(ret) : 'var(--text-muted)'
                const isKRW = q?.currency === 'KRW' || /^\d{6}$/.test(item.ticker)
                const info = getAssetInfo(item.ticker)

                return (
                  <div
                    key={item.ticker}
                    className="flex items-center gap-2 px-4 py-3 border-b last:border-0 group"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <button
                      onClick={() => onSelectTicker(item.ticker)}
                      className="flex-1 flex items-center justify-between text-left"
                    >
                      <div>
                        <p
                          className="text-xs font-semibold"
                          style={{ color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}
                        >
                          {item.name}
                        </p>
                        <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {item.ticker}
                          {info?.sector ? ` · ${info.sector}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {price != null ? (isKRW ? `₩${price.toLocaleString('ko-KR')}` : `$${price.toFixed(2)}`) : '—'}
                        </p>
                        <p className="text-[11px] font-medium" style={{ color: retColor }}>
                          {ret != null ? formatPct(ret, 2, true) : '—'}
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => removeFromWatchlist(item.ticker)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--negative)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <X size={12} />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}

      <AddAssetModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAdd}
        existingTickers={existingTickers}
      />
    </aside>
  )
}

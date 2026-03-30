import { useState } from 'react'
import { Search, PlusCircle } from 'lucide-react'
import { Modal } from '../ui/Modal.jsx'
import { Button } from '../ui/Button.jsx'
import { Input, Select } from '../ui/Input.jsx'
import { ASSET_UNIVERSE } from '../../services/mockData.js'
import clsx from 'clsx'

const ASSET_CLASS_KO = { equity: '주식', bond: '채권', commodity: '원자재', cash: '현금' }

const REGION_OPTIONS = ['미국', '국내', '글로벌', '유럽', '일본', '중국', '대만', '인도', '캐나다', '기타']
const ASSET_CLASS_OPTIONS = ['equity', 'bond', 'commodity', 'cash']

const EMPTY_MANUAL = {
  ticker: '', name: '', sector: '', region: '미국',
  assetClass: 'equity', currency: 'USD', annualReturn: '', volatility: '', expenseRatio: '',
}

export function AddAssetModal({ open, onClose, onAdd, existingTickers = [] }) {
  const [query,      setQuery]      = useState('')
  const [selected,   setSelected]   = useState(null)
  const [allocation, setAllocation] = useState('')
  const [manual,     setManual]     = useState(false)
  const [manualForm, setManualForm] = useState(EMPTY_MANUAL)

  const filtered = (() => {
    // Strip Korean stock "A" prefix (e.g. A161510 → 161510)
    const q = query.replace(/^a(\d{6})$/i, '$1').toLowerCase()
    const matches = ASSET_UNIVERSE.filter((a) => {
      if (!q) return true
      return a.ticker.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
    })
    if (!q) return matches.slice(0, 100)
    // Sort: ticker exact match first, then ticker starts-with, then rest
    matches.sort((a, b) => {
      const at = a.ticker.toLowerCase(), bt = b.ticker.toLowerCase()
      if (at === q && bt !== q) return -1
      if (bt === q && at !== q) return 1
      if (at.startsWith(q) && !bt.startsWith(q)) return -1
      if (bt.startsWith(q) && !at.startsWith(q)) return 1
      return 0
    })
    return matches.slice(0, 100)
  })()

  const handleAdd = () => {
    if (!selected || !allocation) return
    onAdd({
      ticker:     selected.ticker,
      name:       selected.name,
      sector:     selected.sector,
      region:     selected.region,
      assetClass: selected.assetClass,
      allocation: parseFloat(allocation),
    })
    reset()
  }

  const handleManualAdd = () => {
    if (!manualForm.ticker || !manualForm.name || !allocation) return
    onAdd({
      ticker:     manualForm.ticker.toUpperCase().trim(),
      name:       manualForm.name.trim(),
      sector:     manualForm.sector || '기타',
      region:     manualForm.region,
      assetClass: manualForm.assetClass,
      allocation: parseFloat(allocation),
    })
    reset()
  }

  const reset = () => {
    setSelected(null); setQuery(''); setAllocation('')
    setManual(false); setManualForm(EMPTY_MANUAL)
    onClose()
  }

  const switchToManual = () => {
    // pre-fill ticker with the current query if it looks like a ticker
    setManualForm({ ...EMPTY_MANUAL, ticker: query.toUpperCase() })
    setManual(true)
  }

  return (
    <Modal
      open={open}
      onClose={reset}
      title={manual ? '직접 종목 입력' : '종목 추가'}
      footer={
        manual ? (
          <>
            <Button variant="secondary" onClick={() => setManual(false)}>목록으로</Button>
            <Button onClick={handleManualAdd} disabled={!manualForm.ticker || !manualForm.name || !allocation}>
              포트폴리오에 추가
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={reset}>취소</Button>
            <Button onClick={handleAdd} disabled={!selected || !allocation}>
              포트폴리오에 추가
            </Button>
          </>
        )
      }
    >
      {manual ? (
        /* ── 직접 입력 폼 ─────────────────────────────────── */
        <div className="flex flex-col gap-3">
          <div className="p-3 rounded-[var(--radius-md)] bg-[var(--accent-soft)] border border-[var(--accent)]/20">
            <p className="text-xs text-[var(--text-secondary)]">
              목록에 없는 종목을 직접 입력합니다. 티커와 종목명은 필수입니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="티커 심볼 *"
              placeholder="예: SCHG"
              value={manualForm.ticker}
              onChange={(e) => setManualForm({ ...manualForm, ticker: e.target.value.toUpperCase() })}
            />
            <Input
              label="종목명 *"
              placeholder="예: Schwab US Large-Cap Growth"
              value={manualForm.name}
              onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="자산군"
              value={manualForm.assetClass}
              onChange={(e) => setManualForm({ ...manualForm, assetClass: e.target.value })}
            >
              {ASSET_CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>{ASSET_CLASS_KO[c]}</option>
              ))}
            </Select>
            <Select
              label="지역"
              value={manualForm.region}
              onChange={(e) => setManualForm({ ...manualForm, region: e.target.value })}
            >
              {REGION_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
          </div>
          <Input
            label="섹터 (선택)"
            placeholder="예: IT·테크, 반도체, 헬스케어"
            value={manualForm.sector}
            onChange={(e) => setManualForm({ ...manualForm, sector: e.target.value })}
          />
          <Input
            label="배분 비중 (%)"
            type="number"
            min="0.1" max="100" step="0.5"
            placeholder="예: 20"
            suffix="%"
            value={allocation}
            onChange={(e) => setAllocation(e.target.value)}
          />
        </div>
      ) : (
        /* ── 검색 + 목록 ──────────────────────────────────── */
        <div className="flex flex-col gap-4">
          {/* 검색 */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              placeholder="종목명 또는 티커 검색 (예: SCHG, BOTZ, 삼성전자)..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null) }}
              className={clsx(
                'w-full h-9 pl-8 pr-3 text-sm outline-none rounded-[var(--radius-md)]',
                'bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)]',
                'placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] transition-colors'
              )}
            />
          </div>

          {/* 종목 목록 */}
          <div className="flex flex-col gap-0.5 max-h-56 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((asset) => {
                const isExisting = existingTickers.includes(asset.ticker)
                const isSelected = selected?.ticker === asset.ticker
                return (
                  <button
                    key={asset.ticker}
                    onClick={() => !isExisting && setSelected(asset)}
                    disabled={isExisting}
                    className={clsx(
                      'flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-md)] text-left border transition-all',
                      isSelected  ? 'bg-[var(--accent-soft)] border-[var(--accent)]' :
                      isExisting  ? 'opacity-40 cursor-not-allowed border-transparent' :
                                    'hover:bg-[var(--bg-elevated)] border-transparent'
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-[var(--text-primary)]">
                          {asset.ticker}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                          {ASSET_CLASS_KO[asset.assetClass] || asset.assetClass}
                        </span>
                        {isExisting && (
                          <span className="text-[10px] text-[var(--text-muted)]">이미 추가됨</span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{asset.name}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className={clsx(
                        'text-xs font-semibold',
                        asset.annualReturn >= 0 ? 'positive' : 'negative'
                      )}>
                        {asset.annualReturn >= 0 ? '+' : ''}{asset.annualReturn.toFixed(1)}%/년
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)]">{asset.region}</p>
                    </div>
                  </button>
                )
              })
            ) : (
              /* 검색 결과 없을 때 */
              <div className="flex flex-col items-center gap-3 py-8">
                <p className="text-sm text-[var(--text-muted)]">
                  {query ? `"${query}" 검색 결과가 없습니다` : '종목을 검색하세요'}
                </p>
                {query && (
                  <button
                    onClick={switchToManual}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all',
                      'bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-[var(--accent)]',
                      'hover:bg-[var(--accent)] hover:text-white'
                    )}
                  >
                    <PlusCircle size={14} />
                    "{query.toUpperCase()}" 직접 입력하기
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 직접 입력 링크 (항상 표시) */}
          {filtered.length > 0 && (
            <button
              onClick={switchToManual}
              className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors self-start"
            >
              <PlusCircle size={12} />
              목록에 없는 종목 직접 입력
            </button>
          )}

          {/* 비중 입력 */}
          {selected && (
            <div className="p-3 rounded-[var(--radius-md)] bg-[var(--accent-soft)] border border-[var(--accent)]/30">
              <p className="text-xs font-semibold text-[var(--accent)] mb-2">{selected.name}</p>
              <Input
                label="배분 비중 (%)"
                type="number"
                min="0.1" max="100" step="0.5"
                placeholder="예: 20"
                suffix="%"
                value={allocation}
                onChange={(e) => setAllocation(e.target.value)}
              />
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

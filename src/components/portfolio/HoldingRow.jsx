import { useState } from 'react'
import { Trash2, ChevronDown } from 'lucide-react'
import { IconButton } from '../ui/Button.jsx'
import { formatKRW, formatPct, getReturnColor, CHART_COLORS } from '../../utils/formatters.js'
import { getAssetInfo } from '../../services/mockData.js'
import clsx from 'clsx'

const ASSET_CLASS_KO = { equity: '주식', bond: '채권', commodity: '원자재', cash: '현금' }

export function HoldingRow({ holding, accountCapital, onRemove, onAllocationChange, index = 0, quote = null }) {
  const [expanded, setExpanded] = useState(false)
  const info  = getAssetInfo(holding.ticker)
  const value = (holding.allocation / 100) * accountCapital

  // 실시간 시세가 있으면 사용, 없으면 '-' 표시
  const hasQuote = quote && !quote.error
  const changePct   = hasQuote ? quote.changePct : null
  const currentPrice = hasQuote ? quote.price : null
  const retColor = changePct != null ? getReturnColor(changePct) : 'var(--text-muted)'

  return (
    <div className="border-b border-[var(--border-subtle)] last:border-0">
      {/* 메인 행 */}
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors group">
        {/* 펼치기 */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] shrink-0"
        >
          <ChevronDown
            size={13}
            className={clsx('transition-transform duration-150', expanded && 'rotate-180')}
          />
        </button>

        {/* 색상 도트 */}
        <div
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
        />

        {/* 종목 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[var(--text-primary)] truncate">{holding.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] shrink-0">
              {ASSET_CLASS_KO[holding.assetClass] || holding.assetClass}
            </span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)] font-mono">{holding.ticker}</span>
        </div>

        {/* 현재가 / 등락 */}
        <div className="text-right shrink-0 w-20">
          {hasQuote ? (
            <>
              <p className="text-xs font-semibold" style={{ color: retColor }}>
                {changePct >= 0 ? '+' : ''}{changePct?.toFixed(2)}%
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">
                {info.currency === 'KRW'
                  ? formatKRW(currentPrice, true)
                  : `$${currentPrice?.toFixed(2)}`}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-[var(--text-muted)]">—</p>
              <p className="text-[10px] text-[var(--text-muted)]">{formatKRW(value, true)}</p>
            </>
          )}
        </div>

        {/* 비중 슬라이더 */}
        <div className="flex items-center gap-1.5 shrink-0 w-28">
          <input
            type="range"
            min="0" max="100" step="0.5"
            value={holding.allocation}
            onChange={(e) => onAllocationChange(parseFloat(e.target.value))}
            style={{
              background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${holding.allocation}%, var(--border) ${holding.allocation}%, var(--border) 100%)`,
            }}
            className="w-full"
          />
          <span className="text-xs font-medium text-[var(--text-primary)] w-8 text-right">
            {holding.allocation.toFixed(0)}%
          </span>
        </div>

        {/* 삭제 */}
        <IconButton
          icon={Trash2}
          size="xs"
          variant="ghost"
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 text-[var(--negative)] hover:bg-[var(--negative-soft)]"
        />
      </div>

      {/* 펼침: 상세 정보 */}
      {expanded && (
        <div className="px-10 py-3 bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)] grid grid-cols-3 gap-4">
          {[
            { label: '현재가',
              value: hasQuote
                ? (info.currency === 'KRW' ? formatKRW(currentPrice, true) : `$${currentPrice?.toFixed(2)}`)
                : '시세 미조회',
              color: 'var(--text-primary)' },
            { label: '당일 등락',
              value: hasQuote ? `${changePct >= 0 ? '+' : ''}${changePct?.toFixed(2)}%` : '—',
              color: hasQuote ? retColor : 'var(--text-muted)' },
            { label: '지역', value: info.region, color: 'var(--text-primary)' },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[10px] text-[var(--text-muted)] mb-0.5">{item.label}</p>
              <p className="text-xs font-semibold" style={{ color: item.color }}>{item.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

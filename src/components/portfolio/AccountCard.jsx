import { useState } from 'react'
import { Plus, Pencil, Check, X, AlertTriangle, ShieldCheck } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '../ui/Card.jsx'
import { Button, IconButton } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { HoldingRow } from './HoldingRow.jsx'
import { AddAssetModal } from './AddAssetModal.jsx'
import { AllocationBar } from '../charts/AllocationPie.jsx'
import { formatKRW } from '../../utils/formatters.js'
import { ACCOUNT_TYPES } from '../../services/mockData.js'
import usePortfolioStore from '../../store/portfolioStore.js'
import clsx from 'clsx'

export function AccountCard({ account, quotes = {} }) {
  const { updateAccount, updateHolding, removeHolding, addHolding, removeAccount } = usePortfolioStore()
  const [showAddModal,    setShowAddModal]    = useState(false)
  const [editingCapital,  setEditingCapital]  = useState(false)
  const [capitalDraft,    setCapitalDraft]    = useState('')

  const meta  = ACCOUNT_TYPES[account.type] || {}
  const total = account.holdings.reduce((s, h) => s + h.allocation, 0)
  const isValid = Math.abs(total - 100) < 0.5

  const handleSaveCapital = () => {
    const v = parseFloat(capitalDraft.replace(/,/g, ''))
    if (!isNaN(v) && v > 0) updateAccount(account.id, { totalCapital: v })
    setEditingCapital(false)
  }

  const pieData = account.holdings.map((h) => ({ name: h.ticker, value: h.allocation }))

  return (
    <Card className="overflow-hidden">
      {/* 계좌 색상 바 */}
      <div className="h-1" style={{ background: meta.color || 'var(--accent)' }} />

      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: meta.color }}
            >
              {account.type === 'PENSION' ? '연' : account.type === 'BROKERAGE' ? '종' : account.type[0]}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{account.name}</p>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: `${meta.color}20`, color: meta.color }}
                >
                  {meta.label}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{meta.desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="secondary" size="sm" icon={Plus} onClick={() => setShowAddModal(true)}>
              추가
            </Button>
            <IconButton
              icon={X}
              size="sm"
              variant="ghost"
              className="text-[var(--text-muted)] hover:text-[var(--negative)]"
              onClick={() => {
                if (confirm(`"${account.name}" 계좌를 삭제하시겠습니까?`)) removeAccount(account.id)
              }}
            />
          </div>
        </div>

        {/* 투자금 */}
        <div className="mt-3 flex items-center gap-2">
          {editingCapital ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={capitalDraft}
                onChange={(e) => setCapitalDraft(e.target.value)}
                prefix="₩"
                placeholder="0"
                className="flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveCapital()
                  if (e.key === 'Escape') setEditingCapital(false)
                }}
              />
              <IconButton icon={Check} size="sm" variant="success" onClick={handleSaveCapital} />
              <IconButton icon={X}     size="sm" variant="ghost"   onClick={() => setEditingCapital(false)} />
            </div>
          ) : (
            <button
              onClick={() => { setCapitalDraft(account.totalCapital.toString()); setEditingCapital(true) }}
              className="flex items-center gap-1.5 group"
            >
              <span className="text-xl font-bold text-[var(--text-primary)]">
                {formatKRW(account.totalCapital, true)}
              </span>
              <Pencil size={11} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}

          {/* 비중 합계 */}
          <div className={clsx(
            'ml-auto flex items-center gap-1 text-xs font-medium',
            isValid ? 'text-[var(--positive)]' : 'text-[var(--negative)]'
          )}>
            {isValid ? <ShieldCheck size={11} /> : <AlertTriangle size={11} />}
            {total.toFixed(1)}%
          </div>
        </div>

        {/* 비중 바 */}
        {account.holdings.length > 0 && (
          <div className="mt-2">
            <AllocationBar data={pieData} height={8} />
          </div>
        )}
      </div>

      {/* 종목 목록 */}
      {account.holdings.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-xs text-[var(--text-muted)]">보유 종목 없음</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs text-[var(--accent)] hover:underline mt-1"
          >
            첫 종목 추가하기
          </button>
        </div>
      ) : (
        account.holdings.map((h, i) => (
          <HoldingRow
            key={h.id}
            holding={h}
            accountCapital={account.totalCapital}
            index={i}
            onRemove={() => removeHolding(account.id, h.id)}
            onAllocationChange={(val) => updateHolding(account.id, h.id, { allocation: val })}
            quote={quotes[h.ticker]}
          />
        ))
      )}

      <AddAssetModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(asset) => addHolding(account.id, asset)}
        existingTickers={account.holdings.map((h) => h.ticker)}
      />
    </Card>
  )
}

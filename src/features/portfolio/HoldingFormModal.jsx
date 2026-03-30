import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import clsx from 'clsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input, Select } from '../../components/ui/Input.jsx'
import { ASSET_UNIVERSE, getAssetInfo } from '../../services/mockData.js'
import { CATEGORY_OPTIONS, validateHoldingInput } from './schema.js'
import usePortfolioStore from '../../store/portfolioStore.js'

const initialForm = {
  ticker: '',
  name: '',
  sector: '',
  region: '국내',
  market: '국내',
  assetClass: 'equity',
  currency: 'KRW',
  category: '국내주식',
  inputMode: 'quantity',
  quantity: '',
  avgPrice: '',
  targetWeight: '',
  memo: '',
}

function assetToForm(asset, holding) {
  return {
    ticker: asset.ticker,
    name: asset.name,
    sector: asset.sector,
    region: asset.region,
    market: asset.region === '국내' ? '국내' : asset.region === '미국' ? '미국' : '글로벌',
    assetClass: asset.assetClass,
    currency: asset.currency,
    category: holding?.category || (asset.expenseRatio > 0 ? 'ETF' : asset.region === '미국' ? '미국주식' : asset.region === '국내' ? '국내주식' : '기타'),
    inputMode: holding?.targetWeight ? 'weight' : 'quantity',
    quantity: holding ? String(holding.quantity) : '',
    avgPrice: holding ? String(holding.avgPrice) : String(asset.price || ''),
    targetWeight: holding?.targetWeight ? String(holding.targetWeight) : '',
    memo: holding?.memo || '',
  }
}

export function HoldingFormModal({
  open,
  holding,
  onClose,
  onSubmit,
  existingTickers = [],
  accountLabel,
  accountTotalCapital = 0,
}) {
  const { recordRecentTicker } = usePortfolioStore()
  const [query, setQuery] = useState('')
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const deferredQuery = useDeferredValue(query)

  useEffect(() => {
    if (!open) return
    if (holding) {
      const asset = getAssetInfo(holding.ticker)
      setForm(assetToForm(asset, holding))
      setQuery(`${holding.name} ${holding.ticker}`)
    } else {
      setForm(initialForm)
      setQuery('')
    }
    setErrors({})
  }, [open, holding])

  const results = useMemo(() => {
    const value = deferredQuery.trim().toLowerCase()
    if (!value) return ASSET_UNIVERSE.slice(0, 12)

    return ASSET_UNIVERSE.filter((asset) => {
      return (
        asset.ticker.toLowerCase().includes(value) ||
        asset.name.toLowerCase().includes(value) ||
        asset.sector.toLowerCase().includes(value)
      )
    }).slice(0, 12)
  }, [deferredQuery])

  const handlePickAsset = (ticker) => {
    const asset = getAssetInfo(ticker)
    recordRecentTicker(ticker)
    setForm((current) => ({
      ...current,
      ...assetToForm(asset),
      quantity: current.quantity,
      avgPrice: current.avgPrice || String(asset.price || ''),
      memo: current.memo,
    }))
    setErrors((current) => ({ ...current, ticker: null, name: null }))
  }

  const handleSubmit = () => {
    const draft = { ...form }
    if ((draft.inputMode || 'quantity') === 'weight') {
      const computedQuantity = Number(draft.avgPrice) > 0
        ? (accountTotalCapital * (Number(draft.targetWeight || 0) / 100)) / Number(draft.avgPrice)
        : 0
      draft.quantity = String(computedQuantity)
    }

    const result = validateHoldingInput(draft)
    const isDuplicate =
      !holding &&
      existingTickers.includes(result.values.ticker)

    if (!result.isValid || isDuplicate) {
      setErrors({
        ...result.errors,
        ...(isDuplicate ? { ticker: '이미 같은 계좌에 추가된 종목입니다.' } : {}),
      })
      return
    }

    onSubmit(result.values)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={holding ? '보유 종목 수정' : `${accountLabel || '계좌'}에 종목 추가`}
      width="max-w-3xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button onClick={handleSubmit}>{holding ? '수정 반영' : '종목 저장'}</Button>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
              종목 검색
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="티커, 종목명, 섹터로 검색"
                className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)]"
              />
            </div>
            {errors.ticker && <p className="mt-1 text-xs text-[var(--negative)]">{errors.ticker}</p>}
          </div>

          <div className="max-h-72 space-y-1 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-2">
            {results.map((asset) => {
              const disabled = !holding && existingTickers.includes(asset.ticker)
              const active = form.ticker === asset.ticker

              return (
                <button
                  key={asset.ticker}
                  type="button"
                  disabled={disabled}
                  onClick={() => handlePickAsset(asset.ticker)}
                  className={clsx(
                    'w-full rounded-[var(--radius-md)] border px-3 py-2 text-left transition-all',
                    active
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'border-transparent hover:border-[var(--border)] hover:bg-[var(--bg-card)]',
                    disabled && 'cursor-not-allowed opacity-40'
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{asset.name}</p>
                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">{asset.ticker} · {asset.region} · {asset.sector}</p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-[var(--text-secondary)]">
                      {asset.currency === 'KRW' ? '원화' : asset.currency}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="티커" value={form.ticker} error={errors.ticker} readOnly />
            <Input label="종목명" value={form.name} error={errors.name} readOnly />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="입력 기준"
              value={form.inputMode}
              onChange={(event) => setForm((current) => ({ ...current, inputMode: event.target.value }))}
            >
              <option value="quantity">수량 기준</option>
              <option value="weight">비중 기준</option>
            </Select>
            <Input
              label={form.inputMode === 'weight' ? '목표 비중' : '보유 수량'}
              type="number"
              min="0"
              step={form.inputMode === 'weight' ? '0.1' : '0.0001'}
              value={form.inputMode === 'weight' ? form.targetWeight : form.quantity}
              error={form.inputMode === 'weight' ? errors.targetWeight : errors.quantity}
              suffix={form.inputMode === 'weight' ? '%' : undefined}
              onChange={(event) => setForm((current) => ({
                ...current,
                [form.inputMode === 'weight' ? 'targetWeight' : 'quantity']: event.target.value,
              }))}
            />
            <Input
              label="매수 평균가"
              type="number"
              min="0"
              step={form.currency === 'KRW' ? '1' : '0.01'}
              value={form.avgPrice}
              error={errors.avgPrice}
              prefix={form.currency === 'KRW' ? '₩' : '$'}
              onChange={(event) => setForm((current) => ({ ...current, avgPrice: event.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="카테고리"
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
            >
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>
            <Input label="통화" value={form.currency} readOnly />
          </div>

          <Input
            label="메모"
            value={form.memo}
            placeholder="예: 장기 적립, 배당 재투자 예정"
            onChange={(event) => setForm((current) => ({ ...current, memo: event.target.value }))}
          />

          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
            <p className="text-xs font-semibold text-[var(--text-primary)]">입력 미리보기</p>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-[var(--text-muted)]">시장</dt>
                <dd className="mt-1 font-medium text-[var(--text-primary)]">{form.market}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)]">섹터</dt>
                <dd className="mt-1 font-medium text-[var(--text-primary)]">{form.sector || '기타'}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)]">예상 매수금액</dt>
                <dd className="mt-1 font-medium text-[var(--text-primary)]">
                  {Number((form.inputMode === 'weight'
                    ? (accountTotalCapital * (Number(form.targetWeight || 0) / 100)) / Number(form.avgPrice || 1)
                    : form.quantity) || 0) && Number(form.avgPrice || 0)
                    ? `${(
                        Number(form.inputMode === 'weight'
                          ? (accountTotalCapital * (Number(form.targetWeight || 0) / 100)) / Number(form.avgPrice || 1)
                          : form.quantity || 0
                        ) * Number(form.avgPrice || 0)
                      ).toLocaleString('ko-KR')}${form.currency === 'KRW' ? '원' : ` ${form.currency}`}`
                    : '수량과 단가를 입력해 주세요'}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)]">계좌 반영</dt>
                <dd className="mt-1 font-medium text-[var(--text-primary)]">{accountLabel || '-'}</dd>
              </div>
              {form.inputMode === 'weight' && (
                <div>
                  <dt className="text-[var(--text-muted)]">계산 수량</dt>
                  <dd className="mt-1 font-medium text-[var(--text-primary)]">
                    {Number(form.avgPrice || 0) > 0
                      ? (((accountTotalCapital * (Number(form.targetWeight || 0) / 100)) / Number(form.avgPrice || 1)) || 0).toLocaleString('ko-KR', { maximumFractionDigits: 4 })
                      : '단가 입력 필요'}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </Modal>
  )
}

import { useEffect, useState } from 'react'
import { Modal } from '../../components/ui/Modal.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input, Select } from '../../components/ui/Input.jsx'
import { ACCOUNT_TYPES } from '../../services/mockData.js'
import { validateAccountInput } from './schema.js'

const initialForm = {
  name: '',
  type: 'BROKERAGE',
  totalCapital: '',
  memo: '',
}

export function AccountFormModal({ open, account, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setForm(
      account
        ? {
            name: account.name,
            type: account.type,
            totalCapital: String(account.totalCapital || ''),
            memo: account.memo || '',
          }
        : initialForm
    )
    setErrors({})
  }, [open, account])

  const handleSubmit = () => {
    const result = validateAccountInput(form)
    if (!result.isValid) {
      setErrors(result.errors)
      return
    }
    onSubmit(result.values)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={account ? '계좌 정보 수정' : '계좌 추가'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button onClick={handleSubmit}>{account ? '수정 저장' : '계좌 만들기'}</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4">
        <Input
          label="계좌 이름"
          value={form.name}
          error={errors.name}
          placeholder="예: 미국 성장주 계좌"
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
        />
        <Select
          label="계좌 유형"
          value={form.type}
          error={errors.type}
          onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
        >
          {Object.entries(ACCOUNT_TYPES).map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.label} · {meta.fullName}
            </option>
          ))}
        </Select>
        <Input
          label="총 투자 원금"
          type="number"
          min="0"
          step="1000"
          prefix="₩"
          value={form.totalCapital}
          error={errors.totalCapital}
          placeholder="예: 10000000"
          onChange={(event) => setForm((current) => ({ ...current, totalCapital: event.target.value }))}
        />
        <Input
          label="계좌 메모"
          value={form.memo}
          placeholder="예: 연금 장기 적립용"
          onChange={(event) => setForm((current) => ({ ...current, memo: event.target.value }))}
        />
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
          <p className="text-xs font-semibold text-[var(--text-primary)]">
            {ACCOUNT_TYPES[form.type]?.fullName}
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
            {ACCOUNT_TYPES[form.type]?.desc}
          </p>
        </div>
      </div>
    </Modal>
  )
}

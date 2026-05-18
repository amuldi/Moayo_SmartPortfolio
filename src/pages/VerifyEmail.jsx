import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { BrandIcon } from '../components/ui/BrandIcon.jsx'
import { readApiJson } from '../services/apiClient.js'

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState('loading') // loading | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('유효하지 않은 인증 링크입니다')
      return
    }
    fetch(`/api/auth/verify?token=${token}`, { credentials: 'include' })
      .then((r) => readApiJson(r, '인증에 실패했습니다'))
      .then(() => {
        setStatus('success')
        setMessage('이메일 인증이 완료되었습니다!')
      })
      .catch((error) => {
        setStatus('error')
        setMessage(error.message || '서버에 연결할 수 없습니다')
      })
  }, [token])

  const Icon = status === 'loading' ? Loader2 : status === 'success' ? CheckCircle2 : XCircle
  const iconColor = status === 'loading'
    ? 'var(--text-muted)'
    : status === 'success'
    ? 'var(--positive)'
    : 'var(--negative)'

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="w-full max-w-sm text-center">
        {/* 로고 */}
        <div className="flex flex-col items-center mb-7">
          <BrandIcon size={40} />
          <span
            className="text-sm font-bold tracking-tight mt-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Moay<span style={{ color: '#5BA3CF' }}>o</span>
          </span>
        </div>

        <div
          className="p-8 rounded-2xl border"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <Icon
            size={48}
            className={status === 'loading' ? 'animate-spin mx-auto mb-4' : 'mx-auto mb-4'}
            style={{ color: iconColor }}
          />
          <h2 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {status === 'loading' ? '인증 중...' : status === 'success' ? '인증 완료!' : '인증 실패'}
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{message}</p>

          {status === 'success' && (
            <Link
              to="/login"
              className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: '#5BA3CF' }}
            >
              로그인하러 가기
            </Link>
          )}
          {status === 'error' && (
            <Link
              to="/register"
              className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-[var(--bg-elevated)]"
              style={{ color: 'var(--text-primary)', borderColor: 'var(--border)', background: 'var(--bg-card)' }}
            >
              다시 가입하기
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

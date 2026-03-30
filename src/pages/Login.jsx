import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'
import useAuthStore from '../store/authStore.js'
import usePortfolioStore from '../store/portfolioStore.js'
import useSettingsStore from '../store/settingsStore.js'

import { BrandIcon } from '../components/ui/BrandIcon.jsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

function LoginForm() {
  const navigate = useNavigate()
  const { setAuth, enterGuestMode } = useAuthStore()
  const { loadFromServer, markLoaded } = usePortfolioStore()
  const { applyAll } = useSettingsStore()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState('')
  const [error, setError] = useState('')
  const [needsVerify, setNeedsVerify] = useState(false)
  const [resendEmail, setResendEmail] = useState('')

  const finishLogin = useCallback(async (token, user) => {
    setAuth(token, user)
    await loadFromServer(token)
    applyAll()
    navigate('/home')
  }, [setAuth, loadFromServer, applyAll, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNeedsVerify(false)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.needsVerification) {
          setNeedsVerify(true)
          setResendEmail(form.email)
        }
        setError(data.error || '로그인에 실패했습니다')
        return
      }
      await finishLogin(data.token, data.user)
    } catch {
      setError('서버에 연결할 수 없습니다')
    } finally {
      setLoading(false)
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setSocialLoading('google')
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: tokenResponse.access_token }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error || 'Google 로그인 실패'); return }
        await finishLogin(data.token, data.user)
      } catch {
        setError('Google 로그인 중 오류가 발생했습니다')
      } finally {
        setSocialLoading('')
      }
    },
    onError: () => setError('Google 로그인이 취소되었습니다'),
  })

  const handleKakao = () => {
    const key = import.meta.env.VITE_KAKAO_APP_KEY
    if (!key) { setError('Kakao 앱 키가 설정되지 않았습니다'); return }
    const redirect = `${window.location.origin}/kakao-callback`
    window.location.href =
      `https://kauth.kakao.com/oauth/authorize?client_id=${key}&redirect_uri=${redirect}&response_type=code`
  }

  const handleResend = async () => {
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      })
      setError('인증 메일을 다시 보냈습니다. 메일함을 확인해주세요.')
      setNeedsVerify(false)
    } catch {
      setError('메일 발송에 실패했습니다')
    }
  }

  const handleGuestMode = () => {
    enterGuestMode()
    markLoaded()
    navigate('/home')
  }

  const inputStyle = {
    background: 'var(--bg-elevated)',
    borderColor: 'var(--border)',
    color: 'var(--text-primary)',
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="w-full max-w-sm">

        {/* 로고 */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
            <BrandIcon size={44} />
            <span className="text-xs font-semibold tracking-tight mt-1" style={{ color: 'var(--text-muted)' }}>
              Moay<span style={{ color: '#5BA3CF' }}>o</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold mt-5 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            다시 돌아오셨군요
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>포트폴리오에 로그인하세요</p>
        </div>

        {/* 소셜 로그인 */}
        <div className="flex flex-col gap-2 mb-5">
          <button
            onClick={() => googleLogin()}
            disabled={!!socialLoading}
            className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border text-sm font-medium transition-all hover:bg-[var(--bg-elevated)] disabled:opacity-50"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            {socialLoading === 'google' ? (
              <span
                className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: 'var(--border)', borderTopColor: '#5BA3CF' }}
              />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Google로 로그인
          </button>

          <button
            onClick={handleKakao}
            disabled={!!socialLoading}
            className="w-full h-11 flex items-center justify-center gap-3 rounded-xl text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: '#FEE500', color: '#191919' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#191919">
              <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.74 5.19 4.36 6.6L5.3 21l4.4-2.34C10.32 18.87 11.15 19 12 19c5.52 0 10-3.48 10-8.2C22 6.48 17.52 3 12 3z"/>
            </svg>
            카카오로 로그인
          </button>

          <button
            disabled
            className="w-full h-11 flex items-center justify-center gap-3 rounded-xl text-sm font-medium border opacity-40 cursor-not-allowed"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.45.07 2.44.74 3.3.8 1.26-.25 2.46-.96 3.73-.8 1.58.19 2.77.89 3.5 2.13-3.24 1.93-2.7 5.88.45 7.23-.58 1.63-1.35 3.24-3.02 3.52M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Apple로 로그인 (준비 중)
          </button>
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>또는 이메일로 로그인</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        {/* 이메일 폼 */}
        <div
          className="rounded-2xl border p-5"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                이메일
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="example@email.com"
                required
                className="w-full h-10 px-3 text-sm rounded-xl border outline-none transition-colors"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#5BA3CF'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="비밀번호 입력"
                  required
                  className="w-full h-10 pl-3 pr-10 text-sm rounded-xl border outline-none transition-colors"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#5BA3CF'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="px-3 py-2 rounded-xl text-xs"
                style={{ background: 'var(--negative-soft)', color: 'var(--negative)', border: '1px solid var(--negative-soft)' }}
              >
                {error}
                {needsVerify && (
                  <button
                    onClick={handleResend}
                    type="button"
                    className="block mt-1 underline font-medium"
                    style={{ color: '#5BA3CF' }}
                  >
                    인증 메일 다시 보내기
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 flex items-center justify-center gap-2 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 hover:opacity-90"
              style={{ background: '#5BA3CF' }}
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><LogIn size={15} /> 로그인</>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
          계정이 없으신가요?{' '}
          <Link to="/register" className="font-medium hover:underline" style={{ color: '#5BA3CF' }}>
            회원가입
          </Link>
        </p>
        <button
          type="button"
          onClick={handleGuestMode}
          className="mt-4 w-full text-center text-xs font-medium hover:underline"
          style={{ color: 'var(--text-muted)' }}
        >
          로그인 없이 체험하기
        </button>
      </div>
    </div>
  )
}

export default function Login() {
  if (!GOOGLE_CLIENT_ID) return <LoginForm />
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginForm />
    </GoogleOAuthProvider>
  )
}

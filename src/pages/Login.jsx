import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import useAuthStore from '../store/authStore.js'
import usePortfolioStore from '../store/portfolioStore.js'
import useSettingsStore from '../store/settingsStore.js'
import { readApiJson } from '../services/apiClient.js'
import { startNaverLogin } from '../services/naverOAuth.js'

import { BrandIcon } from '../components/ui/BrandIcon.jsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function GoogleLoginUnavailableButton({ setError }) {
  return (
    <button
      type="button"
      onClick={() => setError('Google 로그인을 사용하려면 VITE_GOOGLE_CLIENT_ID 환경변수를 등록해주세요.')}
      className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border text-sm font-medium transition-all hover:bg-[var(--bg-elevated)]"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
    >
      <GoogleMark />
      Google로 로그인
    </button>
  )
}

function GoogleLoginButton({ finishLogin, setError, setSocialLoading }) {
  return (
    <div className="flex w-full justify-center rounded-xl border bg-[var(--bg-card)] py-1" style={{ borderColor: 'var(--border)' }}>
      <GoogleLogin
        width="320"
        text="signin_with"
        onSuccess={async (credentialResponse) => {
      setSocialLoading('google')
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: credentialResponse.credential }),
        })
        const data = await readApiJson(res, 'Google 로그인 실패')
        await finishLogin(data.user)
      } catch (error) {
        setError(error.message || 'Google 로그인 중 오류가 발생했습니다')
      } finally {
        setSocialLoading('')
      }
        }}
        onError={() => setError('Google 로그인이 취소되었습니다')}
      />
    </div>
  )
}

function NaverMark() {
  return (
    <span
      aria-hidden="true"
      className="flex h-[18px] w-[18px] items-center justify-center rounded-[4px] text-[11px] font-black text-white"
      style={{ background: '#03C75A' }}
    >
      N
    </span>
  )
}

function NaverLoginButton({ finishLogin, setError, socialLoading, setSocialLoading }) {
  const handleNaverLogin = async () => {
    setError('')
    setSocialLoading('naver')
    try {
      const data = await startNaverLogin()
      await finishLogin(data.user)
    } catch (error) {
      setError(error.message || '네이버 로그인 중 오류가 발생했습니다')
    } finally {
      setSocialLoading('')
    }
  }

  return (
    <button
      type="button"
      onClick={handleNaverLogin}
      disabled={!!socialLoading}
      className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border text-sm font-medium transition-all hover:bg-[var(--bg-elevated)] disabled:opacity-50"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
    >
      {socialLoading === 'naver'
        ? <span
            className="w-4 h-4 border-2 rounded-full animate-spin"
            style={{ borderColor: 'var(--border)', borderTopColor: '#03C75A' }}
          />
        : <NaverMark />
      }
      네이버로 로그인
    </button>
  )
}

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

  const finishLogin = useCallback(async (user) => {
    setAuth(user)
    await loadFromServer()
    applyAll()
    navigate('/portfolio')
  }, [setAuth, loadFromServer, applyAll, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNeedsVerify(false)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await readApiJson(res, '로그인에 실패했습니다')
      await finishLogin(data.user)
    } catch (error) {
      if (error.details?.needsVerification) {
        setNeedsVerify(true)
        setResendEmail(form.email)
      }
      setError(error.message || '서버에 연결할 수 없습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      })
      await readApiJson(response, '메일 발송에 실패했습니다')
      setError('인증 메일을 다시 보냈습니다. 메일함을 확인해주세요.')
      setNeedsVerify(false)
    } catch (error) {
      setError(error.message || '메일 발송에 실패했습니다')
    }
  }

  const handleGuestMode = () => {
    enterGuestMode()
    markLoaded()
    navigate('/portfolio')
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
          {GOOGLE_CLIENT_ID ? (
            <GoogleLoginButton
              finishLogin={finishLogin}
              setError={setError}
              socialLoading={socialLoading}
              setSocialLoading={setSocialLoading}
            />
          ) : (
            <GoogleLoginUnavailableButton setError={setError} />
          )}
          <NaverLoginButton
            finishLogin={finishLogin}
            setError={setError}
            socialLoading={socialLoading}
            setSocialLoading={setSocialLoading}
          />
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
                autoComplete="email"
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
                  autoComplete="current-password"
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

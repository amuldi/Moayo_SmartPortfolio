import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus, Mail } from 'lucide-react'
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'
import useAuthStore from '../store/authStore.js'
import usePortfolioStore from '../store/portfolioStore.js'
import useSettingsStore from '../store/settingsStore.js'

import { BrandIcon } from '../components/ui/BrandIcon.jsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

function RegisterForm() {
  const navigate = useNavigate()
  const { setAuth, enterGuestMode } = useAuthStore()
  const { loadFromServer, markLoaded } = usePortfolioStore()
  const { applyAll } = useSettingsStore()

  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const finishLogin = useCallback(async (token, user) => {
    setAuth(token, user)
    await loadFromServer(token)
    applyAll()
    navigate('/home')
  }, [setAuth, loadFromServer, applyAll, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('비밀번호가 일치하지 않습니다'); return }
    if (form.password.length < 6)       { setError('비밀번호는 6자 이상이어야 합니다'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || '회원가입에 실패했습니다'); return }
      setDone(true)
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
        if (!res.ok) { setError(data.error || 'Google 가입 실패'); return }
        await finishLogin(data.token, data.user)
      } catch {
        setError('Google 가입 중 오류가 발생했습니다')
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

  const handleGuestMode = () => {
    enterGuestMode()
    markLoaded()
    navigate('/home')
  }

  /* 이메일 인증 대기 화면 */
  if (done) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="w-full max-w-sm text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(16,185,129,0.10)' }}
          >
            <Mail size={28} style={{ color: 'var(--positive)' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            메일함을 확인해주세요
          </h2>
          <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: '#5BA3CF' }}>{form.email}</strong>으로
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            인증 메일을 보냈습니다. 링크를 클릭하면 가입이 완료됩니다.
          </p>
          <div
            className="p-4 rounded-xl mb-5 text-left"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: '#5BA3CF' }}>서버 개발 모드</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              SMTP 설정 전에는 서버 콘솔에 인증 링크가 출력됩니다.
              <code
                className="mx-1 px-1 rounded"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '10px' }}
              >
                server/server.js
              </code>
              터미널을 확인하세요.
            </p>
          </div>
          <Link to="/login" className="text-sm font-medium hover:underline" style={{ color: '#5BA3CF' }}>
            로그인 페이지로 이동
          </Link>
        </div>
      </div>
    )
  }

  const pwMismatch = form.confirm && form.confirm !== form.password

  const inputStyle = {
    background: 'var(--bg-elevated)',
    borderColor: 'var(--border)',
    color: 'var(--text-primary)',
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
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
            포트폴리오 시작하기
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>무료로 계정을 만들어보세요</p>
        </div>

        {/* 소셜 회원가입 */}
        <div className="flex flex-col gap-2 mb-5">
          <button
            onClick={() => googleLogin()}
            disabled={!!socialLoading}
            className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border text-sm font-medium transition-all hover:bg-[var(--bg-elevated)] disabled:opacity-50"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            {socialLoading === 'google'
              ? <span
                  className="w-4 h-4 border-2 rounded-full animate-spin"
                  style={{ borderColor: 'var(--border)', borderTopColor: '#5BA3CF' }}
                />
              : <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
            }
            Google로 계속하기
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
            카카오로 계속하기
          </button>
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>또는 이메일로 가입</span>
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                사용자 이름
              </label>
              <input
                type="text" value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="홍길동" required
                className="w-full h-10 px-3 text-sm rounded-xl border outline-none transition-colors"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#5BA3CF'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                이메일
              </label>
              <input
                type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="example@email.com" required
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
                  type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="6자 이상" required
                  className="w-full h-10 pl-3 pr-10 text-sm rounded-xl border outline-none transition-colors"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#5BA3CF'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
                <button
                  type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                비밀번호 확인
              </label>
              <input
                type={showPw ? 'text' : 'password'} value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="비밀번호 재입력" required
                className="w-full h-10 px-3 text-sm rounded-xl border outline-none transition-colors"
                style={{
                  ...inputStyle,
                  borderColor: pwMismatch ? 'var(--negative)' : 'var(--border)',
                }}
                onFocus={(e) => e.target.style.borderColor = pwMismatch ? 'var(--negative)' : '#5BA3CF'}
                onBlur={(e) => e.target.style.borderColor = pwMismatch ? 'var(--negative)' : 'var(--border)'}
              />
              {pwMismatch && (
                <p className="text-[10px] mt-1" style={{ color: 'var(--negative)' }}>
                  비밀번호가 일치하지 않습니다
                </p>
              )}
            </div>

            {error && (
              <div
                className="px-3 py-2 rounded-xl text-xs"
                style={{ background: 'var(--negative-soft)', color: 'var(--negative)' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || pwMismatch}
              className="w-full h-10 flex items-center justify-center gap-2 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 hover:opacity-90 mt-1"
              style={{ background: '#5BA3CF' }}
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><UserPlus size={15} /> 이메일로 가입하기</>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="font-medium hover:underline" style={{ color: '#5BA3CF' }}>
            로그인
          </Link>
        </p>
        <button
          type="button"
          onClick={handleGuestMode}
          className="mt-4 w-full text-center text-xs font-medium hover:underline"
          style={{ color: 'var(--text-muted)' }}
        >
          먼저 체험해보기
        </button>
      </div>
    </div>
  )
}

export default function Register() {
  if (!GOOGLE_CLIENT_ID) return <RegisterForm />
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <RegisterForm />
    </GoogleOAuthProvider>
  )
}

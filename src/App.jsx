import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout.jsx'
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx'
import { AppErrorBoundary } from './components/app/AppErrorBoundary.jsx'
import useSettingsStore from './store/settingsStore.js'
import useAuthStore from './store/authStore.js'
import usePortfolioStore from './store/portfolioStore.js'
import { FIGMA_PREVIEW_PORTFOLIO } from './data/figmaPreviewPortfolio.js'

const MyPortfolio = lazy(() => import('./pages/MyPortfolio.jsx'))
const Analysis = lazy(() => import('./pages/Analysis.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const Landing = lazy(() => import('./pages/Landing.jsx'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail.jsx'))
const NaverCallback = lazy(() => import('./pages/NaverCallback.jsx'))
const Legal = lazy(() => import('./pages/Legal.jsx'))

const CANONICAL_ORIGIN = 'https://moayo-smartportfolio.vercel.app'
const ENABLE_FIGMA_PREVIEW = import.meta.env.DEV

function redirectPreviewHostToCanonical() {
  if (typeof window === 'undefined') return
  const { hostname, pathname, search, hash } = window.location
  const isMoayoPreview =
    hostname.endsWith('.vercel.app') &&
    hostname !== 'moayo-smartportfolio.vercel.app' &&
    hostname.startsWith('moayo-smartportfolio-')

  if (!isMoayoPreview) return
  window.location.replace(`${CANONICAL_ORIGIN}${pathname}${search}${hash}`)
}

function AppFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
        <p className="mt-4 text-sm font-medium text-[var(--text-primary)]">화면을 불러오는 중입니다</p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">포트폴리오 데이터를 준비하고 있습니다.</p>
      </div>
    </div>
  )
}

function FigmaPreviewRoute({ children }) {
  const loadPreviewPortfolio = usePortfolioStore((state) => state.loadPreviewPortfolio)

  useEffect(() => {
    loadPreviewPortfolio(FIGMA_PREVIEW_PORTFOLIO)
  }, [loadPreviewPortfolio])

  return <AppLayout>{children}</AppLayout>
}

export default function App() {
  const { applyAll } = useSettingsStore()
  const { user, isGuest } = useAuthStore()
  useEffect(() => {
    redirectPreviewHostToCanonical()
    applyAll()
  }, [applyAll])

  return (
    <Router>
      <AppErrorBoundary>
        <Suspense fallback={<AppFallback />}>
          <Routes>
          {/* 랜딩 페이지 (미로그인 시) */}
          <Route path="/"
            element={user || isGuest ? <Navigate to="/portfolio" replace /> : <Landing />}
          />

          {/* 공개 라우트 */}
          <Route path="/login"        element={<Login />}       />
          <Route path="/register"     element={<Register />}    />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/oauth/naver/callback" element={<NaverCallback />} />
          <Route path="/terms" element={<Legal />} />
          <Route path="/privacy" element={<Legal />} />
          <Route path="/disclaimer" element={<Legal />} />

          {/* 이전 주소는 포트폴리오 화면으로 연결 */}
          <Route path="/home" element={<Navigate to="/portfolio" replace />} />

          {/* Figma 캡처용 프리뷰 라우트 */}
          {ENABLE_FIGMA_PREVIEW && (
            <>
              <Route path="/figma/portfolio" element={<FigmaPreviewRoute><MyPortfolio /></FigmaPreviewRoute>} />
              <Route path="/figma/analysis" element={<FigmaPreviewRoute><Analysis /></FigmaPreviewRoute>} />
              <Route path="/figma/settings" element={<FigmaPreviewRoute><Settings /></FigmaPreviewRoute>} />
            </>
          )}

          {/* 보호된 앱 라우트 */}
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <AppLayout><MyPortfolio /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis"
            element={
              <ProtectedRoute>
                <AppLayout><Analysis /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout><Settings /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* 기타 → 랜딩 or 포트폴리오 */}
          <Route path="*" element={<Navigate to={user || isGuest ? '/portfolio' : '/'} replace />} />
          </Routes>
        </Suspense>
      </AppErrorBoundary>
    </Router>
  )
}

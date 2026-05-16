import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout.jsx'
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx'
import { AppErrorBoundary } from './components/app/AppErrorBoundary.jsx'
import useSettingsStore from './store/settingsStore.js'
import useAuthStore from './store/authStore.js'

const Home = lazy(() => import('./pages/Home.jsx'))
const MyPortfolio = lazy(() => import('./pages/MyPortfolio.jsx'))
const Analysis = lazy(() => import('./pages/Analysis.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const Landing = lazy(() => import('./pages/Landing.jsx'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail.jsx'))

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

export default function App() {
  const { applyAll } = useSettingsStore()
  const { token, isGuest } = useAuthStore()
  useEffect(() => { applyAll() }, [applyAll])

  return (
    <Router>
      <AppErrorBoundary>
        <Suspense fallback={<AppFallback />}>
          <Routes>
          {/* 랜딩 페이지 (미로그인 시) */}
          <Route path="/"
            element={token || isGuest ? <Navigate to="/home" replace /> : <Landing />}
          />

          {/* 공개 라우트 */}
          <Route path="/login"        element={<Login />}       />
          <Route path="/register"     element={<Register />}    />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* 보호된 앱 라우트 */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <AppLayout><Home /></AppLayout>
              </ProtectedRoute>
            }
          />
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

          {/* 기타 → 랜딩 or 홈 */}
          <Route path="*" element={<Navigate to={token || isGuest ? '/home' : '/'} replace />} />
          </Routes>
        </Suspense>
      </AppErrorBoundary>
    </Router>
  )
}

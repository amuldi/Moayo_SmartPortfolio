import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore.js'
import usePortfolioStore from '../../store/portfolioStore.js'
import { BrandIcon } from '../ui/BrandIcon.jsx'

export function ProtectedRoute({ children }) {
  const { user, isGuest, sessionStatus, hydrateSession } = useAuthStore()
  const { isLoaded, loadFromServer, markLoaded } = usePortfolioStore()

  useEffect(() => {
    if (sessionStatus === 'idle') {
      hydrateSession()
      return
    }
    if (user && !isLoaded) {
      loadFromServer()
    }
    if (isGuest && !isLoaded) {
      markLoaded()
    }
  }, [user, isGuest, sessionStatus, isLoaded, hydrateSession, loadFromServer, markLoaded])

  if (sessionStatus === 'idle' || sessionStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-pulse">
            <BrandIcon size={36} />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>세션 확인 중...</p>
        </div>
      </div>
    )
  }

  if (!user && !isGuest) return <Navigate to="/login" replace />

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-pulse">
            <BrandIcon size={36} />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>불러오는 중...</p>
        </div>
      </div>
    )
  }

  return children
}

import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore.js'
import usePortfolioStore from '../../store/portfolioStore.js'
import { BrandIcon } from '../ui/BrandIcon.jsx'

export function ProtectedRoute({ children }) {
  const { token, isGuest } = useAuthStore()
  const { isLoaded, loadFromServer, markLoaded } = usePortfolioStore()

  useEffect(() => {
    if (token && !isLoaded) {
      loadFromServer(token)
    }
    if (isGuest && !isLoaded) {
      markLoaded()
    }
  }, [token, isGuest, isLoaded, loadFromServer, markLoaded])

  if (!token && !isGuest) return <Navigate to="/login" replace />

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

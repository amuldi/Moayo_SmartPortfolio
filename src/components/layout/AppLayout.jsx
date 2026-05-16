import { useEffect } from 'react'
import { TopNav } from './TopNav.jsx'
import usePortfolioStore from '../../store/portfolioStore.js'

export function AppLayout({ children }) {
  const { refreshPrices, accounts, watchlist } = usePortfolioStore()

  useEffect(() => {
    refreshPrices()
    const id = setInterval(refreshPrices, 60_000)
    return () => clearInterval(id)
  }, [accounts.length, watchlist.length, refreshPrices])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-primary)]">
      <TopNav />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

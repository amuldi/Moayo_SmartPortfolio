import { useEffect, useMemo } from 'react'
import { TopNav } from './TopNav.jsx'
import usePortfolioStore from '../../store/portfolioStore.js'

export function AppLayout({ children }) {
  const {
    refreshPrices,
    accounts,
    watchlist,
    applyRealtimeTrade,
    setRealtimeStatus,
  } = usePortfolioStore()

  const tickerSignature = useMemo(() => {
    return [
      ...new Set([
        ...accounts.flatMap((account) => account.holdings.map((holding) => holding.ticker)),
        ...watchlist.map((item) => item.ticker),
      ].map((ticker) => String(ticker || '').trim()).filter(Boolean)),
    ].sort().join('|')
  }, [accounts, watchlist])

  useEffect(() => {
    refreshPrices()
    const id = setInterval(refreshPrices, 30_000)
    const handleFocus = () => refreshPrices()
    const handleOnline = () => refreshPrices()
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshPrices()
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('online', handleOnline)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(id)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('online', handleOnline)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [tickerSignature, refreshPrices])

  useEffect(() => {
    const tickers = tickerSignature.split('|').filter(Boolean)
    if (!tickers.length) {
      setRealtimeStatus('idle')
      return
    }

    const realtimeEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_REALTIME_WS === 'true'
    if (!realtimeEnabled || typeof WebSocket === 'undefined') {
      setRealtimeStatus('polling')
      return
    }

    let ws = null
    let reconnectTimer = null
    let closedByEffect = false

    const sendJson = (payload) => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload))
      }
    }

    const connect = () => {
      setRealtimeStatus('connecting')

      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        ws = new WebSocket(`${protocol}//${window.location.host}/ws`)
      } catch {
        setRealtimeStatus('polling', '브라우저에서 실시간 연결을 시작하지 못해 REST 자동 갱신으로 표시합니다.')
        return
      }

      ws.onopen = () => {
        setRealtimeStatus('connected')
        tickers.forEach((ticker) => sendJson({ type: 'subscribe', ticker }))
      }

      ws.onmessage = (event) => {
        let message
        try {
          message = JSON.parse(event.data)
        } catch {
          return
        }

        if (message.type === 'trade') {
          applyRealtimeTrade(message)
          return
        }

        if (message.type === 'status') {
          if (message.mode === 'connecting') {
            setRealtimeStatus('connecting', message.message || null)
          } else {
            setRealtimeStatus(message.realtime ? 'connected' : 'polling', message.message || null)
          }
          return
        }

        if (message.type === 'error') {
          setRealtimeStatus('error', message.message || '실시간 시세 연결 오류가 발생했습니다.')
        }
      }

      ws.onclose = () => {
        if (closedByEffect) return
        setRealtimeStatus('polling', '실시간 연결이 끊겨 REST 자동 갱신으로 표시합니다.')
        reconnectTimer = window.setTimeout(connect, 5_000)
      }

      ws.onerror = () => {
        setRealtimeStatus('error', '실시간 연결을 확인하지 못했습니다. REST 자동 갱신으로 표시합니다.')
      }
    }

    connect()

    return () => {
      closedByEffect = true
      if (reconnectTimer) window.clearTimeout(reconnectTimer)
      if (ws?.readyState === WebSocket.OPEN) {
        tickers.forEach((ticker) => sendJson({ type: 'unsubscribe', ticker }))
      }
      if (ws) ws.close()
    }
  }, [tickerSignature, applyRealtimeTrade, setRealtimeStatus])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-primary)]">
      <TopNav />
      <div className="flex-1 overflow-hidden pb-16 sm:pb-0">
        {children}
      </div>
    </div>
  )
}

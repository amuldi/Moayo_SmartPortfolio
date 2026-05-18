function normalizeWsUrl(value) {
  const url = String(value || '').trim()
  if (!url) return ''
  if (url.startsWith('wss://') || url.startsWith('ws://')) return url
  if (url.startsWith('https://')) return `wss://${url.slice('https://'.length)}`
  if (url.startsWith('http://')) return `ws://${url.slice('http://'.length)}`
  return url
}

export function getRealtimeWebSocketUrl() {
  const configured = normalizeWsUrl(import.meta.env.VITE_REALTIME_WS_URL)
  if (configured) return configured

  if (typeof window === 'undefined') return ''
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws`
}

export function isRealtimeWebSocketEnabled() {
  if (normalizeWsUrl(import.meta.env.VITE_REALTIME_WS_URL)) return true
  if (import.meta.env.PROD) return false
  return import.meta.env.DEV || import.meta.env.VITE_ENABLE_REALTIME_WS === 'true'
}

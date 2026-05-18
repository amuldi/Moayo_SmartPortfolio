import { WebSocketServer, WebSocket } from 'ws'
import { toSymbol } from './stockProvider.js'

const IS_PROD = process.env.NODE_ENV === 'production'

function parseOrigins(value) {
  return String(value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => {
      try {
        return new URL(origin).origin
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

function getAllowedOrigins(options = {}) {
  return [
    ...new Set(parseOrigins(
      options.allowedOrigins ||
      process.env.REALTIME_ALLOWED_ORIGINS ||
      process.env.ALLOWED_ORIGINS ||
      process.env.APP_URL ||
      ''
    )),
  ]
}

function isAllowedOrigin(origin, allowedOrigins) {
  if (!origin) return !IS_PROD
  if (!allowedOrigins.length) return !IS_PROD

  try {
    return allowedOrigins.includes(new URL(origin).origin)
  } catch {
    return false
  }
}

export function attachRealtimeServer(server, options = {}) {
  const path = options.path || process.env.REALTIME_WS_PATH || '/ws'
  const allowedOrigins = getAllowedOrigins(options)
  const wss = new WebSocketServer({
    server,
    path,
    verifyClient(info, done) {
      done(isAllowedOrigin(info.origin, allowedOrigins), 403, 'Forbidden')
    },
  })

  let finnhubWs = null
  let reconnectTimer = null
  let reconnectDelayMs = 3000
  const clientSubs = new Map()
  const tickerSubs = new Map()

  function sendJson(ws, payload) {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload))
  }

  function broadcastStatus(payload) {
    for (const ws of clientSubs.keys()) sendJson(ws, { type: 'status', ...payload })
  }

  function subscribeFinnhub(ticker) {
    if (finnhubWs?.readyState === WebSocket.OPEN) {
      finnhubWs.send(JSON.stringify({ type: 'subscribe', symbol: toSymbol(ticker) }))
    }
  }

  function unsubscribeFinnhub(ticker) {
    if (finnhubWs?.readyState === WebSocket.OPEN) {
      finnhubWs.send(JSON.stringify({ type: 'unsubscribe', symbol: toSymbol(ticker) }))
    }
  }

  function scheduleReconnect() {
    if (!tickerSubs.size || reconnectTimer) return
    const nextDelay = reconnectDelayMs
    reconnectDelayMs = Math.min(reconnectDelayMs * 2, 30000)
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      ensureFinnhubWs()
    }, nextDelay)
  }

  function ensureFinnhubWs() {
    const apiKey = process.env.FINNHUB_API_KEY
    if (!apiKey) return false
    if (finnhubWs && (finnhubWs.readyState === WebSocket.OPEN || finnhubWs.readyState === WebSocket.CONNECTING)) {
      return true
    }

    finnhubWs = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`)

    finnhubWs.on('open', () => {
      reconnectDelayMs = 3000
      for (const ticker of tickerSubs.keys()) subscribeFinnhub(ticker)
      broadcastStatus({
        realtime: true,
        mode: 'websocket',
        message: 'Finnhub 실시간 체결가에 연결되었습니다.',
      })
    })

    finnhubWs.on('message', (raw) => {
      let msg
      try { msg = JSON.parse(raw.toString()) } catch { return }
      if (msg.type !== 'trade' || !Array.isArray(msg.data)) return

      msg.data.forEach((trade) => {
        const sym = (trade.s || '').toUpperCase()
        for (const [ticker, clients] of tickerSubs) {
          if (toSymbol(ticker).toUpperCase() !== sym) continue

          const payload = {
            type: 'trade',
            ticker,
            price: trade.p,
            timestamp: trade.t,
            volume: trade.v,
          }
          clients.forEach((client) => sendJson(client, payload))
        }
      })
    })

    finnhubWs.on('close', () => {
      finnhubWs = null
      broadcastStatus({
        realtime: false,
        mode: 'polling',
        message: '실시간 연결이 끊겨 REST 자동 갱신으로 전환했습니다.',
      })
      scheduleReconnect()
    })

    finnhubWs.on('error', (err) => {
      console.error('[Realtime] Finnhub error:', err.message)
      broadcastStatus({
        realtime: false,
        mode: 'polling',
        message: '실시간 시세 연결 오류로 REST 자동 갱신을 사용합니다.',
      })
    })

    return true
  }

  function clientUnsubscribe(ws, ticker) {
    clientSubs.get(ws)?.delete(ticker)
    const subs = tickerSubs.get(ticker)
    if (!subs) return

    subs.delete(ws)
    if (subs.size === 0) {
      tickerSubs.delete(ticker)
      unsubscribeFinnhub(ticker)
    }
  }

  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        ws.terminate()
        return
      }
      ws.isAlive = false
      ws.ping()
    })
  }, 30000)

  wss.on('connection', (ws) => {
    ws.isAlive = true
    ws.on('pong', () => {
      ws.isAlive = true
    })
    clientSubs.set(ws, new Set())

    ws.on('message', (raw) => {
      let msg
      try { msg = JSON.parse(raw.toString()) } catch { return }

      if (msg.type === 'subscribe' && msg.ticker) {
        const ticker = String(msg.ticker).trim().toUpperCase()
        clientSubs.get(ws)?.add(ticker)
        if (!tickerSubs.has(ticker)) tickerSubs.set(ticker, new Set())
        tickerSubs.get(ticker).add(ws)

        const hasRealtimeProvider = ensureFinnhubWs()
        if (!hasRealtimeProvider) {
          sendJson(ws, {
            type: 'status',
            realtime: false,
            mode: 'polling',
            message: 'FINNHUB_API_KEY가 없어 REST 자동 갱신으로 시세를 표시합니다.',
          })
          return
        }

        if (finnhubWs?.readyState === WebSocket.OPEN) {
          subscribeFinnhub(ticker)
          sendJson(ws, {
            type: 'status',
            realtime: true,
            mode: 'websocket',
            message: '실시간 체결가를 수신 중입니다.',
          })
        } else {
          sendJson(ws, {
            type: 'status',
            realtime: false,
            mode: 'connecting',
            message: '실시간 시세 연결을 준비 중입니다.',
          })
        }
      }

      if (msg.type === 'unsubscribe' && msg.ticker) {
        clientUnsubscribe(ws, String(msg.ticker).trim().toUpperCase())
      }
    })

    ws.on('close', () => {
      const tickers = [...(clientSubs.get(ws) || [])]
      tickers.forEach((ticker) => clientUnsubscribe(ws, ticker))
      clientSubs.delete(ws)
    })
  })

  wss.on('close', () => {
    clearInterval(heartbeat)
    if (reconnectTimer) clearTimeout(reconnectTimer)
    if (finnhubWs) finnhubWs.close()
  })

  return wss
}

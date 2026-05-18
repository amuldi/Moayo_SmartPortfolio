import express from 'express'
import { createServer } from 'http'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { attachRealtimeServer } from './realtimeGateway.js'
import { loadLocalEnv } from './env.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = resolve(__dirname, '..')

loadLocalEnv(ROOT_DIR, __dirname)

const app = express()
const PORT = process.env.REALTIME_PORT || process.env.PORT || 4100
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1')
const WS_PATH = process.env.REALTIME_WS_PATH || '/ws'

app.get('/health/live', (_, res) => {
  res.json({
    status: 'ok',
    service: 'moayo-realtime',
    timestamp: new Date().toISOString(),
  })
})

app.get('/health/ready', (_, res) => {
  const checks = {
    finnhubApiKey: Boolean(process.env.FINNHUB_API_KEY),
    allowedOrigins: Boolean(process.env.REALTIME_ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS || process.env.APP_URL),
  }
  const ready = Object.values(checks).every(Boolean)
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not_ready',
    service: 'moayo-realtime',
    timestamp: new Date().toISOString(),
    path: WS_PATH,
    checks,
  })
})

const server = createServer(app)
attachRealtimeServer(server, { path: WS_PATH })

server.listen(PORT, HOST, () => {
  console.log(`Moayo realtime server ws://${HOST}:${PORT}${WS_PATH}`)
})

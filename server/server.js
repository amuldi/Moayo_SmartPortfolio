import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import { v4 as uuidv4 } from 'uuid'
import { getQuote, getHistory, getChart, toSymbol } from './stockProvider.js'

const __dirname  = dirname(fileURLToPath(import.meta.url))
const app        = express()
const PORT       = process.env.PORT       || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'portfolio-secret-key-2024'
const APP_URL    = process.env.APP_URL    || 'http://localhost:3001'
const DB_PATH    = join(__dirname, 'db.json')
const IS_PROD    = process.env.NODE_ENV === 'production'

// ─── CORS ─────────────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3001,http://localhost:3000').split(',')
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: ${origin} not allowed`))
  },
  credentials: true,
}))

// ─── Logging ──────────────────────────────────────────────
app.use(morgan(IS_PROD ? 'combined' : 'dev'))

// ─── Body parser ──────────────────────────────────────────
app.use(express.json({ limit: '1mb' }))

// ─── Rate limits ──────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15분
  max: 20,
  message: { error: '요청이 너무 많습니다. 잠시 후 다시 시도하세요.' },
  standardHeaders: true, legacyHeaders: false,
})
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: '요청이 너무 많습니다. 잠시 후 다시 시도하세요.' },
  standardHeaders: true, legacyHeaders: false,
})
app.use('/api/auth', authLimiter)
app.use('/api',      apiLimiter)

// ─── DB helpers ───────────────────────────────────────────
function readDB() {
  if (!existsSync(DB_PATH)) {
    writeFileSync(DB_PATH, JSON.stringify({ users: [], portfolios: {} }, null, 2))
  }
  return JSON.parse(readFileSync(DB_PATH, 'utf8'))
}
function writeDB(db) {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

// ─── JWT ─────────────────────────────────────────────────
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: '30d' }
  )
}
function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: '인증이 필요합니다' })
  try { req.user = jwt.verify(token, JWT_SECRET); next() }
  catch { res.status(401).json({ error: '유효하지 않은 토큰입니다' }) }
}

// ─── Email (Nodemailer) ───────────────────────────────────
const transporter = process.env.SMTP_USER
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null

async function sendVerificationEmail(email, username, token) {
  const link = `${APP_URL}/verify-email?token=${token}`
  if (!transporter) {
    console.log(`\n[DEV] 이메일 인증 링크 (${email}):\n  ${link}\n`)
    return
  }
  await transporter.sendMail({
    from: `Moayo <${process.env.SMTP_USER}>`,
    to: email,
    subject: '[Moayo] 이메일 인증을 완료해주세요',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <div style="background:#5BA3CF;width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:16px">
          <span style="color:white;font-size:20px">📈</span>
        </div>
        <h2 style="color:#0F172A;margin:0 0 8px">안녕하세요, ${username}님!</h2>
        <p style="color:#475569;line-height:1.6">Moayo에 가입해주셔서 감사합니다.<br>아래 버튼을 클릭하면 이메일 인증이 완료됩니다.</p>
        <a href="${link}" style="display:inline-block;margin:20px 0;padding:12px 28px;background:#5BA3CF;color:white;text-decoration:none;border-radius:10px;font-weight:600">
          이메일 인증하기
        </a>
        <p style="color:#94A3B8;font-size:12px">링크는 24시간 동안 유효합니다.<br>본인이 가입하지 않으셨다면 이 메일을 무시하세요.</p>
      </div>`,
  })
}

// ─── Auth: Register ───────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body
  if (!username || !email || !password) return res.status(400).json({ error: '모든 항목을 입력해주세요' })
  if (password.length < 6) return res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다' })

  const db = readDB()
  if (db.users.find((u) => u.email === email)) return res.status(409).json({ error: '이미 사용 중인 이메일입니다' })

  const passwordHash       = await bcrypt.hash(password, 10)
  const verificationToken  = uuidv4()
  const user = {
    id: `u-${Date.now()}`,
    username, email, passwordHash,
    emailVerified: false,
    verificationToken,
    createdAt: new Date().toISOString(),
  }
  db.users.push(user)
  db.portfolios[user.id] = { accounts: [] }
  writeDB(db)

  await sendVerificationEmail(email, username, verificationToken)
  res.json({ success: true, message: '인증 메일을 발송했습니다. 메일함을 확인해주세요.' })
})

// ─── Auth: Login ──────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요' })

  const db   = readDB()
  const user = db.users.find((u) => u.email === email)
  if (!user) return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' })

  if (!user.emailVerified) {
    return res.status(403).json({ error: '이메일 인증이 필요합니다. 메일함을 확인해주세요.', needsVerification: true })
  }

  res.json({ token: signToken(user), user: { id: user.id, username: user.username, email: user.email } })
})

// ─── Auth: Verify Email ───────────────────────────────────
app.get('/api/auth/verify', (req, res) => {
  const { token } = req.query
  if (!token) return res.status(400).json({ error: '토큰이 없습니다' })

  const db   = readDB()
  const user = db.users.find((u) => u.verificationToken === token)
  if (!user) return res.status(400).json({ error: '유효하지 않거나 만료된 링크입니다' })

  user.emailVerified    = true
  user.verificationToken = null
  writeDB(db)
  res.json({ success: true })
})

// ─── Auth: Resend Verification ────────────────────────────
app.post('/api/auth/resend-verification', async (req, res) => {
  const { email } = req.body
  const db   = readDB()
  const user = db.users.find((u) => u.email === email && !u.emailVerified)
  if (!user) return res.status(404).json({ error: '해당 이메일을 찾을 수 없습니다' })

  const newToken       = uuidv4()
  user.verificationToken = newToken
  writeDB(db)
  await sendVerificationEmail(email, user.username, newToken)
  res.json({ success: true })
})

// ─── Auth: Google OAuth ───────────────────────────────────
app.post('/api/auth/google', async (req, res) => {
  const { accessToken } = req.body
  if (!accessToken) return res.status(400).json({ error: 'accessToken이 필요합니다' })

  try {
    // Google People API로 유저 정보 조회
    const gRes = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
    )
    if (!gRes.ok) throw new Error('Google API error')
    const { id: googleId, email, name } = await gRes.json()

    const db   = readDB()
    let user   = db.users.find((u) => u.googleId === googleId || u.email === email)

    if (!user) {
      user = {
        id: `u-${Date.now()}`,
        username: name || email.split('@')[0],
        email,
        googleId,
        emailVerified: true, // Google 계정은 자동 인증
        createdAt: new Date().toISOString(),
      }
      db.users.push(user)
      db.portfolios[user.id] = { accounts: [] }
    } else if (!user.googleId) {
      user.googleId      = googleId
      user.emailVerified = true
    }
    writeDB(db)

    res.json({ token: signToken(user), user: { id: user.id, username: user.username, email: user.email } })
  } catch (e) {
    console.error('Google OAuth error:', e)
    res.status(401).json({ error: 'Google 인증에 실패했습니다' })
  }
})

// ─── Auth: Kakao OAuth ────────────────────────────────────
app.post('/api/auth/kakao', async (req, res) => {
  const { code } = req.body
  if (!code) return res.status(400).json({ error: 'code가 필요합니다' })

  try {
    // 카카오 토큰 교환
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:   'authorization_code',
        client_id:    process.env.KAKAO_APP_KEY || '',
        redirect_uri: `${APP_URL}/kakao-callback`,
        code,
      }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) throw new Error('Token exchange failed')

    // 카카오 유저 정보 조회
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const kakaoUser = await userRes.json()

    const kakaoId   = String(kakaoUser.id)
    const nickname  = kakaoUser.kakao_account?.profile?.nickname || `카카오유저${kakaoId.slice(-4)}`
    const email     = kakaoUser.kakao_account?.email || `kakao_${kakaoId}@kakao.local`

    const db   = readDB()
    let user   = db.users.find((u) => u.kakaoId === kakaoId)
    if (!user) {
      user = {
        id: `u-${Date.now()}`,
        username: nickname,
        email,
        kakaoId,
        emailVerified: true,
        createdAt: new Date().toISOString(),
      }
      db.users.push(user)
      db.portfolios[user.id] = { accounts: [] }
      writeDB(db)
    }

    res.json({ token: signToken(user), user: { id: user.id, username: user.username, email: user.email } })
  } catch (e) {
    console.error('Kakao OAuth error:', e)
    res.status(401).json({ error: '카카오 인증에 실패했습니다' })
  }
})

// ─── Auth: Me ─────────────────────────────────────────────
app.get('/api/auth/me', auth, (req, res) => {
  const db   = readDB()
  const user = db.users.find((u) => u.id === req.user.id)
  if (!user) return res.status(404).json({ error: '사용자를 찾을 수 없습니다' })
  res.json({ id: user.id, username: user.username, email: user.email })
})

// ─── Portfolio ────────────────────────────────────────────
app.get('/api/portfolio', auth, (req, res) => {
  const db        = readDB()
  const portfolio = db.portfolios[req.user.id] || { accounts: [] }
  res.json(portfolio)
})

app.put('/api/portfolio', auth, (req, res) => {
  const { accounts } = req.body
  if (!Array.isArray(accounts)) return res.status(400).json({ error: '잘못된 데이터 형식입니다' })
  const db = readDB()
  db.portfolios[req.user.id] = { accounts, updatedAt: new Date().toISOString() }
  writeDB(db)
  res.json({ success: true })
})

// ─── Stock Quotes (Yahoo Finance) ─────────────────────────
// 한국(6자리): 005930 → 005930.KS / 미국: SPY, QQQ 등 그대로

// 단일 종목 현재가
app.get('/api/quote/:ticker', async (req, res) => {
  const { ticker } = req.params
  try {
    const data = await getQuote(ticker)
    res.json(data)
  } catch (e) {
    console.error(`[Quote] ${ticker}:`, e.message)
    res.status(500).json({ error: e.message, ticker })
  }
})

// 복수 종목 현재가 (배치) — POST { tickers: ['SPY','005930',...] }
app.post('/api/quotes', async (req, res) => {
  const { tickers } = req.body
  if (!Array.isArray(tickers) || tickers.length === 0) {
    return res.status(400).json({ error: 'tickers 배열이 필요합니다' })
  }

  const results = await Promise.allSettled(tickers.map((t) => getQuote(t)))

  const quotes = {}
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') quotes[tickers[i]] = r.value
    else quotes[tickers[i]] = { error: r.reason?.message, ticker: tickers[i] }
  })

  res.json({ quotes, updatedAt: new Date().toISOString() })
})

// 히스토리 (월봉)
app.get('/api/history/:ticker', async (req, res) => {
  const { ticker } = req.params
  const months = parseInt(req.query.months) || 24
  try {
    const data = await getHistory(ticker, months)
    res.json(data)
  } catch (e) {
    console.error(`[History] ${ticker}:`, e.message)
    res.status(500).json({ error: e.message })
  }
})

// 차트 캔들 (StockChart용) — range: 1d|1w|1m|3m|1y|5y
app.get('/api/chart/:ticker', async (req, res) => {
  const { ticker } = req.params
  const range = req.query.range || '1y'
  try {
    const data = await getChart(ticker, range)
    res.json(data)
  } catch (e) {
    console.error(`[Chart] ${ticker}:`, e.message)
    res.status(500).json({ error: e.message, ticker, range })
  }
})

// ─── Misc ─────────────────────────────────────────────────
app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
)

app.get('/api/portfolio/benchmarks', (_, res) => {
  res.json({
    benchmarks: [
      { id: 'sp500',      name: 'S&P 500',    cagr: 10.7, sharpe: 0.71, maxDrawdown: 33.8 },
      { id: 'global',     name: '글로벌 시장', cagr: 8.9,  sharpe: 0.57, maxDrawdown: 31.2 },
      { id: 'allWeather', name: '올웨더',      cagr: 7.2,  sharpe: 0.87, maxDrawdown: 13.1 },
    ],
  })
})

// ─── HTTP + WebSocket 서버 ────────────────────────────────
const server = createServer(app)
const wss    = new WebSocketServer({ server, path: '/ws' })

// Finnhub WebSocket 릴레이 ─────────────────────────────────
let finnhubWs = null
const clientSubs  = new Map()  // client WS → Set<ticker>
const tickerSubs  = new Map()  // ticker   → Set<client WS>

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

function ensureFinnhubWs() {
  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) return
  if (finnhubWs && (finnhubWs.readyState === WebSocket.OPEN || finnhubWs.readyState === WebSocket.CONNECTING)) return

  finnhubWs = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`)

  finnhubWs.on('open', () => {
    console.log('[WS] Finnhub 연결됨')
    // 기존 구독 복원
    for (const ticker of tickerSubs.keys()) subscribeFinnhub(ticker)
  })

  finnhubWs.on('message', (raw) => {
    let msg
    try { msg = JSON.parse(raw.toString()) } catch { return }
    if (msg.type !== 'trade' || !Array.isArray(msg.data)) return

    msg.data.forEach((trade) => {
      const sym = (trade.s || '').toUpperCase()
      for (const [ticker, clients] of tickerSubs) {
        if (toSymbol(ticker).toUpperCase() === sym) {
          const payload = JSON.stringify({ type: 'trade', ticker, price: trade.p, timestamp: trade.t, volume: trade.v })
          clients.forEach((c) => {
            if (c.readyState === WebSocket.OPEN) c.send(payload)
          })
        }
      }
    })
  })

  finnhubWs.on('close', () => {
    console.log('[WS] Finnhub 연결 끊김 — 3초 후 재연결')
    finnhubWs = null
    if (tickerSubs.size > 0) setTimeout(ensureFinnhubWs, 3000)
  })

  finnhubWs.on('error', (err) => console.error('[WS] Finnhub 오류:', err.message))
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

wss.on('connection', (ws) => {
  clientSubs.set(ws, new Set())

  ws.on('message', (raw) => {
    let msg
    try { msg = JSON.parse(raw.toString()) } catch { return }

    if (msg.type === 'subscribe' && msg.ticker) {
      const { ticker } = msg
      clientSubs.get(ws)?.add(ticker)
      if (!tickerSubs.has(ticker)) tickerSubs.set(ticker, new Set())
      tickerSubs.get(ticker).add(ws)
      ensureFinnhubWs()
      subscribeFinnhub(ticker)
    }

    if (msg.type === 'unsubscribe' && msg.ticker) {
      clientUnsubscribe(ws, msg.ticker)
    }
  })

  ws.on('close', () => {
    const tickers = [...(clientSubs.get(ws) || [])]
    tickers.forEach((t) => clientUnsubscribe(ws, t))
    clientSubs.delete(ws)
  })
})

// ─── 글로벌 에러 핸들러 ───────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[Error]', err.message)
  const status = err.status || 500
  res.status(status).json({ error: IS_PROD ? '서버 오류가 발생했습니다' : err.message })
})

server.listen(PORT, () => {
  console.log(`\nMoayo API  http://localhost:${PORT}`)
  if (!IS_PROD && !transporter) console.log('[DEV] SMTP 미설정 — 인증 링크는 콘솔에 출력됩니다\n')
})

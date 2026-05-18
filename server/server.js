import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { join, dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { randomBytes, createHash } from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import { v4 as uuidv4 } from 'uuid'
import { parse as parseCookie, serialize as serializeCookie } from 'cookie'
import { OAuth2Client } from 'google-auth-library'
import * as Sentry from '@sentry/node'
import { getQuote, getHistory, getChart, getFxRates } from './stockProvider.js'
import { ok, fail } from './response.js'
import { loadLocalEnv } from './env.js'
import { createJsonRepository } from './repositories/jsonRepository.js'
import { createPostgresRepository } from './repositories/postgresRepository.js'
import { attachRealtimeServer } from './realtimeGateway.js'
import { createDistributedRateLimitStore } from './rateLimitStore.js'
import {
  sanitizeTicker,
  validateChartQuery,
  validateEmailBody,
  validateHistoryQuery,
  validateLoginBody,
  validateOAuthCodeBody,
  validatePortfolioBody,
  validateRegisterBody,
  validateTickersBody,
} from './validation.js'

const __dirname  = dirname(fileURLToPath(import.meta.url))
const ROOT_DIR   = resolve(__dirname, '..')

loadLocalEnv(ROOT_DIR, __dirname)

const app        = express()
const PORT       = process.env.PORT       || 4000
const IS_PROD    = process.env.NODE_ENV === 'production'
const HOST       = process.env.HOST       || (IS_PROD ? '0.0.0.0' : '127.0.0.1')
const JWT_SECRET = process.env.JWT_SECRET || (IS_PROD ? '' : 'portfolio-local-development-secret-change-me')
const APP_URL    = process.env.APP_URL    || 'http://localhost:3001'
const IS_VERCEL  = process.env.VERCEL === '1' || process.env.VERCEL === 'true'
const DB_PATH    = process.env.DB_PATH || (IS_VERCEL ? join('/tmp', 'moayo-db.json') : join(__dirname, 'db.json'))
const COOKIE_SECURE = IS_PROD || APP_URL.startsWith('https://')
const ACCESS_COOKIE = 'moayo_access'
const REFRESH_COOKIE = 'moayo_refresh'
const CSRF_COOKIE = 'moayo_csrf'
const ACCESS_TOKEN_TTL_SECONDS = 15 * 60
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || ''
const SENTRY_DSN = process.env.SENTRY_DSN || ''
const REALTIME_WS_URL = process.env.REALTIME_WS_URL || process.env.VITE_REALTIME_WS_URL || ''
const repository = process.env.DATABASE_URL
  ? createPostgresRepository(process.env.DATABASE_URL)
  : (!IS_PROD ? createJsonRepository(DB_PATH) : null)

if (!repository) {
  throw new Error('DATABASE_URL is required in production. JSON storage is only allowed for local development.')
}

if (!JWT_SECRET || JWT_SECRET.length < 32 || /change-this|portfolio-secret-key-2024/i.test(JWT_SECRET)) {
  throw new Error('JWT_SECRET must be set to a unique 32+ character secret before starting Moayo API.')
}

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0) || 0,
  })
}

app.set('trust proxy', 1)

// ─── CORS ─────────────────────────────────────────────────
function normalizeOrigin(origin) {
  try {
    return new URL(origin).origin
  } catch {
    return null
  }
}

const ALLOWED_ORIGINS = [
  APP_URL,
  ...(process.env.ALLOWED_ORIGINS || 'http://localhost:3001,http://localhost:3000').split(','),
]
  .map((origin) => normalizeOrigin(origin.trim()))
  .filter(Boolean)
  .filter((origin, index, list) => list.indexOf(origin) === index)
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || process.env.VITE_NAVER_CLIENT_ID || ''
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET || ''
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null

function isAllowedOAuthRedirect(redirectUri, pathname) {
  try {
    const url = new URL(redirectUri)
    const allowedOrigins = new Set([APP_URL, ...ALLOWED_ORIGINS].map((origin) => new URL(origin).origin))
    return allowedOrigins.has(url.origin) && url.pathname === pathname
  } catch {
    return false
  }
}
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: ${origin} not allowed`))
  },
  credentials: true,
}))

// ─── Logging ──────────────────────────────────────────────
morgan.token('safe-url', (req) => req.originalUrl.split('?')[0])
app.use(morgan(IS_PROD
  ? ':remote-addr :method :safe-url :status :res[content-length] - :response-time ms'
  : ':method :safe-url :status :response-time ms'
))

// ─── Body parser ──────────────────────────────────────────
app.use(express.json({ limit: '24mb' }))

// ─── Rate limits ──────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15분
  max: 20,
  store: createDistributedRateLimitStore('auth'),
  handler: (req, res) => fail(res, 429, '요청이 너무 많습니다. 잠시 후 다시 시도하세요.', 'RATE_LIMITED'),
  standardHeaders: true, legacyHeaders: false,
})
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  store: createDistributedRateLimitStore('api'),
  handler: (req, res) => fail(res, 429, '요청이 너무 많습니다. 잠시 후 다시 시도하세요.', 'RATE_LIMITED'),
  standardHeaders: true, legacyHeaders: false,
})
app.use('/api/auth', authLimiter)
app.use('/api',      apiLimiter)

function noStore(res) {
  res.set('Cache-Control', 'no-store, max-age=0')
}

// ─── JWT ─────────────────────────────────────────────────
function getCookies(req) {
  return parseCookie(req.headers.cookie || '')
}

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

function createOpaqueToken() {
  return randomBytes(32).toString('base64url')
}

function appendSetCookie(res, cookie) {
  const previous = res.getHeader('Set-Cookie')
  if (!previous) {
    res.setHeader('Set-Cookie', cookie)
  } else if (Array.isArray(previous)) {
    res.setHeader('Set-Cookie', [...previous, cookie])
  } else {
    res.setHeader('Set-Cookie', [previous, cookie])
  }
}

function setCookie(res, name, value, options = {}) {
  appendSetCookie(res, serializeCookie(name, value, {
    path: '/',
    sameSite: 'lax',
    secure: COOKIE_SECURE,
    ...options,
  }))
}

function clearCookie(res, name, httpOnly = true) {
  setCookie(res, name, '', {
    httpOnly,
    maxAge: 0,
    expires: new Date(0),
  })
}

function ensureCsrfCookie(req, res) {
  const cookies = getCookies(req)
  const token = cookies[CSRF_COOKIE] || createOpaqueToken()
  setCookie(res, CSRF_COOKIE, token, {
    httpOnly: false,
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  })
  return token
}

function signAccessToken(user, sessionId) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, sid: sessionId, jti: uuidv4() },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL_SECONDS, issuer: 'moayo-api', audience: 'moayo-web' }
  )
}

function publicUser(user) {
  return { id: user.id, username: user.username, email: user.email }
}

async function issueSession(req, res, user, existingSession = null) {
  const refreshToken = createOpaqueToken()
  const refreshTokenHash = hashToken(refreshToken)
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000).toISOString()
  const session = existingSession
    ? await repository.rotateSession(existingSession.id, refreshTokenHash, expiresAt)
    : await repository.createSession({
        id: `s-${uuidv4()}`,
        userId: user.id,
        refreshTokenHash,
        expiresAt,
        userAgent: req.headers['user-agent'] || '',
        ipAddress: req.ip || req.socket?.remoteAddress || '',
      })

  const accessToken = signAccessToken(user, session.id)
  setCookie(res, ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  })
  setCookie(res, REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  })
  ensureCsrfCookie(req, res)

  return session
}

async function revokeRefreshCookie(req) {
  const refreshToken = getCookies(req)[REFRESH_COOKIE]
  if (!refreshToken) return
  const session = await repository.findSessionByRefreshTokenHash(hashToken(refreshToken))
  if (session) await repository.revokeSession(session.id)
}

async function auth(req, res, next) {
  const cookies = getCookies(req)
  const token = cookies[ACCESS_COOKIE] || (!IS_PROD ? req.headers.authorization?.replace('Bearer ', '') : '')
  if (!token) return fail(res, 401, '인증이 필요합니다', 'AUTH_REQUIRED')
  try {
    const payload = jwt.verify(token, JWT_SECRET, { issuer: 'moayo-api', audience: 'moayo-web' })
    const user = await repository.findUserById(payload.id)
    if (!user || user.disabledAt) return fail(res, 401, '유효하지 않은 토큰입니다', 'INVALID_TOKEN')
    req.user = payload
    req.authUser = user
    next()
  } catch {
    fail(res, 401, '유효하지 않은 토큰입니다', 'INVALID_TOKEN')
  }
}

function requireCsrf(req, res, next) {
  const method = req.method.toUpperCase()
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return next()

  const cookies = getCookies(req)
  const csrfCookie = cookies[CSRF_COOKIE]
  const csrfHeader = req.headers['x-csrf-token']
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return fail(res, 403, '요청 보안 토큰이 유효하지 않습니다', 'CSRF_FAILED')
  }
  next()
}

async function findOrCreateOAuthUser(provider, providerId, email, username) {
  let user = await repository.findUserByOAuth(provider, providerId, email)
  if (!user) {
    user = await repository.createUser({
      id: `u-${Date.now()}-${uuidv4().slice(0, 8)}`,
      username: username || email.split('@')[0],
      email,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    })
  } else if (!user.emailVerified) {
    user = await repository.updateUser(user.id, { emailVerified: true })
  }

  await repository.linkOAuthIdentity(user.id, provider, providerId)
  return user
}

// ─── Email (Nodemailer) ───────────────────────────────────
const SMTP_READY = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS)
const transporter = SMTP_READY
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
    if (IS_PROD) throw new Error('SMTP is required in production to send verification email.')
    console.log(`\n[DEV] 이메일 인증 링크:\n  ${link}\n`)
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
  const parsed = validateRegisterBody(req.body)
  if (parsed.error) return fail(res, 400, parsed.error, 'VALIDATION_ERROR')
  const { username, email, password } = parsed.values

  if (await repository.findUserByEmail(email)) {
    return fail(res, 409, '이미 사용 중인 이메일입니다', 'EMAIL_IN_USE')
  }

  const passwordHash       = await bcrypt.hash(password, 10)
  const verificationToken  = uuidv4()
  const user = {
    id: `u-${Date.now()}-${uuidv4().slice(0, 8)}`,
    username, email, passwordHash,
    emailVerified: false,
    verificationToken,
    createdAt: new Date().toISOString(),
  }
  await repository.createUser(user)
  await repository.trackEvent({ userId: user.id, type: 'auth_register', payload: { method: 'email' } })

  await sendVerificationEmail(email, username, verificationToken)
  ok(res, {}, '인증 메일을 발송했습니다. 메일함을 확인해주세요.')
})

// ─── Auth: Login ──────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const parsed = validateLoginBody(req.body)
  if (parsed.error) return fail(res, 400, parsed.error, 'VALIDATION_ERROR')
  const { email, password } = parsed.values

  const user = await repository.findUserByEmail(email)
  if (!user) return fail(res, 401, '이메일 또는 비밀번호가 올바르지 않습니다', 'INVALID_CREDENTIALS')

  const passwordMatches = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatches) return fail(res, 401, '이메일 또는 비밀번호가 올바르지 않습니다', 'INVALID_CREDENTIALS')

  if (!user.emailVerified) {
    return fail(res, 403, '이메일 인증이 필요합니다. 메일함을 확인해주세요.', 'EMAIL_NOT_VERIFIED', { needsVerification: true })
  }

  await issueSession(req, res, user)
  await repository.trackEvent({ userId: user.id, type: 'auth_login', payload: { method: 'email' } })
  ok(res, { user: publicUser(user) })
})

// ─── Auth: Verify Email ───────────────────────────────────
app.get('/api/auth/verify', async (req, res) => {
  const { token } = req.query
  if (!token) return fail(res, 400, '토큰이 없습니다', 'VALIDATION_ERROR')

  const user = await repository.findUserByVerificationToken(token)
  if (!user) return fail(res, 400, '유효하지 않거나 만료된 링크입니다', 'INVALID_VERIFICATION_TOKEN')

  await repository.updateUser(user.id, { emailVerified: true, verificationToken: null })
  ok(res, {})
})

// ─── Auth: Resend Verification ────────────────────────────
app.post('/api/auth/resend-verification', async (req, res) => {
  const parsed = validateEmailBody(req.body)
  if (parsed.error) return fail(res, 400, parsed.error, 'VALIDATION_ERROR')
  const { email } = parsed.values
  const user = await repository.findUserByEmail(email)
  if (!user || user.emailVerified) return fail(res, 404, '해당 이메일을 찾을 수 없습니다', 'NOT_FOUND')

  const newToken       = uuidv4()
  await repository.updateUser(user.id, { verificationToken: newToken })
  await sendVerificationEmail(email, user.username, newToken)
  ok(res, {})
})

// ─── Auth: Google OAuth ───────────────────────────────────
app.post('/api/auth/google', async (req, res) => {
  const { credential, idToken, accessToken } = req.body
  const googleCredential = credential || idToken
  if (!googleCredential && !(accessToken && !IS_PROD)) {
    return fail(res, 400, 'Google ID token이 필요합니다', 'VALIDATION_ERROR')
  }
  if (!googleClient && !accessToken) {
    return fail(res, 503, 'Google OAuth 설정이 필요합니다', 'OAUTH_NOT_CONFIGURED')
  }

  try {
    let profile
    if (googleCredential) {
      const ticket = await googleClient.verifyIdToken({
        idToken: googleCredential,
        audience: GOOGLE_CLIENT_ID,
      })
      const payload = ticket.getPayload()
      profile = {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
      }
    } else {
      const gRes = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`)
      if (!gRes.ok) throw new Error('Google API error')
      const legacyProfile = await gRes.json()
      profile = { googleId: legacyProfile.id, email: legacyProfile.email, name: legacyProfile.name }
    }

    const { googleId, email, name } = profile
    if (!email) throw new Error('Google profile has no email')

    const user = await findOrCreateOAuthUser('google', googleId, email, name)

    await issueSession(req, res, user)
    await repository.trackEvent({ userId: user.id, type: 'auth_login', payload: { method: 'google' } })
    ok(res, { user: publicUser(user) })
  } catch (e) {
    console.error('Google OAuth error:', e)
    fail(res, 401, 'Google 인증에 실패했습니다', 'OAUTH_FAILED')
  }
})

// ─── Auth: Naver OAuth ────────────────────────────────────
app.post('/api/auth/naver', authLimiter, async (req, res) => {
  const parsed = validateOAuthCodeBody(req.body)
  if (parsed.error) return fail(res, 400, parsed.error, 'VALIDATION_ERROR')
  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    return fail(res, 503, '네이버 OAuth 설정이 필요합니다', 'OAUTH_NOT_CONFIGURED')
  }

  const { code, state, redirectUri } = parsed.values
  if (!isAllowedOAuthRedirect(redirectUri, '/oauth/naver/callback')) {
    return fail(res, 400, '허용되지 않은 네이버 OAuth 콜백 주소입니다', 'INVALID_OAUTH_REDIRECT')
  }

  try {
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: NAVER_CLIENT_ID,
      client_secret: NAVER_CLIENT_SECRET,
      redirect_uri: redirectUri,
      code,
      state,
    })
    const tokenRes = await fetch(`https://nid.naver.com/oauth2.0/token?${tokenParams.toString()}`, {
      headers: {
        'X-Naver-Client-Id': NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
      },
    })
    const tokenJson = await tokenRes.json()
    if (!tokenRes.ok || !tokenJson.access_token) throw new Error(tokenJson.error_description || 'Naver token error')

    const profileRes = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
        'X-Naver-Client-Id': NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
      },
    })
    const profileJson = await profileRes.json()
    const profile = profileJson.response || {}
    if (!profileRes.ok || !profile.id || !profile.email) throw new Error('Naver profile error')

    const user = await findOrCreateOAuthUser(
      'naver',
      profile.id,
      profile.email,
      profile.nickname || profile.name || profile.email.split('@')[0]
    )

    await issueSession(req, res, user)
    await repository.trackEvent({ userId: user.id, type: 'auth_login', payload: { method: 'naver' } })
    ok(res, { user: publicUser(user) })
  } catch (error) {
    console.error('Naver OAuth error:', error.message)
    fail(res, 401, '네이버 인증에 실패했습니다', 'OAUTH_FAILED')
  }
})

// ─── Auth: Kakao OAuth ────────────────────────────────────
app.post('/api/auth/kakao', async (req, res) => {
  const { code } = req.body
  if (!code) return fail(res, 400, 'code가 필요합니다', 'VALIDATION_ERROR')
  if (!process.env.KAKAO_APP_KEY) return fail(res, 503, 'Kakao OAuth 설정이 필요합니다', 'OAUTH_NOT_CONFIGURED')

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

    const user = await findOrCreateOAuthUser('kakao', kakaoId, email, nickname)

    await issueSession(req, res, user)
    await repository.trackEvent({ userId: user.id, type: 'auth_login', payload: { method: 'kakao' } })
    ok(res, { user: publicUser(user) })
  } catch (e) {
    console.error('Kakao OAuth error:', e)
    fail(res, 401, '카카오 인증에 실패했습니다', 'OAUTH_FAILED')
  }
})

// ─── Auth: Me ─────────────────────────────────────────────
app.get('/api/auth/me', auth, (req, res) => {
  const user = req.authUser
  ok(res, publicUser(user))
})

app.get('/api/auth/csrf', (req, res) => {
  const token = ensureCsrfCookie(req, res)
  ok(res, { csrfToken: token })
})

app.post('/api/auth/refresh', requireCsrf, async (req, res) => {
  const refreshToken = getCookies(req)[REFRESH_COOKIE]
  if (!refreshToken) return fail(res, 401, '세션 갱신 정보가 없습니다', 'REFRESH_REQUIRED')

  const session = await repository.findSessionByRefreshTokenHash(hashToken(refreshToken))
  if (!session) {
    clearCookie(res, ACCESS_COOKIE)
    clearCookie(res, REFRESH_COOKIE)
    clearCookie(res, CSRF_COOKIE, false)
    return fail(res, 401, '세션이 만료되었습니다', 'INVALID_REFRESH')
  }

  const user = await repository.findUserById(session.userId)
  if (!user || user.disabledAt) {
    await repository.revokeSession(session.id)
    return fail(res, 401, '유효하지 않은 사용자입니다', 'INVALID_TOKEN')
  }

  await issueSession(req, res, user, session)
  ok(res, { user: publicUser(user) })
})

app.post('/api/auth/logout', requireCsrf, async (req, res) => {
  await revokeRefreshCookie(req)
  clearCookie(res, ACCESS_COOKIE)
  clearCookie(res, REFRESH_COOKIE)
  clearCookie(res, CSRF_COOKIE, false)
  ok(res, {})
})

// ─── Portfolio ────────────────────────────────────────────
app.get('/api/portfolio', auth, async (req, res) => {
  const portfolio = await repository.getPortfolio(req.user.id)
  ok(res, portfolio)
})

app.put('/api/portfolio', auth, requireCsrf, async (req, res) => {
  const parsed = validatePortfolioBody(req.body)
  if (parsed.error) return fail(res, 400, parsed.error, 'VALIDATION_ERROR')
  const portfolio = await repository.savePortfolio(req.user.id, parsed.values)
  await repository.trackEvent({
    userId: req.user.id,
    type: 'portfolio_save',
    payload: {
      accountCount: parsed.values.accounts.length,
      holdingCount: parsed.values.accounts.reduce((sum, account) => sum + account.holdings.length, 0),
    },
  })
  ok(res, portfolio, '포트폴리오가 저장되었습니다.')
})

// ─── Stock Quotes (Yahoo Finance) ─────────────────────────
// 한국(6자리): 005930 → 005930.KS / 미국: SPY, QQQ 등 그대로

// 단일 종목 현재가
app.get('/api/quote/:ticker', async (req, res) => {
  noStore(res)
  const ticker = sanitizeTicker(req.params.ticker)
  if (!ticker) return fail(res, 400, '종목 코드 형식이 올바르지 않습니다', 'VALIDATION_ERROR')
  try {
    const data = await getQuote(ticker)
    ok(res, data)
  } catch (e) {
    console.error(`[Quote] ${ticker}:`, e.message)
    fail(res, 502, e.message, 'QUOTE_FAILED', { ticker })
  }
})

// 복수 종목 현재가 (배치) — POST { tickers: ['SPY','005930',...] }
app.post('/api/quotes', async (req, res) => {
  noStore(res)
  const parsed = validateTickersBody(req.body)
  if (parsed.error) return fail(res, 400, parsed.error, 'VALIDATION_ERROR')
  const { tickers } = parsed.values

  const results = await Promise.allSettled(tickers.map((t) => getQuote(t)))

  const quotes = {}
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') quotes[tickers[i]] = r.value
    else quotes[tickers[i]] = {
      error: r.reason?.message,
      ticker: tickers[i],
      source: 'unavailable',
      updatedAt: new Date().toISOString(),
      stale: true,
      isEstimated: false,
      errors: [r.reason?.message || '시세 조회 실패'],
    }
  })

  const fx = await getFxRates()
  const failedCount = Object.values(quotes).filter((quote) => quote.error).length
  if (failedCount) {
    await repository.trackEvent({ type: 'quote_batch_failed', payload: { failedCount, requestedCount: tickers.length } })
  }

  ok(res, { quotes, fx, updatedAt: new Date().toISOString() })
})

// 히스토리 (월봉)
app.get('/api/history/:ticker', async (req, res) => {
  noStore(res)
  const ticker = sanitizeTicker(req.params.ticker)
  if (!ticker) return fail(res, 400, '종목 코드 형식이 올바르지 않습니다', 'VALIDATION_ERROR')
  const { months } = validateHistoryQuery(req.query).values
  try {
    const data = await getHistory(ticker, months)
    ok(res, data)
  } catch (e) {
    console.error(`[History] ${ticker}:`, e.message)
    fail(res, 502, e.message, 'HISTORY_FAILED')
  }
})

// 차트 캔들 (StockChart용) — range: 1d|1w|1m|3m|1y|5y
app.get('/api/chart/:ticker', async (req, res) => {
  noStore(res)
  const ticker = sanitizeTicker(req.params.ticker)
  if (!ticker) return fail(res, 400, '종목 코드 형식이 올바르지 않습니다', 'VALIDATION_ERROR')
  const { range } = validateChartQuery(req.query).values
  try {
    const data = await getChart(ticker, range)
    ok(res, data)
  } catch (e) {
    console.error(`[Chart] ${ticker}:`, e.message)
    fail(res, 502, e.message, 'CHART_FAILED', { ticker, range })
  }
})

// ─── Misc ─────────────────────────────────────────────────
app.get('/api/health', async (_, res) => {
  const checkedAt = new Date().toISOString()
  try {
    const storage = await repository.health()
    ok(res, {
      status: 'ok',
      service: 'moayo-api',
      timestamp: checkedAt,
      storage,
      rateLimit: process.env.UPSTASH_REDIS_REST_URL ? 'distributed' : 'memory',
      realtime: REALTIME_WS_URL
        ? 'external-websocket'
        : IS_VERCEL ? 'rest-polling-on-vercel'
          : process.env.FINNHUB_API_KEY ? 'embedded-websocket' : 'polling',
    })
  } catch {
    fail(res, 503, '저장소 연결을 확인하지 못했습니다', 'HEALTH_CHECK_FAILED', { timestamp: checkedAt })
  }
})

app.get('/api/health/live', (_, res) =>
  ok(res, { status: 'ok', timestamp: new Date().toISOString() })
)

app.get('/api/health/ready', async (_, res) => {
  try {
    const storage = await repository.health()
    const checks = {
      jwtSecret: Boolean(JWT_SECRET && JWT_SECRET.length >= 32),
      appUrl: Boolean(APP_URL),
      allowedOrigins: ALLOWED_ORIGINS.length > 0,
      database: storage.adapter === 'postgres' || !IS_PROD,
      smtp: !IS_PROD || Boolean(transporter),
      migrations: !process.env.DATABASE_URL || storage.migrations >= 1,
      realtimeEndpoint: !IS_PROD || process.env.VITE_ENABLE_REALTIME_WS !== 'true' || Boolean(REALTIME_WS_URL),
    }
    const ready = Object.values(checks).every(Boolean)
    if (!ready) {
      return fail(res, 503, '서비스 준비 상태가 아닙니다', 'NOT_READY', { checks, storage })
    }
    ok(res, { status: 'ready', timestamp: new Date().toISOString(), storage, checks })
  } catch (error) {
    fail(res, 503, '서비스 준비 상태가 아닙니다', 'NOT_READY', { error: error.message })
  }
})

app.get('/api/portfolio/benchmarks', (_, res) => {
  ok(res, {
    benchmarks: [
      { id: 'sp500',      name: 'S&P 500',    cagr: 10.7, sharpe: 0.71, maxDrawdown: 33.8 },
      { id: 'global',     name: '글로벌 시장', cagr: 8.9,  sharpe: 0.57, maxDrawdown: 31.2 },
      { id: 'allWeather', name: '올웨더',      cagr: 7.2,  sharpe: 0.87, maxDrawdown: 13.1 },
    ],
  })
})

// ─── 글로벌 에러 핸들러 ───────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[Error]', err.message)
  Sentry.captureException(err)
  const status = err.status || 500
  fail(res, status, IS_PROD ? '서버 오류가 발생했습니다' : err.message, 'SERVER_ERROR')
})

export function startServer(port = PORT, host = HOST) {
  const server = createServer(app)
  if (process.env.ENABLE_EMBEDDED_REALTIME_WS !== 'false') attachRealtimeServer(server)
  server.listen(port, host, () => {
    console.log(`\nMoayo API  http://${host}:${port}`)
    if (!IS_PROD && !transporter) console.log('[DEV] SMTP 미설정 - 인증 링크는 콘솔에 출력됩니다\n')
  })
  return server
}

if (!IS_VERCEL) startServer()

export default app

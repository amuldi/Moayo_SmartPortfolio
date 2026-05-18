import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { mkdtempSync, readFileSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { EventEmitter } from 'events'
import httpMocks from 'node-mocks-http'

function mergeCookies(jar, response) {
  const raw = response._getHeaders()['set-cookie']
  const cookies = Array.isArray(raw) ? raw : raw ? [raw] : []
  cookies.forEach((cookie) => {
    const [pair] = cookie.split(';')
    const [name, value] = pair.split('=')
    if (value) jar[name] = value
    else delete jar[name]
  })
  return jar
}

function cookieHeader(jar) {
  return Object.entries(jar).map(([key, value]) => `${key}=${value}`).join('; ')
}

function parseJson(response) {
  const data = response._getData()
  return data ? JSON.parse(data) : null
}

describe('auth and portfolio API', () => {
  let app
  let jar
  let dbPath
  let tmpDir

  async function dispatch(method, url, { body, headers = {} } = {}) {
    const requestHeaders = {
      ...headers,
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(Object.keys(jar).length ? { cookie: cookieHeader(jar) } : {}),
    }
    const req = httpMocks.createRequest({
      method,
      url,
      headers: requestHeaders,
      body,
    })
    const res = httpMocks.createResponse({ eventEmitter: EventEmitter })

    await new Promise((resolve, reject) => {
      res.on('end', resolve)
      app.handle(req, res, (error) => {
        if (error) reject(error)
        else resolve()
      })
    })

    mergeCookies(jar, res)
    return {
      status: res.statusCode,
      body: parseJson(res),
      headers: res._getHeaders(),
    }
  }

  beforeAll(async () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'moayo-api-'))
    dbPath = join(tmpDir, 'db.json')
    process.env.VERCEL = '1'
    process.env.DB_PATH = dbPath
    process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters'
    process.env.APP_URL = 'http://127.0.0.1:3001'
    process.env.ALLOWED_ORIGINS = 'http://127.0.0.1:3001'

    app = (await import('../../server/server.js')).default
    jar = {}
  })

  afterAll(async () => {
    rmSync(tmpDir, { recursive: true, force: true })
  })

  it('uses httpOnly cookies, CSRF, refresh, and portfolio persistence', async () => {
    const email = `user-${Date.now()}@example.com`
    const register = await dispatch('POST', '/api/auth/register', {
      body: { username: 'Tester', email, password: 'password123' },
    })
    expect(register.status).toBe(200)

    const db = JSON.parse(readFileSync(dbPath, 'utf8'))
    const token = db.users.find((user) => user.email === email).verificationToken
    const verify = await dispatch('GET', `/api/auth/verify?token=${token}`)
    expect(verify.status).toBe(200)

    const login = await dispatch('POST', '/api/auth/login', {
      body: { email, password: 'password123' },
    })
    expect(login.body.data.user.email).toBe(email)
    expect(login.body.data.token).toBeUndefined()
    expect(login.headers['set-cookie'].join('\n')).toContain('moayo_access=')
    expect(login.headers['set-cookie'].join('\n')).toContain('moayo_refresh=')
    expect(login.headers['set-cookie'].join('\n')).toContain('HttpOnly')

    const csrf = await dispatch('GET', '/api/auth/csrf')
    const csrfToken = csrf.body.data.csrfToken

    const rejectedSave = await dispatch('PUT', '/api/portfolio', { body: { accounts: [] } })
    expect(rejectedSave.status).toBe(403)

    const save = await dispatch('PUT', '/api/portfolio', {
      headers: { 'x-csrf-token': csrfToken },
      body: {
        currentPortfolioId: 'default',
        currentPortfolioName: '기본 포트폴리오',
        accounts: [{
          id: 'a1',
          name: 'ISA',
          type: 'ISA',
          totalCapital: 1000000,
          holdings: [{
            id: 'h1',
            ticker: '005930',
            name: '삼성전자',
            quantity: 1,
            avgPrice: 70000,
            targetWeight: 50,
          }],
        }],
      },
    })
    expect(save.status).toBe(200)

    const rejectedRefresh = await dispatch('POST', '/api/auth/refresh')
    expect(rejectedRefresh.status).toBe(403)

    const refresh = await dispatch('POST', '/api/auth/refresh', {
      headers: { 'x-csrf-token': csrfToken },
    })
    expect(refresh.status).toBe(200)

    const portfolio = await dispatch('GET', '/api/portfolio')
    expect(portfolio.body.data.accounts[0].holdings[0].ticker).toBe('005930')

    const logout = await dispatch('POST', '/api/auth/logout', {
      headers: { 'x-csrf-token': csrfToken },
    })
    expect(logout.status).toBe(200)

    const afterLogout = await dispatch('GET', '/api/portfolio')
    expect(afterLogout.status).toBe(401)
  })
})

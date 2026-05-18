import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { loadLocalEnv } from '../server/env.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = resolve(__dirname, '..')

loadLocalEnv(ROOT_DIR, resolve(ROOT_DIR, 'server'))

const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'APP_URL',
  'ALLOWED_ORIGINS',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'GOOGLE_CLIENT_ID',
  'VITE_GOOGLE_CLIENT_ID',
  'NAVER_CLIENT_ID',
  'VITE_NAVER_CLIENT_ID',
  'NAVER_CLIENT_SECRET',
]

const missing = required.filter((key) => !process.env[key])
const problems = []

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  problems.push('JWT_SECRET must be at least 32 characters.')
}

if (process.env.APP_URL) {
  try {
    const appOrigin = new URL(process.env.APP_URL).origin
    const allowed = String(process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
      .map((origin) => new URL(origin).origin)

    if (!allowed.includes(appOrigin)) {
      problems.push('ALLOWED_ORIGINS must include APP_URL origin.')
    }
  } catch {
    problems.push('APP_URL and ALLOWED_ORIGINS must be valid absolute URLs.')
  }
}

if (process.env.VITE_ENABLE_REALTIME_WS === 'true' && !process.env.VITE_REALTIME_WS_URL) {
  problems.push('VITE_REALTIME_WS_URL is required when VITE_ENABLE_REALTIME_WS=true in production.')
}

if (missing.length || problems.length) {
  console.error('Production environment is not ready.')
  if (missing.length) console.error(`Missing: ${missing.join(', ')}`)
  problems.forEach((problem) => console.error(`- ${problem}`))
  process.exit(1)
}

console.log('Production environment variables look ready.')

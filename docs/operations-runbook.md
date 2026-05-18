# Moayo Public Beta Operations Runbook

## Release Gate

Run these before promoting a deployment:

```bash
npm run env:check
npm run lint
npm run test
npm run build
npm run budget
```

Run Playwright when browser dependencies are installed:

```bash
npm run test:e2e
```

## Database

Production storage uses Neon Postgres through `DATABASE_URL`.

```bash
npm run db:migrate
```

Required checks:

- `schema_migrations` contains `001_public_beta_foundation`.
- `/api/health/ready` returns `status: ready`.
- Neon automated backups are enabled before public beta traffic.
- JSON storage is only accepted in local development.

## Required Environment Variables

- `DATABASE_URL`
- `JWT_SECRET`
- `APP_URL`
- `ALLOWED_ORIGINS`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `VITE_GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_ID`
- `VITE_NAVER_CLIENT_ID`, `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`

Optional:

- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` for distributed rate limits.
- `VITE_REALTIME_WS_URL` to connect the deployed web app to the dedicated realtime server.
- `FINNHUB_API_KEY`, `REALTIME_ALLOWED_ORIGINS`, `REALTIME_PORT` for the dedicated realtime server.
- `SENTRY_DSN`, `VITE_SENTRY_DSN` for server/client error tracking.

## OAuth Redirects

Register these production URLs with the provider dashboards:

- Naver callback: `https://moayo-smartportfolio.vercel.app/oauth/naver/callback`
- Google JavaScript origin: `https://moayo-smartportfolio.vercel.app`

## Realtime Service

Run the realtime process on a long-lived host such as Railway, Render, or Fly.io:

```bash
npm run realtime
```

Required realtime env vars:

- `FINNHUB_API_KEY`
- `REALTIME_ALLOWED_ORIGINS=https://moayo-smartportfolio.vercel.app`
- `REALTIME_WS_PATH=/ws`

Then set this in Vercel Production:

```bash
VITE_ENABLE_REALTIME_WS=true
VITE_REALTIME_WS_URL=wss://<realtime-host>/ws
```

## Incident Checklist

- Login failures: check `/api/health/ready`, OAuth callback origins, SMTP, and cookie domain/SameSite behavior.
- Portfolio save failures: check Neon availability, migration status, and `portfolio_save` events.
- Quote failures: confirm Yahoo quote reachability; the app should show stale/unavailable status instead of silently using mock prices.
- Data restoration: restore from Neon backup, then verify one affected user with `/api/portfolio` after login.

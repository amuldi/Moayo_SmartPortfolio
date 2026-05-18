# Moayo Public Beta Operations Runbook

## Release Gate

Run these before promoting a deployment:

```bash
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
- `FINNHUB_API_KEY` for local websocket realtime quotes.
- `SENTRY_DSN`, `VITE_SENTRY_DSN` for server/client error tracking.

## Incident Checklist

- Login failures: check `/api/health/ready`, OAuth callback origins, SMTP, and cookie domain/SameSite behavior.
- Portfolio save failures: check Neon availability, migration status, and `portfolio_save` events.
- Quote failures: confirm Yahoo quote reachability; the app should show stale/unavailable status instead of silently using mock prices.
- Data restoration: restore from Neon backup, then verify one affected user with `/api/portfolio` after login.

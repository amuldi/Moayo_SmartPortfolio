# Moayo Launch Checklist

## Product / UX

- [x] First viewport explains the service within 5 seconds.
- [x] Guest sample diagnosis leads directly to the rebalancing screen.
- [x] Guest portfolio data is preserved when an authenticated account has no server portfolio yet.
- [x] Primary CTAs distinguish sample diagnosis, account creation, and portfolio editing.
- [x] Empty states guide users through account, holding, target weight, and rebalancing steps.

## Frontend

- [x] Landing, dashboard, portfolio, and rebalancing pages use shared tokens and calmer financial styling.
- [x] Mobile bottom navigation is available for core app routes.
- [x] Charts render explicit empty states instead of blank cards.
- [x] Dashboard includes total value, P/L, return, account/category/region allocation, risk alerts, and next action.
- [x] Rebalancing view includes current vs target weight, reference adjustment amount, account priority, tax note, and disclaimer.
- [x] Add automated Playwright tests for guest flow and core rebalancing surface.
- [x] Add a build-size budget script as the baseline performance gate.

## Backend / Data

- [x] API responses use a consistent success/error envelope.
- [x] Server validates auth, portfolio, quote, history, and chart inputs.
- [x] JSON storage is behind a repository adapter.
- [x] Postgres schema draft is available at `server/db/schema.sql`.
- [x] Health endpoints include `/api/health`, `/api/health/live`, and `/api/health/ready`.
- [x] Implement a Postgres repository adapter using `DATABASE_URL`.
- [x] Add migrations and transaction-based portfolio replace/upsert.
- [x] Production API refuses JSON flat-file storage and requires external Postgres.

## Security

- [x] Production API refuses to start without a strong `JWT_SECRET`.
- [x] Verification tokens are omitted from request logs.
- [x] SMTP is required in production for email verification.
- [x] Placeholder OAuth keys were removed from `.env.example`.
- [x] Kakao/Apple-like incomplete login surfaces are hidden from the primary auth UI.
- [x] Move auth from localStorage bearer token to httpOnly cookie sessions with refresh rotation.
- [x] Add Google ID token audience validation.
- [x] Naver OAuth uses authorization-code popup flow with redirect origin validation and server-side token exchange.
- [x] Use an optional Upstash Redis distributed rate limit store for Vercel/multi-instance production.
- [x] Add optional Sentry error tracking for server and client runtime errors.
- [x] Add `npm run env:check` to catch missing production DB, SMTP, JWT, and OAuth variables.

## Deployment

- [x] `npm run build` passes.
- [x] Vercel no longer bundles `server/db.json`.
- [x] WebSocket realtime is separated into `npm run realtime` for long-lived hosts.
- [x] `npm run test`, `npm run test:e2e`, `npm run lint`, and `npm run budget` are available as release gates.
- [ ] Confirm production environment uses Node.js 22+.
- [ ] Configure `JWT_SECRET`, `APP_URL`, `ALLOWED_ORIGINS`, SMTP, `DATABASE_URL`, OAuth ids, optional Upstash env vars, and optional Sentry DSNs in Vercel.
- [ ] Configure `VITE_REALTIME_WS_URL` after the dedicated realtime server has a public `wss://` URL.
- [ ] Verify `/api/health/ready` after deploy.

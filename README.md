# Daily Devotion Bot

A platform that delivers a daily Bible verse, sermon, and worship song link to
subscribers over WhatsApp, with monetization (free/paid tiers, one-time
bundles, per-devotion unlocks) via M-Pesa, and an owner dashboard for
authoring/scheduling content.

## Architecture

- **`apps/backend`** — NestJS API: owner auth, devotions CRUD/scheduling,
  subscriber management, WhatsApp webhook + onboarding bot, M-Pesa payment
  webhook + entitlement logic, a cron-driven dispatch scheduler, and reporting.
  Deploys to a persistent host (Railway/Render/VPS) — not Vercel serverless —
  since it runs an in-process cron scheduler and needs to be reachable as a
  webhook target at all times.
- **`apps/frontend`** — React (Vite) SPA dashboard for the owner: author/
  schedule devotions, view subscribers, view revenue/delivery reports.
  Deploys to Vercel as static assets.
- **`packages/shared`** — TypeScript types, zod schemas, and enums shared
  between backend and frontend (single source of truth for API contracts).

WhatsApp (Meta Cloud API) and M-Pesa (Safaricom Daraja) are both integrated
behind a swappable client interface. Until real credentials are available,
`WHATSAPP_PROVIDER=mock` and `MPESA_PROVIDER=mock` (the defaults) use fully
mocked clients that log sends to the console and expose a dev-only endpoint to
simulate the customer completing an M-Pesa payment. Swapping to production
credentials later is a config change plus filling in the stubbed
`MetaWhatsappClient` / `DarajaMpesaClient` classes — no controller or business
logic changes required.

## Local setup

Requires Node 20+, pnpm, and Docker (for local Postgres).

```bash
pnpm install

# start local Postgres
docker compose up -d

# configure the backend
cp .env.example apps/backend/.env   # edit ADMIN_EMAIL/ADMIN_PASSWORD/JWT_SECRET etc.

# run migrations + seed the owner account
pnpm --filter @devotion/backend prisma:migrate
pnpm --filter @devotion/backend prisma:seed

# run both apps
pnpm dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173 (reads `apps/frontend/.env` for `VITE_API_BASE_URL`)

## Manual end-to-end walkthrough (mocked flow)

This proves the full mocked journey — onboarding, payment, entitlement, and
idempotent daily dispatch — without any real WhatsApp/M-Pesa credentials.

```bash
# 1. Log in as the owner
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@example.com","password":"<ADMIN_PASSWORD>"}' | jq -r .accessToken)

# 2. Author today's devotion
curl -s -X POST http://localhost:3000/devotions \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"date":"2026-07-16","verseText":"...","verseReference":"John 3:16","sermonText":"...","songUrl":"https://youtube.com/...","scheduledSendAt":"06:00","isPremiumSermon":true}'

# 3. Simulate a subscriber messaging in and choosing the free tier
curl -s -X POST http://localhost:3000/dev/mock-whatsapp-inbound \
  -H "Content-Type: application/json" -H "x-dev-secret: <DEV_ENDPOINTS_SECRET>" \
  -d '{"from":"254700000001","text":"hi"}'
curl -s -X POST http://localhost:3000/dev/mock-whatsapp-inbound \
  -H "Content-Type: application/json" -H "x-dev-secret: <DEV_ENDPOINTS_SECRET>" \
  -d '{"from":"254700000001","text":"1"}'

# 4. Simulate a second subscriber choosing Premium (generates a mock M-Pesa payment link)
curl -s -X POST http://localhost:3000/dev/mock-whatsapp-inbound \
  -H "Content-Type: application/json" -H "x-dev-secret: <DEV_ENDPOINTS_SECRET>" \
  -d '{"from":"254700000002","text":"hi"}'
curl -s -X POST http://localhost:3000/dev/mock-whatsapp-inbound \
  -H "Content-Type: application/json" -H "x-dev-secret: <DEV_ENDPOINTS_SECRET>" \
  -d '{"from":"254700000002","text":"2"}'
# -> note the checkoutRequestId logged by MockWhatsappClient/MockMpesaClient

# 5. Simulate that subscriber completing the M-Pesa payment on their phone
curl -s -X POST http://localhost:3000/mock-pay/<checkoutRequestId>/complete \
  -H "x-dev-secret: <DEV_ENDPOINTS_SECRET>"
# -> subscriber becomes tier=PAID, status=ACTIVE, and immediately receives
#    today's full devotion if one exists and hasn't been sent yet

# 6. Manually trigger the daily dispatch (mirrors what the cron does at scheduledSendAt)
curl -s -X POST http://localhost:3000/scheduler/dispatch/<devotionId> -H "Authorization: Bearer $TOKEN"
# -> free subscriber gets verse-only content; paid subscriber's delivery was
#    already recorded in step 5, so this reports it as "already processed"

# 7. Re-run step 6 — zero new sends, proving the DeliveryLog unique constraint
#    makes dispatch idempotent across cron restarts / manual re-triggers

# 8. Check reports
curl -s http://localhost:3000/reports/revenue -H "Authorization: Bearer $TOKEN"
curl -s http://localhost:3000/reports/subscribers/summary -H "Authorization: Bearer $TOKEN"
```

Or just log into the dashboard at http://localhost:5173 to see the same data
rendered in the Devotions / Subscribers / Reports pages.

## Deployment

- **Frontend**: deploy `apps/frontend` to Vercel (set `VITE_API_BASE_URL` to
  the deployed backend URL).
- **Backend**: deploy `apps/backend` to Railway/Render (or any host that runs
  a persistent Node process) as a single instance — the in-process cron
  scheduler and DeliveryLog-based idempotency assume one running instance.
  Set `DATABASE_URL` to your Supabase Postgres connection string (append
  `?pgbouncer=true` if using the pooler), and set all secrets from
  `.env.example`.
- Point the Meta WhatsApp Cloud API webhook and the Safaricom Daraja callback
  URL at the deployed backend's `/webhooks/whatsapp` and `/webhooks/mpesa`
  routes, then set `WHATSAPP_PROVIDER=meta` / `MPESA_PROVIDER=daraja` once
  `MetaWhatsappClient` / `DarajaMpesaClient` are implemented with real
  credentials.

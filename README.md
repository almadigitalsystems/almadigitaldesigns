# Alma Digital Services — almadigitaldesigns

Production website for [almadigitalservices.com](https://almadigitalservices.com).

## Branches

| Branch | Environment | URL |
|--------|-------------|-----|
| `master` | Production | https://almadigitalservices.com |
| `staging` | Staging | https://staging.almadigitalservices.com |

## Deployment Workflow (MANDATORY)

**All changes go to `staging` first. Never push directly to `master` unless it is a hotfix.**

1. Push code changes to the `staging` branch.
2. Railway auto-deploys staging to `staging.almadigitalservices.com`.
3. Verify the health check passes: `GET https://staging.almadigitalservices.com/health` must return `{"status":"ok"}`.
4. Test the change manually on staging.
5. Only after verification: merge `staging` → `master` (Railway auto-deploys to production).

## Health Check

```
GET /health
→ 200 { "status": "ok", "env": "...", "ts": "..." }
```

Railway staging service should be configured with a health check at `/health`. If it fails, do not promote to production.

## Environment Variables

Required on both Railway services:

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Claude API key for Alex chat widget |
| `STRIPE_SECRET_KEY` | Stripe secret key for checkout sessions |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `BASE_URL` | Public URL (production: `https://almadigitalservices.com`, staging: `https://staging.almadigitalservices.com`) |
| `GMAIL_USER_1` | Gmail account for outbound emails |
| `GMAIL_CLIENT_ID` | Gmail OAuth2 client ID |
| `GMAIL_CLIENT_SECRET` | Gmail OAuth2 client secret |
| `GMAIL_REFRESH_TOKEN_1` | Gmail OAuth2 refresh token |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token for DNS/domain ops |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `PAPERCLIP_API_URL` | Paperclip control plane URL |
| `PAPERCLIP_COMPANY_ID` | Paperclip company ID |

## Railway Setup

Two services in the same Railway project:

- **almadigitalservices** (production) — connected to `master` branch
- **almadigitalservices-staging** (staging) — connected to `staging` branch, custom domain `staging.almadigitalservices.com`

Staging DNS (Cloudflare): add a CNAME record `staging` → the Railway staging service URL (proxied).

## Pages

| Route | File |
|-------|------|
| `/` | `index.html` |
| `/checkout` | `checkout.html` — Stripe pricing page |
| `/thank-you` | `thank-you.html` — post-payment confirmation |
| `/portfolio` | `portfolio.html` |
| `/referral` | `referral.html` |
| `/health` | server.js endpoint |
| `/api/chat` | Alex AI support chat |
| `/api/create-checkout-session` | Stripe Checkout Session creator |
| `/api/stripe-webhook` | Stripe webhook handler |

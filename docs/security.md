# Security

Threat model is **portfolio-honest**: stop tenant leaks, stolen keys, brute force, SSRF, and secret commits. Not a pentest report.

## Threats we design for

| Threat | Control |
|---|---|
| Read another org’s events | Membership + `project.organization_id` on every query; 404 |
| Ingest into another project | Key bound to one `project_id` |
| Stolen dashboard session | Short JWT, hashed refresh, rotation, logout revoke |
| Stolen API key | Hash at rest, show once, revoke, prefix in logs not full key |
| Credential stuffing | Rate limit login/register by IP |
| SSRF via webhook | URL policy below |
| XSS stealing tokens | Access token in memory; refresh httpOnly; no localStorage |
| Info leak | Same 404 for missing vs forbidden tenant; no stacks to clients |
| Secret in git | `.env` gitignored; examples only in `.env.example` |

## Passwords and JWT

- Argon2id (preferred) with a documented cost. Pepper optional via env `PASSWORD_PEPPER`.
- Access JWT: HS256, `sub` = user id, `exp` ~15m, secret `JWT_SECRET` ≥ 32 bytes.
- Refresh: 32+ random bytes, store SHA-256, TTL 7 days, rotate on refresh, reuse of revoked token → revoke **all** sessions for that user (theft signal).

## API keys

- Format: `pw_live_` or `pw_test_` + high-entropy random.
- Store `SHA-256(key)` or `HMAC-SHA256(pepper, key)`. Compare in constant time.
- Redis cache TTL 60s; **delete on revoke**.
- List/create keys: not `viewer`. Audit `api_key.created` / `api_key.revoked`.

## Rate limits (Redis)

| Surface | Key | Starting budget |
|---|---|---|
| `POST /auth/login`, `/auth/register` | IP | 10 / 15 min |
| `POST /auth/refresh` | IP + user | 30 / min |
| Human API (JWT) | user id | 120 / min |
| Ingest | API key id | **1000 events / min** |
| Ingest (coarse) | IP | 600 requests / min |

Exceed → **429** + `Retry-After`. Fail closed if Redis down on ingest (503). For login, if Redis down: fail closed **503** (do not allow unlimited login).

## HTTP hardening

- Helmet (CSP later for web; API: `X-Content-Type-Options`, `Referrer-Policy`, frame deny).
- CORS: allowlist the web origin only. Credentials true because of refresh cookie. Ingest does not need CORS for server SDKs; browser ingest is not a goal.
- Body parser limit **1 MB** global; ingest same.
- Trust proxy in production (ALB) so rate-limit IP is `X-Forwarded-For` **last trusted hop** only.

## Webhook SSRF

On create/update **and** before each request:

1. URL must parse; scheme `https` except `http` allowed when `NODE_ENV=development` (Mailpit/local tests).
2. Reject credentials in URL, userinfo, and non-default ports except 443/80.
3. Resolve DNS; reject if **any** address is:
   - loopback (`127.0.0.0/8`, `::1`)
   - RFC1918 (`10/8`, `172.16/12`, `192.168/16`)
   - link-local (`169.254/16`, `fe80::/10`)
   - CGNAT `100.64/10`
   - metadata (`169.254.169.254`, `fd00:ec2::254`)
   - multicast / unspecified
4. Connect to the resolved address (not blindly to hostname after a redirect to a new host). **Do not follow redirects** in MVP (max 0).
5. Timeout **5s**. Limit response body read (e.g. 8 KiB) for logging.
6. Sign body: `X-PulseWatch-Signature: sha256=<hmac>` over raw JSON with destination secret.

Failure to pass checks → **400** on save; delivery `failed` with reason `ssrf_blocked` if something slips through at send time.

## Error responses

Safe messages. Log internally with `requestId`. Validation `details` may name fields, not secrets.

## Audit

Write `audit_events` for: member add/role/remove, API key create/revoke, alert rule delete, destination create/delete, org delete.

## Secrets

Env only: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `API_KEY_PEPPER`, `PASSWORD_PEPPER`, `SMTP_*` / SES, `WEBHOOK_*` none global. Never log tokens or `X-Api-Key`.

## Related

- [architecture/tenancy-and-auth.md](./architecture/tenancy-and-auth.md)
- [api/conventions.md](./api/conventions.md)
- [reliability.md](./reliability.md)

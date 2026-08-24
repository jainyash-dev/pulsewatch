# Testing strategy

Tests start in **Phase 1**, not Phase 9. Phase 9 fills gaps and adds Playwright + failure drills.

## Layers

| Layer | Tool | Where |
|---|---|---|
| Unit | Jest | Fingerprint, alert state machine, SSRF URL checks, histogram/p95 helper, DTO edge cases |
| API integration | Jest + Supertest | Nest + real Postgres + Redis (Compose or testcontainers) |
| Worker | Jest | Idempotent insert, watermark, poison event, retries (mocked SMTP/webhook) |
| E2E | Playwright | Compose stack; critical happy path only |

## Mandatory coverage

| Concern | Phase | Assert |
|---|---|---|
| Health live/ready | 1 | 200 when deps up; ready 503 if Redis/Postgres down |
| Register creates org + owner | 2 | DB rows |
| **Tenant isolation** | 2+ | User B **404** on user A’s `orgId`/`projectId` (events, dashboard, keys) |
| Viewer cannot mint keys | 2 | 403 |
| Ingest 202 + enqueue | 3 | Job in Redis; no event row yet |
| Ingest 401 bad key | 3 | |
| Ingest 413 / 400 limits | 3 | |
| Ingest 429 | 3 | |
| Ingest Redis down 503 | 3 | `Retry-After` |
| Duplicate `eventId` | 4 | One row |
| Error group count | 4 | +1 only on insert |
| Rollup once | 4 | Replay job does not double-count |
| Dashboard SQL uses `project_id` | 5 | Isolation tests with two projects |
| Alert fire + cooldown suppress | 6 | |
| Webhook SSRF rejected | 7 | 400 on save; no request to 169.254.169.254 |
| Webhook 500 then retry | 7 | delivery attempts |
| SDK retry same ids | 8 | nock/msw |

## Isolation test pattern

1. Create user A + org A + project A.
2. Create user B + org B + project B.
3. As B, `GET /organizations/{orgA}/projects/{projectA}/events` → **404**.
4. Ingest with A’s key; B still cannot read those events.

Repeat for dashboard, alert rules, and API keys.

## What not to test

- Pixel-perfect CSS
- Prisma internals
- Every Nest decorator

## CI

Unit + integration on every PR. Playwright on `main` or nightly (slow). See [ci-cd-and-deployment.md](./ci-cd-and-deployment.md).

## Related

- [security.md](./security.md)
- [reliability.md](./reliability.md)
- [product/mvp.md](./product/mvp.md)

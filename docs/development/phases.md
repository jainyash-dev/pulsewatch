# Development phases

Build incrementally. **Do not start a later phase until the previous phase’s deliverables exist.** Documentation is Phase 0 and is itself batched.

Tests start in Phase 1, not Phase 9. Phase 9 is hardening. Alert **design** includes notifications; implement destinations in Phase 6 and delivery in Phase 7.

## Phase 0 — Documentation (current)

Replace the old single brief with the tight `docs/` tree.

| Doc batch | Status | Deliverable |
|---|---|---|
| A — Spine | **Done** | Product, overview, principles, phases, repo structure, README |
| B — Lock the system | **Done** | ADRs, data-flow, tenancy/auth, ingest, processing/queues, alerting |
| C — Contracts | **Done** | Database, API, security, reliability |
| D — Satellite | Next | SDK, dashboard, observability, local/prod, testing, CI/CD, ops |
| E — Agent rules | After D | Remaining `.cursor/rules` that point at docs. Git rule already exists: agent never commit/push/pull/PR. |

**No production application code in Phase 0.**

## Phase 1 — Foundation

Monorepo (pnpm, Turbo), TypeScript strict, NestJS API, NestJS worker (idle-healthy), Next.js stub, PostgreSQL, Prisma (connection + migrate plumbing), Redis, Mailpit, Docker Compose, env example, ESLint, Prettier, health/live/ready, structured logs, request IDs, basic GitHub Actions.

**Not in Phase 1:** JWT, ingest, BullMQ processors, dashboard charts.

## Phase 2 — Authentication and multi-tenancy

Register/login/refresh/logout, password hashing, users, organizations, org-on-signup, membership, RBAC, projects, hashed API keys (create/list/revoke). Tenant isolation tests.

## Phase 3 — Event ingestion

`POST /api/v1/ingest`, validation, payload limits, rate limiting, API-key auth + Redis cache, enqueue, **202**. Redis down → **503 + Retry-After**.

## Phase 4 — Async processing

BullMQ worker: persist, idempotency, error groups, watermarks, rollup job, retries, failed jobs, graceful shutdown. Retention job can land here or with Phase 5.

## Phase 5 — Query and dashboard

Event query (filters, cursor pagination), error groups, dashboard summary/timeseries/top endpoints, Next.js pages, polling. Optional SSE only after this works.

## Phase 6 — Alerting

Alert rules, destinations (CRUD), scheduled evaluation, state, cooldown, execution history. Enqueue notify jobs; sending may wait for Phase 7.

## Phase 7 — Notifications

Email (Mailpit), webhook (timeout, retry, SSRF), delivery rows, test-destination endpoint.

## Phase 8 — SDK

Node.js SDK, docs, examples, sample application that generates traffic.

## Phase 9 — Testing and hardening

Fill gaps: rate-limit, authz, isolation, queue failure, webhook failure, duplicate event. Playwright for the critical happy path. Load-ish ingest check at demo scale.

## Phase 10 — Deployment

Production images, Actions deploy path, AWS architecture implemented or documented with a cost-capped demo, secrets, CloudWatch-style monitoring notes, production README section.

## Implementation order (frozen)

Foundation → auth/tenancy → ingest → worker → query/UI → alerts → notify → SDK → harden → deploy.

Do not build the SDK before ingest and query exist (payloads will churn).

## Related

- [mvp.md](../product/mvp.md) — product definition of done
- [repo-structure.md](./repo-structure.md)

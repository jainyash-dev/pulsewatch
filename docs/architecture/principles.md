# Architecture principles and engineering rules

## Stack (unless a new ADR says otherwise)

| Layer | Choice | Why |
|---|---|---|
| API / worker | Node.js, TypeScript (strict), NestJS | Matches target roles; DI and modules |
| Web | Next.js App Router, TypeScript | Enough UI to demo the product |
| Database | PostgreSQL 16 | One system for tenancy + telemetry at this scale |
| ORM | Prisma + `$queryRaw` for analytics | CRUD vs rollup/percentile SQL |
| Queue / cache | Redis 7, BullMQ | Jobs, rate limits, key cache |
| API style | REST `/api/v1` | Versioned, boring, interview-friendly |
| Dashboard live | HTTP polling 10–15s | Avoid WebSocket complexity |
| Auth | JWT + refresh; Argon2id (preferred) or bcrypt | Two planes with hashed API keys |
| Tests | Jest, Supertest, Playwright later | Isolation tests are mandatory |
| Quality | ESLint, Prettier | Consistent diffs |
| Local | Docker Compose | Postgres, Redis, Mailpit, API, worker, web |
| CI | GitHub Actions | Lint, typecheck, tests |
| Email | Mailpit local, SES production | No send in the API process |
| Monorepo | pnpm + Turborepo | Four apps, two packages |

**Do not add** Kafka, Kubernetes, Elasticsearch, ClickHouse, or extra services to look impressive.

## Engineering rules

1. Prefer simple architecture over optional complexity.
2. Every technology must solve a named problem in these docs.
3. Keep business logic out of controllers.
4. Use NestJS modules as boundaries; inject dependencies; keep classes focused.
5. Avoid giant services; split by responsibility (ingest vs query vs alerts).
6. Strong TypeScript; validate all external input (DTOs).
7. Handle errors intentionally; never swallow.
8. Never commit secrets; configuration via environment variables.
9. Test important logic **as we build**, especially authorization and tenant isolation.
10. Design APIs consistently (see Batch C conventions).
11. Add indexes from **access patterns**, not guesswork.
12. Avoid premature microservices and premature optimization.
13. Expensive work is asynchronous (persist, rollup, alert, notify).
14. Background jobs are retryable and **idempotent**.
15. Design for graceful failure; document it (Batch C reliability).
16. Another engineer should understand the system from `docs/` alone.
17. Same-origin dashboard: Next.js rewrites `/api/v1` to the API (cookies stay simple).
18. Prisma for CRUD; parameterized raw SQL for rollups and percentiles.
19. Do not evaluate alerts inside the ingest HTTP handler or per-event ingest job.
20. Do not store raw API keys.
21. Do not trust the frontend for tenant isolation.
22. When a decision conflicts with these rules, write or update an ADR first.

## Key tradeoffs (already chosen)

| Topic | We chose | We rejected | Why |
|---|---|---|---|
| Processes | API + worker | One Node process; many services | Real queue boundary, still operable |
| Event store | PostgreSQL | ES / ClickHouse | Right ops cost for MVP |
| Event tables | Unified `events` + metrics + rollups | Four parallel event schemas | Shared filters |
| Ingest ack | Queue-first 202 | Sync persist always | Fast ingest; accept lag |
| Redis down | 503 | Sync Postgres fallback | Honest, less code |
| Alerts | Scheduled on rollups | Per-event eval | Windowed rates |
| Live UI | Polling | WebSockets | Enough freshness |
| p95 | Histogram / short window | Exact p95 over 7 days on raw rows | Postgres honesty |
| Tenancy | Shared schema + `project_id` | Schema-per-tenant | Right size |
| Git | `main` + features | GitFlow `develop` | Solo repo |

## Related

- [overview.md](./overview.md)
- [../product/out-of-scope.md](../product/out-of-scope.md)

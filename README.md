# PulseWatch

A lightweight, multi-tenant observability and alerting platform (Datadog/Sentry-style) for application logs, errors, request metrics, and threshold alerts.

This is a **backend-first** portfolio project: event-driven ingest, queues, tenancy, and reliability matter more than dashboard polish.

**Status:** Phase 0 — documentation. Application code has not started. Docs are written in [batches](./docs/README.md); Batch A is complete.

## What it does

Teams register, create a workspace, register projects, mint hashed API keys, and send telemetry through a Node.js SDK or `POST /api/v1/ingest`. PulseWatch authenticates, validates, enqueues, and returns **202**. Workers persist events, roll up request stats, and evaluate alert rules on a schedule. The dashboard queries PostgreSQL for search, charts, and alert history. Notifications go out over email and webhooks.

## Architecture (snapshot)

```text
App → SDK → NestJS API → Redis (BullMQ) → NestJS worker → PostgreSQL
                ↑                               ↓
         Next.js dashboard              email / webhooks
```

Two processes, one modular monolith. Not a microservice mesh.

Details: [docs/architecture/overview.md](./docs/architecture/overview.md)

## Stack

| Layer | Choice |
|---|---|
| API / worker | Node.js, TypeScript, NestJS |
| Web | Next.js, TypeScript, React |
| Data | PostgreSQL, Prisma |
| Queue / cache | Redis, BullMQ |
| Auth | JWT + refresh tokens; hashed project API keys |
| Tests | Jest, Supertest, Playwright (later) |
| Local | Docker Compose |
| CI | GitHub Actions |
| Prod design | AWS (ECS, RDS, ElastiCache, SES, CloudFront) |

## Documentation

Start at **[docs/README.md](./docs/README.md)**.

| Topic | Doc |
|---|---|
| Requirements | [docs/product/requirements.md](./docs/product/requirements.md) |
| MVP and definition of done | [docs/product/mvp.md](./docs/product/mvp.md) |
| Out of scope | [docs/product/out-of-scope.md](./docs/product/out-of-scope.md) |
| Glossary | [docs/product/glossary.md](./docs/product/glossary.md) |
| Architecture | [docs/architecture/overview.md](./docs/architecture/overview.md) |
| Engineering rules | [docs/architecture/principles.md](./docs/architecture/principles.md) |
| Phases | [docs/development/phases.md](./docs/development/phases.md) |
| Repo layout | [docs/development/repo-structure.md](./docs/development/repo-structure.md) |
| Contributing | [CONTRIBUTING.md](./CONTRIBUTING.md) |

## Local setup

Not available yet. Compose, env files, and migrate commands land in **Phase 1 — Foundation** after documentation Batches B–E.

## License

[MIT](./LICENSE)

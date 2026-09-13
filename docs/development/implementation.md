# Implementation notes

How to write code. Phase 0 and Phase 1 Foundation are complete. Next implementation, when asked: **Phase 2 — Authentication and multi-tenancy**.

## Coding standards

- TypeScript `strict`. No `any` unless a one-line comment why.
- Nest: controllers thin; logic in services; DTOs + validation pipes.
- One module per area (`auth`, `organizations`, `projects`, `ingestion`, `events`, `alerts`, `health`). Shared utilities in `common/`.
- Do not put Prisma calls in controllers.
- `$queryRaw` only with bound parameters; never string-concatenate SQL.
- Error handling: throw typed exceptions that map to [api/conventions.md](../api/conventions.md) codes. Never empty `catch`.
- Logging: structured JSON ([observability.md](../architecture/observability.md)).
- Env: parse at boot (fail fast if `JWT_SECRET` missing in production).

## Git (human)

`main` + `feature/*`. Conventional commits. Agent never commit/push/pull/PR ([CONTRIBUTING.md](../../CONTRIBUTING.md)).

## Local setup (Phase 1+)

Prerequisites: Docker, Node 22, pnpm.

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm --filter @pulsewatch/database build
pnpm --filter api start:dev
pnpm --filter worker start:dev
pnpm --filter web dev
```

- API live: http://localhost:3001/api/v1/health/live
- API ready: http://localhost:3001/api/v1/health/ready
- Swagger (non-prod): http://localhost:3001/api/docs
- Web stub: http://localhost:3000 (rewrites `/api/v1` → `:3001`)
- Mailpit: http://localhost:8025

Root scripts: `db:generate`, `db:migrate`, `lint`, `format:check`, `typecheck`.

## Definition of done (engineering)

See [mvp.md](../product/mvp.md). Plus: isolation tests, 503 ingest documented and implemented, ADRs unchanged unless superseded.

## Related

- [phases.md](./phases.md)
- [repo-structure.md](./repo-structure.md)
- [../architecture/principles.md](../architecture/principles.md)

# Implementation notes

How to write code. Phase 0 (including Batch E) is complete. Start **Phase 1 Foundation** only when asked.

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
docker compose up -d postgres redis mailpit
pnpm --filter @pulsewatch/database prisma migrate dev
pnpm dev
```

- API: http://localhost:3001/api/v1/health/live
- Web: http://localhost:3000
- Mailpit: http://localhost:8025

Exact `package.json` script names are created in Phase 1; keep this file in sync then.

## Definition of done (engineering)

See [mvp.md](../product/mvp.md). Plus: isolation tests, 503 ingest documented and implemented, ADRs unchanged unless superseded.

## Related

- [phases.md](./phases.md)
- [repo-structure.md](./repo-structure.md)
- [../architecture/principles.md](../architecture/principles.md)

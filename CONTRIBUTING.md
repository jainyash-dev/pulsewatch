# Contributing to PulseWatch

## Before you write code

1. Read [docs/README.md](./docs/README.md).
2. Check the [current phase](./docs/development/phases.md). Do not skip ahead.
3. Follow [architecture principles](./docs/architecture/principles.md) and the locked decisions in the docs index.

Documentation Batches A–E must be complete before Phase 1 Foundation code.

## Git

The coding agent must **not** commit, push, pull, fetch, or open pull requests. Humans own git history. If you need a message, ask for text only.

- Default branch: `main`
- Work on `feature/<short-name>`, `fix/<short-name>`, or `refactor/<short-name>`
- Do **not** use a long-lived `develop` branch
- Conventional commits:

  ```text
  feat: ...
  fix: ...
  refactor: ...
  test: ...
  docs: ...
  chore: ...
  perf: ...
  ```

- Prefer small, reviewable commits. Never land the entire product in one commit.
- Do not commit secrets, `.env`, or API keys.

## Pull requests

- Describe **why**, not only what.
- Update the **owning** doc if behavior or contracts change. Do not add a parallel guide.
- Include tests when the change is behavior (authz, tenancy, ingest, alerts).

## Stack (do not substitute)

Node.js, TypeScript, NestJS, Next.js, PostgreSQL, Prisma, Redis, BullMQ, REST `/api/v1`, Jest, Docker Compose, GitHub Actions.

Do not introduce Kafka, Kubernetes, Elasticsearch, ClickHouse, or extra microservices unless a new ADR explicitly supersedes the current ones.

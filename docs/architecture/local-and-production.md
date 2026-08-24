# Local development and production (AWS)

## Local (Docker Compose)

**Phase 1** introduces Compose. Target services:

| Service | Image / build | Host ports |
|---|---|---|
| `postgres` | postgres:16 | 5432 |
| `redis` | redis:7 (`appendonly yes`) | 6379 |
| `mailpit` | axllent/mailpit | 1025 SMTP, 8025 UI |
| `api` | `apps/api` | 3001 |
| `worker` | `apps/worker` | none public |
| `web` | `apps/web` | 3000 |

Web `rewrites` `/api/v1` → `http://api:3001/api/v1` (in Docker) or `http://localhost:3001` for `pnpm dev` on the host.

Commands (filled when apps exist; see [implementation.md](../development/implementation.md)):

```text
pnpm install
cp .env.example .env
docker compose up -d postgres redis mailpit
pnpm db:migrate
pnpm dev          # turbo: api, worker, web
```

Mail: SMTP `mailpit:1025`. Open `http://localhost:8025` for alert emails.

## Environment variables (contract)

`.env.example` in Phase 1 must list (no secrets):

```text
NODE_ENV=development
DATABASE_URL=postgresql://pulsewatch:pulsewatch@localhost:5432/pulsewatch
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-me-min-32-chars-long-secret
API_KEY_PEPPER=change-me
PASSWORD_PEPPER=
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM=pulsewatch@localhost
APP_ORIGIN=http://localhost:3000
API_PORT=3001
```

Production adds: SES region/credentials or SMTP to SES, stronger secrets via Secrets Manager, `NODE_ENV=production`.

## Production shape (target)

```text
Internet
  ├─ CloudFront → S3 (exported Next.js)  OR  CloudFront → ECS web
  └─ ALB
       └─ /api/*  → ECS Fargate "api" (n tasks)

ECS Fargate "worker" (m tasks, private)
RDS PostgreSQL 16 (private subnet)
ElastiCache Redis 7 (private)
SES
ECR
CloudWatch logs + alarms (API 5xx, RDS CPU, queue depth)
Secrets Manager / SSM
```

Ingest and dashboard API are the **same** API service. Scale API on RPS; scale worker on `bullmq_ingest_waiting`.

## Cost-capped demo ([ADR 012](../decisions/012-aws-and-cost-capped-demo.md))

The live URL may be smaller (single EC2 Compose, or one API task + RDS + Redis). README must say how that differs from the diagram. Do not pretend ElastiCache exists if the demo is Redis-in-docker on one VM.

## Related

- [ci-cd-and-deployment.md](../ci-cd-and-deployment.md)
- [../reliability.md](../reliability.md)

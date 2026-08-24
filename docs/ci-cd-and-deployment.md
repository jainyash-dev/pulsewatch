# CI/CD and deployment

## GitHub Actions (from Phase 1)

**Pull request** (`main` and `feature/**`):

1. Checkout, pnpm, Node 22
2. ESLint, Prettier check, `tsc`
3. Unit tests
4. Integration tests with Compose services (Postgres + Redis) or GitHub service containers
5. Docker build `api`, `worker`, `web` — **no push**

**`main` (Phase 10):**

1. Same checks
2. Build and push ECR (`api`, `worker`, `web`)
3. `prisma migrate deploy` against RDS (job with VPC access or migrate container)
4. Rolling update ECS API then worker (migrate **before** app that requires new columns)
5. Playwright optional after deploy smoke (`GET /health/ready`)

Never deploy from a laptop as the happy path. The coding agent does not push or open PRs.

## Images

- `apps/api` and `apps/worker` may share a build context with different `CMD` (`node dist/main.js` vs worker entry). Two images is also fine.
- Non-root user, production `NODE_ENV`, no secrets in layers.
- Web: static export behind CloudFront **or** Node server; pick one in Phase 10 and document it. Prefer **static export + CloudFront** if rewrites to API are on the ALB/CloudFront behavior instead of Next.

## AWS deploy notes (Phase 10)

- Secrets: Secrets Manager → ECS task definition.
- API desired count ≥ 2 for a “real” diagram; demo may be 1 ([ADR 012](./decisions/012-aws-and-cost-capped-demo.md)).
- Worker desired count ≥ 1; scale on queue depth later.
- SES sandbox: verify identities; README how to receive demo mail.
- Alarms: API 5xx, RDS CPU, Redis evictions, `bullmq_ingest_waiting`.

IaC: ECS task defs + GitHub Actions is enough. Terraform/CDK is optional, not a Phase 1 deliverable.

## Related

- [architecture/local-and-production.md](./architecture/local-and-production.md)
- [testing.md](./testing.md)
- [operations.md](./operations.md)

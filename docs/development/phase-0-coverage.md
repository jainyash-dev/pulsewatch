# Phase 0 coverage (original brief → docs)

The retired `Project_Guide.md` mixed a good product brief with a few **wrong** defaults (per-event alerts, four ingest URLs, GitFlow `develop`, ES/Kafka temptation, tests only in Phase 9). This file records that every **useful** ask is captured, what we **upgraded**, and what we **rejected on purpose**.

## Original Phase 0 checklist

| Original ask | Where it lives now | Status |
|---|---|---|
| Project understanding | [README](../../README.md), [requirements](../product/requirements.md) | Done |
| Functional requirements | [requirements.md](../product/requirements.md) FR1–30 | Done |
| Non-functional requirements | same, NFR1–10 | Done |
| MVP scope + definition of done | [mvp.md](../product/mvp.md) | Done |
| Out of scope + future parking lot | [out-of-scope.md](../product/out-of-scope.md) | Done |
| High-level architecture + diagram | [overview.md](../architecture/overview.md) | Done |
| Component responsibilities | overview component map | Done |
| Complete data flow + sequence | [data-flow.md](../architecture/data-flow.md) | Done |
| Database schema + ERD | [schema.md](../database/schema.md) | Done |
| Indexes from access patterns | schema “Access patterns → indexes” | Done |
| API endpoints + conventions | [conventions](../api/conventions.md), [endpoints](../api/endpoints.md), [examples](../api/examples.md) | Done |
| Authentication | [tenancy-and-auth.md](../architecture/tenancy-and-auth.md) | Done |
| Multi-tenancy + RBAC | same | Done |
| Queue architecture | [processing-and-queues.md](../architecture/processing-and-queues.md) | Done |
| Alert architecture | [alerting-and-notifications.md](../architecture/alerting-and-notifications.md) | Done |
| Notification architecture | same + [security.md](../security.md) SSRF | Done |
| SDK | [sdk.md](../sdk.md) | Done |
| Dashboard | [dashboard.md](../dashboard.md) | Done |
| Repo structure | [repo-structure.md](./repo-structure.md) | Done |
| Local development | [local-and-production.md](../architecture/local-and-production.md) | Done |
| Production / AWS | same + [ADR 012](../decisions/012-aws-and-cost-capped-demo.md) | Done |
| Testing strategy | [testing.md](../testing.md) | Done |
| CI/CD | [ci-cd-and-deployment.md](../ci-cd-and-deployment.md) | Done |
| Security | [security.md](../security.md) | Done |
| Reliability / failure modes | [reliability.md](../reliability.md) | Done |
| Key tradeoffs | [principles.md](../architecture/principles.md) | Done |
| Development phases + order | [phases.md](./phases.md) | Done |
| Git workflow | [CONTRIBUTING.md](../../CONTRIBUTING.md), [ADR 011](../decisions/011-git-workflow.md) | Done |
| ADRs | [docs/decisions](../decisions/README.md) | Done |
| Agent rules | `.cursor/rules`, [AGENTS.md](../../AGENTS.md) | Done |

Portfolio README extras (screenshots after UI exists): architecture, decisions, API/SDK examples, tradeoffs — see root [README.md](../../README.md).

## Upgrades vs the original brief

These are **intentional** and more production-shaped:

| Topic | Brief said | We locked |
|---|---|---|
| Alerts | Evaluate after each ingest event | **Scheduled** eval on rollups (windowed rates) |
| Ingest API | Four typed URLs | One **batch** `POST /ingest` |
| Redis down | Unspecified | **503 + Retry-After**, SDK retries, same `eventId` |
| Event storage | Maybe four tables | `events` + `metric_samples` + `request_rollups` + watermarks |
| Errors | Flat list | **Fingerprinting + `error_groups`** |
| p95 | Implied exact | Histogram / short-window percentile |
| Live UI | SSE first | Polling; SSE optional later |
| Git | `develop` GitFlow | `main` + `feature/*` |
| Tests | Phase 9 dump | Tests **from Phase 1**; isolation mandatory |
| Processes | “Maybe microservices” | API + worker only |
| Auth | JWT, vaguely | Two planes, hashed keys, refresh rotation, reuse detection |
| Webhooks | Retry | SSRF + HMAC + timestamp skew |
| Tenancy | “Consider org_id” | URL-scoped org, 404 not 403 for other tenants |
| Dashboard health | “basic health” | Explicit healthy / degraded / down |
| Caps | None | Projects/keys/rules/members limits |
| OpenAPI | Unspecified | `@nestjs/swagger` from Phase 1 |

## Rejected on purpose (do not reintroduce)

Kafka, Kubernetes, Elasticsearch, ClickHouse, 10 microservices, per-event alerts, sync-Postgres ingest fallback, WebSockets, email-verification gate, `develop` branch, Python SDK, billing, schema-per-tenant.

## Related

- [phases.md](./phases.md)
- [../README.md](../README.md)

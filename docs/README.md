# PulseWatch documentation

This directory is the **source of truth** for the product, architecture, and delivery plan.

The original `Project_Guide.md` brief has been retired. Do not recreate a single mega-guide. When behavior changes, update the **owning** file below and link to it from elsewhere.

## Read this first

| If you are… | Start here |
|---|---|
| New to the project | [Product requirements](./product/requirements.md) → [MVP](./product/mvp.md) → [Architecture overview](./architecture/overview.md) |
| About to write code | [Current phase](./development/phases.md) → [Repo structure](./development/repo-structure.md) → [Principles](./architecture/principles.md) |
| Preparing an interview walkthrough | Overview, data-flow (Batch B), database (Batch C), failure modes (Batch C) |

## Documentation batches

Docs are written in batches **before** application code. Do not start Phase 1 Foundation until Batches A–E are complete.

| Batch | Status | Contents |
|---|---|---|
| **A — Spine** | **Done** | Product, overview, principles, phases, repo structure, root README |
| **B — Lock the system** | Not started | ADRs, data flow, tenancy/auth, ingest, processing/queues, alerting/notifications |
| **C — Contracts** | Not started | Database schema/indexes, API conventions + endpoints, security, reliability |
| **D — Satellite** | Not started | SDK, dashboard behavior, observability, local/prod, testing, CI/CD, operations |
| **E — Agent rules** | Not started | `.cursor/rules/*` pointing at these docs |

## Tight tree (target)

```text
docs/
  README.md                          ← you are here
  product/
    requirements.md
    mvp.md
    out-of-scope.md
    glossary.md
  architecture/
    overview.md
    principles.md
    data-flow.md                     # B
    tenancy-and-auth.md              # B
    ingestion.md                     # B
    processing-and-queues.md         # B
    alerting-and-notifications.md    # B
    query-dashboard-sdk.md           # B
    observability.md                 # D
    local-and-production.md          # D
  decisions/                         # B
  database/
    schema.md                        # C
  api/
    conventions.md                   # C
    endpoints.md                     # C
  security.md                        # C
  reliability.md                     # C
  testing.md                         # D
  ci-cd-and-deployment.md            # D
  sdk.md                             # D
  dashboard.md                       # D
  operations.md                      # D
  development/
    phases.md
    repo-structure.md
    implementation.md                # D (coding standards, git recap, local setup)
```

## Locked decisions (summary)

Full rationale lands in ADRs (Batch B). Until then, treat these as **approved and frozen**:

1. Two deployables: NestJS **API** + NestJS **worker** (modular monolith, not microservices).
2. Storage: PostgreSQL `events` + `metric_samples` + `request_rollups` (no Elasticsearch/ClickHouse in MVP).
3. One batch ingest endpoint: `POST /api/v1/ingest`.
4. Alerts evaluated on a **schedule** from rollups, not per ingest event.
5. Redis down on ingest → **503 + Retry-After** (fail closed).
6. Dashboard: REST polling 10–15s. No WebSockets. SSE live-tail optional after Phase 5.
7. Error grouping: `error_groups` + fingerprint in MVP.
8. Git: `main` + `feature/*` (no `develop` branch).
9. AWS as the production **design**; live demo may be cost-capped.
10. RBAC: `owner | admin | member | viewer`. Auto-create a workspace on register.
11. Metrics: avg / count / max always; p95 via histogram buckets or short-window `percentile_cont`.
12. Email: Mailpit locally, SES in AWS. No email-verification gate in MVP.

See [architecture/overview.md](./architecture/overview.md) and [architecture/principles.md](./architecture/principles.md).

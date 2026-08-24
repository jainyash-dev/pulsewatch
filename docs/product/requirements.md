# Product requirements

## Vision

PulseWatch is a multi-tenant observability and alerting platform. Application teams send logs, errors, HTTP request data, and metrics; PulseWatch ingests, processes, stores, and exposes that data through versioned REST APIs and a simple dashboard.

It should look and behave like a serious backend system: queue-based ingest, tenant isolation, hashed credentials, retries, and documented failure modes — not a CRUD app with charts.

The dashboard exists to prove the product end-to-end. **Backend architecture is the primary portfolio signal.** Do not optimize for frontend-heavy roles.

## Why this project exists

The author already has professional experience with Node.js, TypeScript, NestJS, Python, FastAPI, PostgreSQL, MongoDB, Redis, REST, async work, multi-tenant SaaS, and cloud infrastructure. PulseWatch exists to demonstrate:

- Scalable API design and API versioning
- Event-driven, queue-based processing
- Multi-tenancy and RBAC
- Authentication (JWT + project API keys)
- Rate limiting, caching, idempotency, retries
- PostgreSQL design and indexing for time-range queries
- Alerting and asynchronous notifications
- Observability of the platform itself
- Tests, Docker, CI/CD, and a production-shaped AWS design

## Target roles

**Primary:** Backend Engineer, Software Engineer, Node.js/TypeScript Backend Engineer.

**Secondary:** Platform / distributed-systems-oriented Software Engineer.

## Personas

| Persona | Goal |
|---|---|
| Integrating developer | Create a project, copy an API key, drop in the SDK, see events and errors in PulseWatch. |
| Teammate | Join a workspace, view dashboards, search events, manage alert rules (per role). |
| Operator (you, in demo) | Run Compose locally, read health/metrics, explain what happens when Redis or Postgres fails. |

## Core user flows

1. Register → auto-create workspace (owner) → create project → mint API key.
2. Send telemetry via SDK or HTTP → **202** → events appear after worker persist (seconds of lag).
3. Filter events; view dashboard KPIs and charts for 15m / 1h / 24h / 7d.
4. Create a threshold alert → breach → email and/or webhook → history visible.

## Functional requirements

### Identity and tenancy

- FR1. Users can register, log in, log out, and refresh a session.
- FR2. Registration creates an organization (workspace) with the user as `owner`.
- FR3. Users can create additional organizations and belong to more than one.
- FR4. Organizations have members with RBAC: `owner`, `admin`, `member`, `viewer`.
- FR5. Organizations contain multiple projects (applications).
- FR6. Projects can create, list, rotate, and revoke ingest API keys. Plaintext is shown **once**.
- FR7. Every tenant-scoped query enforces organization and project access on the **server**. UI filtering is not security.

### Ingestion

- FR8. Ingest authenticates with a project API key (`X-Api-Key`).
- FR9. Clients send logs, errors, requests, and metrics in a **batch** to `POST /api/v1/ingest`.
- FR10. The API validates shape and size, rate-limits, enqueues, and returns **202** with a request ID.
- FR11. Clients supply `eventId` for idempotency (SDK generates UUID if omitted).
- FR12. Ingest does not run alert evaluation, aggregation, or notification send.

### Processing

- FR13. Workers normalize and persist events idempotently.
- FR14. Errors are grouped by fingerprint (`error_groups`).
- FR15. Request volume, errors, and latency are rolled up into minute buckets for dashboards and alerts.
- FR16. Jobs retry with backoff; exhausted jobs are visible as failures (DLQ / failed set).
- FR17. Raw events and rollups are retained per documented policy (default 14 days raw, 90 days rollups).

### Query and dashboard

- FR18. Users can list/filter events by time range, type, environment, severity, service, endpoint, status, and duration.
- FR19. Dashboard shows request volume, error rate, average latency, p95 (per agreed strategy), recent errors, top failing endpoints, and basic health.
- FR20. Time ranges: last 15 minutes, 1 hour, 24 hours, 7 days.
- FR21. Dashboard charts refresh via REST polling (10–15s). Live-tail SSE is optional after Phase 5.

### Alerting and notifications

- FR22. Users can CRUD threshold alert rules per project (error count, error rate, avg duration, failed request count, endpoint error rate).
- FR23. Rules evaluate on a schedule against rollups over a time window.
- FR24. Alerts have state (`ok` / `alerting`), cooldown, and optional notify-on-resolve.
- FR25. Destinations: email and webhook. Delivery is asynchronous with retries and stored history.
- FR26. Webhook URLs are validated against SSRF rules.

### Platform

- FR27. Liveness and readiness endpoints. Readiness checks PostgreSQL and Redis.
- FR28. Structured JSON logs with request/correlation IDs.
- FR29. Internal metrics endpoint (Prometheus text), not public by default in production.
- FR30. A Node.js SDK and a sample app exist so a demo can generate traffic.

## Non-functional requirements

| ID | Area | Target |
|---|---|---|
| NFR1 | Ingest latency | p95 &lt; 100ms excluding client network, on cache-hit auth + enqueue |
| NFR2 | Ingest when Redis is down | **503** + `Retry-After`; SDK retries. Do not silently drop. |
| NFR3 | Read consistency | Events may take a few seconds to appear (202 before persist) |
| NFR4 | Query | Indexed list queries p95 &lt; 300ms at demo scale |
| NFR5 | Durability | At-least-once processing; duplicates collapsed by `(project_id, event_id)` |
| NFR6 | Isolation | Cross-tenant reads must fail (403/404); covered by tests |
| NFR7 | Retention | Raw events 14 days; rollups 90 days (configurable later) |
| NFR8 | Scale honesty | Designed for tens of events/sec per project, not Datadog volume |
| NFR9 | Secrets | Env / secret manager only; never committed |
| NFR10 | Shutdown | API and worker drain in-flight work (documented timeout) |

## Related

- In/out of MVP: [mvp.md](./mvp.md), [out-of-scope.md](./out-of-scope.md)
- Terms: [glossary.md](./glossary.md)

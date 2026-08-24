# Reliability

PulseWatch is an observability product; we document failure instead of pretending HA we will not run.

## Health

| Endpoint | Meaning |
|---|---|
| `GET /api/v1/health/live` | Process up (API or a tiny worker HTTP, or worker logs only — **API must expose live**). Worker: process stays running; optional loopback live later. |
| `GET /api/v1/health/ready` | Postgres ping + Redis ping. **503** if either fails. ALB/ECS should use this for API. Worker readiness: same checks before taking jobs (BullMQ connection). |

Do not query `events` on the ready probe.

## Graceful shutdown

**SIGTERM:**

1. API: stop accepting new connections (Nest/HTTP server close). In-flight requests: drain up to **15s**.
2. Worker: `worker.close()` — finish in-flight jobs up to **30s**, then disconnect Redis/Prisma.
3. Exit 0 if drained; 1 if timeout.

Do not start new rollup/eval jobs after SIGTERM.

## Failure modes

| Failure | User-visible | System behavior |
|---|---|---|
| Redis down | Ingest **503** `DEPENDENCY_UNAVAILABLE` + `Retry-After`. Login **503**. Dashboard reads may still work if only Redis cache/queue is down — **ready fails**, so orchestrator may take API out of pool. | No enqueue. SDK retries with same `eventId`s. |
| Postgres down | CRUD and persist fail **503**. Ingest may still **202** if Redis is up (jobs pile up). Ready **503**. | Worker retries ingest jobs (5×). |
| Worker crash / kill -9 | Events accepted but not yet persisted delay until restart. | Jobs remain in Redis (BullMQ lock expires). At-least-once → unique `(project_id, event_id)`. |
| Duplicate POST | 202 twice | One event row. |
| Poison event in batch | 202; other events persist | Worker logs, metric `ingest_event_poison`, continues. |
| Webhook down / 5xx | Alert still `alerting` | Notify retries 8×; delivery `failed`. |
| Email provider down | Same | Email retries 5×; delivery `failed`. |
| Alert notify fails | UI shows failed delivery | Do **not** revert rule state. |
| Ingest spike | **429** per key; queue latency up | Worker concurrency caps DB. Scale API tasks independently of worker. |
| Redis AOF/data loss | Events 202’d but not consumed are gone | Document RPO. Mitigate: AOF in Compose; future outbox ADR. |
| Clock skew | Odd dashboard buckets | Clamp future timestamps; watermark uses `ingested_at`. |
| Partial org delete | Must not leave orphaned keys usable | Purge keys first (revoke), then telemetry in background, then org row. |

## Idempotency and at-least-once

- Ingest HTTP: optional `Idempotency-Key` → same BullMQ `jobId`.
- Persist: `ON CONFLICT DO NOTHING`.
- Rollups: watermark so each event counted once.
- Notify: `delivery.id` as job id; status transitions `pending → sent | failed`.

## Queue backup

If `ingest` depth grows: API still 202 until Redis memory is exhausted (then 503). Operator: scale workers, then API. Surface `bullmq_ingest_waiting` on `/metrics`.

Failed jobs: BullMQ failed set; scrape count. No auto-replay UI in MVP; `scripts/` can move/retry later.

## Database

Pool size via env. Timeouts on ingest persist (worker). Migrations: `prisma migrate deploy` in release job **before** new worker/API that require new columns.

## Redis

AOF `appendonly yes` in Compose. Prod: ElastiCache with persistence as the chosen demo budget allows. Treat Redis as **cache + queue**, not the system of record after persist.

## Related

- [architecture/processing-and-queues.md](./architecture/processing-and-queues.md)
- [architecture/ingestion.md](./architecture/ingestion.md)
- [security.md](./security.md)
- [ADR 003](./decisions/003-queue-first-ingest.md)

# Processing and queues

Worker owns all BullMQ processors and repeatable jobs. API is a **producer** of `ingest` (and test notify) only.

Redis also holds: rate limits, API-key cache, short dashboard cache. Enable **AOF** in Compose.

## Why each queue exists

| Queue | Why | Producer | Consumer |
|---|---|---|---|
| `ingest` | Decouple HTTP from persist | API | Worker |
| `notify` | Slow I/O must not block eval or ingest | alert-eval, test-destination | Worker |
| Repeatable `rollup` | Correct aggregates without per-event increments | BullMQ scheduler | Worker |
| Repeatable `alert-eval` | Windowed thresholds ([ADR 005](../decisions/005-scheduled-alert-evaluation.md)) | Scheduler ~30–60s | Worker |
| Repeatable `retention-sweep` | Enforce 14d/90d policy | Daily | Worker |

**Do not** split ingest into logs vs errors vs requests queues.

## Ingest processor

1. Load job payload (batch JSON, already size-capped).
2. Normalize each event (trim, default severity, fingerprint for errors).
3. `INSERT` into `events` or `metric_samples` with `ON CONFLICT (project_id, event_id) DO NOTHING`.
4. If inserted `type=error`, upsert `error_groups`.
5. Per-event try/catch: poison event → log + metric, continue the batch.
6. Job success if the batch was processed (including no-ops). Throw for infrastructure errors (Postgres down) so BullMQ retries.

**Do not** update `request_rollups` here.

## Rollup job

- Concurrency **1** globally (or one job per project later if needed).
- Read `rollup_watermarks` (`last_ingested_at` per project).
- Select `events` with `type=request` (and define whether 5xx-only errors also increment `error_count` — **request `statusCode >= 500`** is the error_count for rates; standalone `type=error` does not have to inflate HTTP error rate unless we also count them in a separate rule).
- Bucket `date_trunc('minute', timestamp)` (client event time, clamped).
- Dimensions: `environment`, `endpoint` (`__all__` for project totals).
- `INSERT ... ON CONFLICT DO UPDATE` adding counts/sums/histogram buckets.
- Advance watermark to max `ingested_at` processed.

Idempotency: watermark means each event is aggregated **once**. Re-running from a rewind is an operator action, not the default.

## Alert-eval job

See [alerting-and-notifications.md](./alerting-and-notifications.md). Reads rollups only. Enqueues `notify` jobs. Concurrency **1**.

## Notify processor

Channel adapter: email or webhook. Writes `notification_deliveries`. Retries belong to this queue, not ingest.

## Retry and failure

| Job | Attempts | Backoff | Then |
|---|---|---|---|
| ingest | 5 | Exponential | BullMQ failed set; increment `ingest_jobs_failed` metric |
| notify (webhook) | 8 | Exponential, cap | `deliveries.status=failed` |
| notify (email) | 5 | Exponential | same |
| rollup / alert-eval | 3 | Short | Next scheduled run; log error |

Graceful shutdown: `worker.close()` wait up to **30s** for in-flight jobs.

## Concurrency (starting points)

| Queue | Concurrency per worker process |
|---|---|
| ingest | 10 |
| notify | 5 |
| rollup | 1 |
| alert-eval | 1 |

## Job identity

- Ingest: `jobId` = `Idempotency-Key` header if present, else new UUID (event unique key still applies).
- Notify: `jobId` = `deliveryId` so retries update one row.

## Related

- [data-flow.md](./data-flow.md)
- [ingestion.md](./ingestion.md)
- [ADR 002](../decisions/002-api-and-worker-split.md)

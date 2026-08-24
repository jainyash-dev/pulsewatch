# Query, dashboard, and SDK (architecture)

HTTP paths and query params are Batch C. This file locks behavior.

## Query

All reads: JWT + org membership + project belongs to org.

**Event lists** use **cursor** pagination (`timestamp` + `id`), not offset. Filters: `type`, `from`, `to`, `environment`, `severity`, `service`, `endpoint`, `statusCode`, `minDurationMs`, `q` (prefix/ILIKE on `message`, length-capped). Default sort: `timestamp DESC`.

**Error groups:** list by `last_seen_at`; detail includes recent events for that fingerprint.

**Custom metrics:** list/filter `metric_samples` for short ranges. Product dashboards are **request rollups**, not arbitrary metric names.

Prisma for CRUD; `$queryRaw` for rollups, histograms, and short-window `percentile_cont`.

## Dashboard

Ranges: `15m`, `1h`, `24h`, `7d` (and optional `environment`).

KPIs from `request_rollups` (and histogram for p95 — [ADR 010](../decisions/010-p95-strategy.md)):

- Total requests, error count, error rate
- Avg duration, max, estimated p95
- Recent errors (from `events` or groups)
- Top failing endpoints (rollup rows where `endpoint <> '__all__'`)
- Health: derived (e.g. healthy / degraded / down from error rate + traffic in the range)

Charts: request volume, error rate, latency over time. UI **polls 10–15s** ([ADR 009](../decisions/009-dashboard-polling.md)). Optional Redis cache with the same TTL.

No WebSockets. SSE live-tail is optional **after** Phase 5 lists work.

Authz is 100% API. Role only affects which **mutations** exist.

## SDK (Node, Phase 8)

```ts
const pw = new PulseWatch({
  apiKey: process.env.PULSEWATCH_API_KEY!,
  baseUrl,
  service,
  environment,
  flushIntervalMs: 1000,
  maxBatchSize: 50,
});

pw.log({ severity: 'info', message: 'boot' });
pw.error({ message, stack });
pw.request({ method, endpoint, statusCode, durationMs });
pw.metric({ name: 'queue.depth', value: 12, type: 'gauge' });
await pw.flush();
```

Behavior:

- Generate `eventId` if missing
- Buffer; flush on interval, size, or shutdown
- POST `/api/v1/ingest` only
- Retry 429/503/network with backoff and **same eventIds**
- Drop-oldest if the in-memory buffer exceeds a cap; `onError` callback; **do not** throw into the host request by default
- No OpenTelemetry wrapper in MVP

Full public API write-up: Batch D `docs/sdk.md`.

## Related

- [ingestion.md](./ingestion.md)
- [tenancy-and-auth.md](./tenancy-and-auth.md)
- [ADR 009](../decisions/009-dashboard-polling.md), [010](../decisions/010-p95-strategy.md)

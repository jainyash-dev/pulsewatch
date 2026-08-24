# Ingestion

Single write API for customer telemetry. [ADR 006](../decisions/006-single-batch-ingest-api.md), [ADR 003](../decisions/003-queue-first-ingest.md).

## Endpoint

```http
POST /api/v1/ingest
X-Api-Key: pw_live_...
Content-Type: application/json
Idempotency-Key: <optional, batch-level>
```

No JWT. No other ingest URLs in MVP (typed paths would only wrap this handler).

## Body

```json
{
  "events": [
    {
      "type": "log",
      "eventId": "uuid",
      "timestamp": "2026-08-24T17:00:00.000Z",
      "environment": "production",
      "service": "checkout-api",
      "severity": "info",
      "message": "charged",
      "requestId": "client-request-id",
      "traceId": "optional",
      "payload": {}
    }
  ]
}
```

`type` is `log` | `error` | `request` | `metric`.

| Type | Distinct fields (others ignored or null) |
|---|---|
| `log` | `severity`, `message`, `payload` |
| `error` | `severity` (default `error`), `message`, `payload.stack`, optional `fingerprint`, optional request fields |
| `request` | `endpoint`, `httpMethod`, `statusCode`, `durationMs` |
| `metric` | `payload.name` or `name`, `value`, `metricType` `gauge` \| `counter` |

If `eventId` is missing, the API generates a UUID. The SDK should always send one so retries are idempotent. If `timestamp` is missing, use server now. Reject timestamps too far in the future (clamp or 400 — **clamp** and log).

## Limits

| Limit | Value |
|---|---|
| HTTP body | 1 MB |
| Events per batch | 50 |
| Message | 8 KiB |
| Stack / payload | 32 KiB |
| Endpoint string | truncate to a safe length (e.g. 256) |

Over limit → **413** `PAYLOAD_TOO_LARGE` or **400** `VALIDATION_ERROR`. Do not enqueue a partial batch when the HTTP payload itself is invalid. After enqueue, the worker may skip a single poison event and persist the rest.

## Hot path (API)

1. Attach `requestId` (incoming `X-Request-Id` or generate).
2. Redis rate limit **per API key** (and a coarse per-IP limit). Exceeded → **429**.
3. Authenticate key (cache, else DB). Fail → **401**.
4. Validate DTO.
5. `queue.add('ingest', { projectId, events, requestId })`.
6. **202** `{ "data": { "accepted": n, "requestId", "eventIds": [] } }`.

**Not on this path:** Prisma inserts, rollups, alert eval, email, webhook.

## Redis down

**503** with `Retry-After` (e.g. 5 seconds). Readiness for the API fails if Redis or Postgres is down; ingest still documents 503 specifically for queue/rate-limit dependency.

## Rate limiting

Redis sliding window, keyed by API key id. Starting budget: **1000 events/minute/key** (count events, not HTTP calls). Tune via env. Login/register use a separate IP limiter (Phase 2).

## Idempotency

- Event: unique `(project_id, event_id)` in Postgres.
- Batch: optional `Idempotency-Key` can be the BullMQ jobId so a retried HTTP POST does not enqueue twice (TTL ~24h). If omitted, each POST is a new job; event-level unique still collapses duplicates.

## Related

- [data-flow.md](./data-flow.md)
- [tenancy-and-auth.md](./tenancy-and-auth.md)
- [processing-and-queues.md](./processing-and-queues.md)

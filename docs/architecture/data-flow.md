# Data flow

Canonical paths. Table/HTTP field contracts are Batch C. Queue names are in [processing-and-queues.md](./processing-and-queues.md).

## 1. Ingest (write)

```mermaid
sequenceDiagram
  participant App
  participant SDK
  participant API
  participant Redis
  participant Worker
  participant PG

  App->>SDK: log / error / request / metric
  SDK->>SDK: buffer, assign eventId
  SDK->>API: POST /api/v1/ingest X-Api-Key
  API->>API: requestId, body limits
  API->>Redis: rate limit + API key cache
  alt cache miss
    API->>PG: key_prefix lookup, verify hash
    API->>Redis: cache projectId, key status
  end
  alt Redis unavailable
    API-->>SDK: 503 Retry-After
  else Redis up
    API->>Redis: BullMQ ingest job (batch)
    API-->>SDK: 202 accepted, requestId, eventIds
  end
  Redis->>Worker: ingest job
  Worker->>PG: INSERT events ON CONFLICT DO NOTHING
  Worker->>PG: upsert error_groups if type error
  Note over Worker,PG: rollup and alerts are other jobs
```

**Guarantees:** HTTP success means “accepted for processing,” not “visible in the dashboard.” Duplicates with the same `(projectId, eventId)` become a single row.

## 2. Rollup

```text
ingest persist  →  events.ingested_at
repeatable rollup job (60s)
  → read rollup_watermarks
  → SELECT new events (requests, and errors that feed rates as defined)
  → UPSERT request_rollups (1-minute buckets)
  → advance watermark
```

Ingest jobs **do not** increment rollups. Retries must not double-count.

## 3. Query (read)

```text
Browser  →  Next.js (rewrite /api/v1)  →  API
  → JWT / refresh cookie
  → membership(orgId, userId)
  → project belongs to org
  → events list (cursor) OR request_rollups (summary / series)
  → optional Redis cache TTL 10–15s on summary
```

## 4. Alert and notify

```mermaid
flowchart TD
  E[Persisted events] --> R[Rollup job]
  R --> T[request_rollups]
  T --> V[alert-eval every 30 to 60s]
  V --> C{Value vs threshold over window}
  C -->|OK stays OK| X[No-op]
  C -->|breach and state ok| F[Execution fired, state alerting]
  C -->|breach and alerting and cooldown| S[No notify]
  C -->|recovered and alerting| Z[Execution resolved, state ok]
  F --> Q[notify queue]
  Z --> Q
  Q --> M{Channel}
  M --> Email[Mailpit or SES]
  M --> WH[HTTPS webhook]
  Email --> D[notification_deliveries]
  WH --> D
```

Detail: [alerting-and-notifications.md](./alerting-and-notifications.md).

## 5. Control plane

JWT CRUD for organizations, members, projects, keys, alert rules, and destinations. **No queue** except `POST .../destinations/:id/test` (enqueue one notify job). Key revoke deletes the Redis API-key cache entry immediately.

## Related

- [ingestion.md](./ingestion.md)
- [processing-and-queues.md](./processing-and-queues.md)
- [tenancy-and-auth.md](./tenancy-and-auth.md)
- ADR [003](../decisions/003-queue-first-ingest.md), [005](../decisions/005-scheduled-alert-evaluation.md)

# Node.js SDK

Package: `@pulsewatch/sdk` in `apps/sdk-node` (Phase 8). Architecture summary: [architecture/query-dashboard-sdk.md](./architecture/query-dashboard-sdk.md). Ingest contract: [architecture/ingestion.md](./architecture/ingestion.md).

## Install (when published or via workspace)

```bash
pnpm add @pulsewatch/sdk
```

Until npm publish, the sample app depends on the workspace package.

## Public API

```ts
import { PulseWatch } from '@pulsewatch/sdk';

const pw = new PulseWatch({
  apiKey: process.env.PULSEWATCH_API_KEY!,
  baseUrl: process.env.PULSEWATCH_BASE_URL ?? 'http://localhost:3001',
  service: 'checkout-api',
  environment: process.env.NODE_ENV ?? 'development',
  flushIntervalMs: 1000,
  maxBatchSize: 50,
  maxQueueSize: 1000,
  timeoutMs: 5000,
  onError: (err) => console.error(err),
});

pw.log({ severity: 'info', message: 'boot' });
pw.error({ message: String(err), stack: err.stack, fingerprint?: string });
pw.request({
  method: 'GET',
  endpoint: '/api/users',
  statusCode: 200,
  durationMs: 42,
});
pw.metric({ name: 'queue.depth', value: 12, type: 'gauge' });

await pw.flush();
pw.close(); // flush + stop timer
```

Default `baseUrl` should include origin only; SDK POSTs `{baseUrl}/api/v1/ingest`.

## Config

| Option | Default | Notes |
|---|---|---|
| `apiKey` | required | `X-Api-Key` |
| `baseUrl` | required in prod | No trailing slash |
| `service` | optional | Applied to every event |
| `environment` | optional | Applied to every event |
| `flushIntervalMs` | 1000 | |
| `maxBatchSize` | 50 | Matches API |
| `maxQueueSize` | 1000 | Drop-oldest when exceeded |
| `timeoutMs` | 5000 | Per HTTP attempt |
| `onError` | no-op | Never throw into the host by default |

## Behavior

1. Assign `eventId` (UUID) if missing.
2. Buffer in memory; flush on interval, `maxBatchSize`, `flush()`, or `close()`.
3. One HTTP call per flush: `{ events: [...] }` with mixed types allowed.
4. Retry **429**, **503**, and network errors with exponential backoff (e.g. 3 attempts). Reuse the same `eventId`s. Send `Idempotency-Key` per flush attempt (new key per flush, stable across retries of that flush).
5. If the buffer hits `maxQueueSize`, drop oldest and call `onError` with a dropped-count.
6. Methods return `void` (fire-and-forget). Do not block the caller’s request path.
7. No OpenTelemetry, no auto-instrumentation of HTTP servers in MVP. The sample app calls `pw.request` from middleware explicitly.

## What the SDK must not do

- Persist to disk
- Spawn extra processes
- Call query/dashboard APIs
- Send alerts
- Bundle Nest or Prisma

## Sample app

`examples/node-api`: small HTTP server that emits logs, random 5xx, and latency so a demo can trip an alert. Document `PULSEWATCH_API_KEY` in its README (Phase 8).

## Related

- [api/endpoints.md](./api/endpoints.md) — `POST /ingest`
- [testing.md](./testing.md)

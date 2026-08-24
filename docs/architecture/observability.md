# Observability of PulseWatch

PulseWatch stores customer telemetry **and** must be observable itself. This is not OpenTelemetry-as-a-product ([out-of-scope](../product/out-of-scope.md)).

## Structured logs

JSON to stdout (API and worker).

Minimum fields: `timestamp`, `level`, `message`, `service` (`api` \| `worker`), `requestId` (HTTP), `jobId` / `queue` (worker), `projectId` when known (never API keys).

Use `pino` or Nest-compatible JSON logger. No `console.log` in product code.

## Correlation

- HTTP: honor `X-Request-Id` or generate UUID; echo on the response; put on ingest jobs.
- Worker: log `requestId` from the job payload when persisting.

Customer `traceId` on events is **their** field, not our request id.

## Metrics (`GET /api/v1/metrics`)

Prometheus text. Restrict by network in AWS.

Suggested series (names can be prefixed `pulsewatch_`):

| Metric | Why |
|---|---|
| `http_request_duration_seconds` | API latency histogram (path low-cardinality: route template, not raw URL) |
| `http_requests_total` | status + method + route |
| `ingest_events_accepted_total` | 202 path |
| `ingest_events_rejected_total` | 4xx reason |
| `bullmq_ingest_waiting` / `active` / `failed` | Queue health |
| `ingest_job_duration_seconds` | Worker persist latency |
| `ingest_event_poison_total` | Bad event in batch |
| `rollup_job_duration_seconds` | |
| `alert_eval_duration_seconds` | |
| `notification_deliveries_total` | channel + status |
| `db_up` / `redis_up` | 1/0 gauges for probes |

Cardinality: **do not** label metrics with `project_id` or `event_id`.

## Health

See [reliability.md](../reliability.md). Live vs ready. Worker does not need a public port in Compose; log “worker ready” and rely on container health (Redis/Postgres ping in process) or a later internal port.

## What we do not build

- Jaeger/Zipkin UI
- Shipping our logs to a third-party APM in MVP (CloudWatch in Phase 10 is enough)
- Using PulseWatch to monitor PulseWatch in a loop (fun, skip)

## Related

- [../api/endpoints.md](../api/endpoints.md) — `/health/*`, `/metrics`
- [../reliability.md](../reliability.md)

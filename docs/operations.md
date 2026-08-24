# Operations runbook

Short operator notes. Failure *design* is [reliability.md](./reliability.md).

## Ingest returning 503

1. Check `GET /api/v1/health/ready` — Redis or Postgres?
2. If Redis: do not expect 202 until Redis is back. SDKs retry.
3. If Redis up but queue huge: scale **workers**, then check Postgres CPU.

## Events accepted but not in UI

1. Worker logs / container running?
2. BullMQ `ingest` waiting vs failed.
3. Wait for 202 lag (seconds). Refresh dashboard (15s poll).
4. Confirm `eventId` uniqueness (retries are no-ops).

## Alerts not firing

1. Rule `enabled`, filters match `environment` / `endpoint`.
2. Rollup job running (`rollup_watermarks` advancing).
3. Window has `request_count` (rates are 0 if no traffic).
4. Cooldown / already `alerting`.

## Notifications

- Local: Mailpit UI `:8025`.
- Webhook `failed`: read `notification_deliveries.last_error`. SSRF block vs timeout vs 4xx.
- Test endpoint: `POST .../alert-destinations/:id/test`.

## Retention

Daily sweep. If disk grows: check job, `retention_days`, 90-day rollups.

## Keys

Revoke compromised keys immediately (cache invalidation). Rotate = create + revoke old.

## Deploy

Migrate first. If migrate fails, do not roll out API/worker that need new columns.

## Related

- [architecture/processing-and-queues.md](./architecture/processing-and-queues.md)
- [ci-cd-and-deployment.md](./ci-cd-and-deployment.md)

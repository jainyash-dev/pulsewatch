# Alerting and notifications

Alerts never run on the ingest HTTP path or inside the ingest persist job. [ADR 005](../decisions/005-scheduled-alert-evaluation.md).

## Rules

Stored per project. MVP `kind` values:

| Kind | Value from | Compare |
|---|---|---|
| `error_count` | Sum of rollup `error_count` (HTTP **5xx**) in the window | `>` |
| `error_rate` | `error_count / request_count` as a **ratio** (0.05 = 5%) | `>` |
| `avg_duration_ms` | `duration_sum / duration_count` | `>` |
| `endpoint_error_rate` | Same as `error_rate` but `filters.endpoint` is **required** | `>` |

`failed_request_count` from the original brief is **not a separate kind** — it is `error_count` (5xx). Do not add a parallel 4xx kind in MVP.

**Threshold units:** rates use **0–1 ratios**, never “5” for 5%. Counts and durations are raw numbers. Window is `window_minutes`. Default `cooldown_seconds` = 900 (15 min).

MVP alert filters: **`environment` and `endpoint` only** (rollup dimensions). No `service` filter on alerts in MVP.

No p95 alert kind until histogram rollups exist ([ADR 010](../decisions/010-p95-strategy.md)).

## State machine

```text
ok --(value exceeds threshold)--> alerting   # fire execution + notify
alerting --(value still high, within cooldown)--> alerting  # no notify
alerting --(value still high, cooldown elapsed)--> alerting  # optional re-notify: MVP = do not re-notify until resolve
alerting --(value back below threshold)--> ok  # resolved execution; notify if notify_on_resolve
```

Hysteresis: use the same threshold for resolve in MVP (no separate clear threshold).

`last_evaluated_at`, `last_notified_at`, `last_transition_at` live on the rule.

## Evaluation job

Every 30–60s, **one global job** (concurrency 1):

1. Load enabled rules (join project).
2. Sum rollup buckets in `[now - window, now]` with filters.
3. Compare to threshold.
4. In a **DB transaction**: if state must change, `UPDATE alert_rules SET state=... WHERE id AND state=<expected>` so a retried eval cannot double-insert executions. Then insert `alert_executions`.
5. Enqueue notify jobs for each linked destination (skip if cooldown suppress).

Missing data (no requests in window): treat counts as 0; **do not** divide by zero for rates (rate = 0 if `request_count = 0`).

## Destinations

| Type | Config | Notes |
|---|---|---|
| `email` | address | Worker → Mailpit or SES. Not sent in the API process. |
| `webhook` | url, signing secret | POST JSON, HMAC header, **5s** timeout, SSRF policy |

Mask webhook URLs on list APIs. `alert_rule_destinations` is many-to-many.

Payload (conceptual):

```json
{
  "event": "alert.fired",
  "rule": { "id", "name", "kind" },
  "project": { "id", "name" },
  "value": 0.08,
  "threshold": 0.05,
  "windowMinutes": 5,
  "firedAt": "..."
}
```

`alert.resolved` uses the same shape.

## Delivery

`notification_deliveries`: status `pending` | `sent` | `failed`, attempts, last status code, last error. Exhausted retries **do not** roll back alert state.

SSRF: [../security.md](../security.md) (HTTPS in non-local env, block private/link-local/metadata IPs, DNS resolve then re-check, no redirects).

## Spam control

Cooldown, state machine, no per-event emails, no re-notify while continuously alerting (MVP).

## Related

- [data-flow.md](./data-flow.md)
- [processing-and-queues.md](./processing-and-queues.md)

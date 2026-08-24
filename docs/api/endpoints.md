# API endpoints

All paths prefixed with `/api/v1`. Auth column: **JWT** = Bearer access token + org membership where `:orgId` is present; **key** = `X-Api-Key`; **public** = none.

Roles: R = any member; W = owner/admin/member; A = owner/admin; O = owner. Viewer is R only. See [tenancy-and-auth.md](../architecture/tenancy-and-auth.md).

Request/response field names are camelCase in JSON.

---

## Auth (public unless noted)

### `POST /auth/register`

Body: `{ email, password, name }`.  
**201** `{ data: { user, organization, accessToken } }` + set refresh cookie. Creates org + owner membership.

### `POST /auth/login`

Body: `{ email, password }`. **200** `{ data: { user, accessToken } }` + refresh cookie. No org in token; client calls `GET /organizations`.

### `POST /auth/refresh`

Cookie required. Rotates refresh token. **200** `{ data: { accessToken } }`.

### `POST /auth/logout`

JWT or refresh cookie. Revokes that refresh token. **204**. Clear cookie.

### `GET /auth/me`

JWT. **200** `{ data: { id, email, name } }`.

---

## Organizations (JWT)

### `GET /organizations`

List orgs the user belongs to (role included). Offset pagination.

### `POST /organizations`

W not applicable (any authenticated user). Body: `{ name }`. **201** org; caller is `owner`.

### `GET /organizations/:orgId`

R. **404** if not a member.

### `PATCH /organizations/:orgId`

A. Body: `{ name? }`. Slug immutable in MVP.

### `DELETE /organizations/:orgId`

O. **204**. Application purge then delete (not a giant cascade in one uncontrolled query).

### `GET /organizations/:orgId/members`

R.

### `POST /organizations/:orgId/members`

A. Body: `{ email, role }` where `role` is `admin` \| `member` \| `viewer` (not `owner`). User must already exist. **201** or **409**.

### `PATCH /organizations/:orgId/members/:userId`

A. Body: `{ role }`. Cannot demote last owner; cannot assign `owner` except via a future transfer endpoint (`POST .../transfer-ownership` — **out of MVP**; owner remains the registrant plus we do not support transfer).

### `DELETE /organizations/:orgId/members/:userId`

A (or self-leave as member/viewer). Cannot remove last owner. **204**.

---

## Projects (JWT)

### `GET /organizations/:orgId/projects`

R.

### `POST /organizations/:orgId/projects`

W. Body: `{ name, slug? }`. **201**.

### `GET /organizations/:orgId/projects/:projectId`

R. **404** if project not in org or user not member.

### `PATCH /organizations/:orgId/projects/:projectId`

W. Body: `{ name?, retentionDays? }`.

---

## API keys (JWT)

### `POST /organizations/:orgId/projects/:projectId/api-keys`

W. Body: `{ name }`. **201** `{ data: { id, name, prefix, lastFour, token, createdAt } }` — `token` **only here**.

### `GET /organizations/:orgId/projects/:projectId/api-keys`

W. No `token`. Includes `revokedAt`, `lastUsedAt`. Viewers: **403** (keys are secrets metadata).

### `POST /organizations/:orgId/projects/:projectId/api-keys/:keyId/revoke`

W. **204**. Invalidate Redis cache.

Rotation = create new key, then revoke old (two calls). No dedicated rotate URL in MVP.

---

## Ingest (API key)

### `POST /ingest`

See [ingestion.md](../architecture/ingestion.md).

**202**

```json
{
  "data": {
    "accepted": 3,
    "requestId": "uuid",
    "eventIds": ["...", "...", "..."]
  }
}
```

`accepted` is the number of events in the validated batch (not yet persisted). **401** invalid/revoked key. **413** `PAYLOAD_TOO_LARGE`. **429** `RATE_LIMITED`. **503** `DEPENDENCY_UNAVAILABLE` + `Retry-After` when Redis is down.

---

## Events and metrics (JWT, R)

Prefix: `/organizations/:orgId/projects/:projectId`

### `GET .../events`

Query: `type`, `from`, `to`, `environment`, `severity`, `service`, `endpoint`, `statusCode`, `minDurationMs`, `q`, `cursor`.  
`q` max 200 chars; `ILIKE` prefix/contains on `message` only.

**200** cursor page of event summaries (include `id`, `eventId`, `type`, `timestamp`, `severity`, `message`, `endpoint`, `statusCode`, `durationMs`, `environment`, `service`). Full `payload` on detail.

### `GET .../events/:eventId`

R. Path `eventId` is the **server** `events.id` UUID (not client `event_id`). **404** cross-tenant.

### `GET .../error-groups`

Query: `status`, `from`, `to`, `cursor` or offset — **offset OK** (small cardinality). Sort `lastSeenAt DESC`.

### `GET .../error-groups/:groupId`

Includes group + last N events (e.g. 20) for that fingerprint.

### `GET .../metrics`

Query: `name`, `from`, `to`, `environment`, `cursor`. Short ranges only (reject `to - from` > 48h with 400).

---

## Dashboard (JWT, R)

Prefix: `/organizations/:orgId/projects/:projectId/dashboard`

### `GET .../summary`

Query: `range=15m|1h|24h|7d` (required), `environment?`.

**200** `{ data: { requestCount, errorCount, errorRate, avgDurationMs, maxDurationMs, p95DurationMs, health } }`  
`health`: `healthy` \| `degraded` \| `down` (define: no traffic → `healthy`; error rate ≥ 5% → `degraded`; ≥ 20% or no success with traffic → `down` — document in code constants).

`p95DurationMs` may be `null` if histogram empty.

### `GET .../timeseries`

Query: `range`, `environment?`, `metric=requests|errors|error_rate|avg_duration|p95_duration`.  
**200** `{ data: { points: [ { t, v } ] } }` with bucket size chosen by range (1m for 15m/1h, 5–15m for 24h, 1h for 7d).

### `GET .../top-endpoints`

Query: `range`, `environment?`, `sort=error_count|error_rate`, `limit` default 10 max 25.  
Excludes `endpoint=__all__`.

---

## Alerts (JWT)

Prefix: `/organizations/:orgId/projects/:projectId`

### `GET/POST .../alert-rules`

GET: R. POST: W. Body: `{ name, kind, threshold, windowMinutes, filters, cooldownSeconds, notifyOnResolve, destinationIds, enabled }`.  
`endpoint_error_rate` requires `filters.endpoint`.

### `GET/PATCH/DELETE .../alert-rules/:ruleId`

GET: R. PATCH/DELETE: W. DELETE **204**.

### `GET/POST .../alert-destinations`

GET: W (mask webhook URL, e.g. host + last path segment). Viewer **403** on destinations list. POST: W.  
Webhook create runs SSRF check; fail → **400**.

### `GET/PATCH/DELETE .../alert-destinations/:destinationId`

W. PATCH may rotate webhook secret.

### `POST .../alert-destinations/:destinationId/test`

W. Enqueues notify job. **202** `{ data: { deliveryId } }`.

### `GET .../alert-rules/:ruleId/executions`

R. Cursor by `firedAt`.

### `GET .../notification-deliveries`

R. Query: `ruleId?`, `status?`, `cursor`.

---

## Platform

### `GET /health/live`

No auth. **200** `{ data: { status: "ok" } }`. Process is up.

### `GET /health/ready`

No auth. Checks Postgres + Redis. **200** or **503** `{ data: { postgres, redis } }`.

### `GET /metrics`

Prometheus text. No auth in local; **restrict by network** in AWS (do not publish on the internet). Not JSON envelope.

---

## Related

- [conventions.md](./conventions.md)
- [../database/schema.md](../database/schema.md)
- [../architecture/ingestion.md](../architecture/ingestion.md)

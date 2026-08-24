# API conventions

Base path: `/api/v1`. Internal modules stay free of HTTP types except controllers/DTOs.

## Auth

| Plane | How |
|---|---|
| Human | `Authorization: Bearer <access_jwt>` |
| Human refresh | httpOnly cookie `pw_refresh` on `POST /auth/refresh` and logout (same-origin) |
| Ingest | `X-Api-Key` only |

Optional `X-Request-Id`; if absent, API generates one and **always** echoes `X-Request-Id` on the response.

## Success envelope

```json
{ "data": { } }
```

Lists with a cursor:

```json
{
  "data": [ ],
  "meta": { "nextCursor": "opaque-or-null", "hasMore": true }
}
```

Small collections (orgs, projects, rules) may use offset:

```json
{
  "data": [ ],
  "meta": { "page": 1, "pageSize": 20, "total": 3 }
}
```

`page` is 1-based. Default `pageSize` 20, max 100.

## Error envelope

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable, safe",
    "details": [ { "field": "email", "issue": "invalid" } ],
    "requestId": "uuid"
  }
}
```

Never include stack traces or SQL. `details` is optional.

### Error codes

| Code | HTTP | When |
|---|---|---|
| `VALIDATION_ERROR` | 400 | DTO / query params |
| `UNAUTHORIZED` | 401 | Missing/invalid JWT |
| `INVALID_API_KEY` | 401 | Missing/unknown ingest key |
| `REVOKED_API_KEY` | 401 | Revoked key |
| `FORBIDDEN` | 403 | Authenticated but role insufficient |
| `NOT_FOUND` | 404 | Unknown **or** other tenant’s resource |
| `CONFLICT` | 409 | Duplicate slug/email/membership |
| `PAYLOAD_TOO_LARGE` | 413 | Body or field over limit |
| `RATE_LIMITED` | 429 | Include `Retry-After` |
| `DEPENDENCY_UNAVAILABLE` | 503 | Redis/Postgres down as specified |
| `INTERNAL_ERROR` | 500 | Unexpected |

## HTTP status

| Status | Use |
|---|---|
| 200 | GET, PATCH, action that returns a body |
| 201 | POST create |
| 202 | Ingest accepted |
| 204 | Logout, revoke, delete with no body |
| 400–429 | As table above |
| 503 | Dependency; ingest Redis down |

## Pagination and filters

- **Events, executions, deliveries:** cursor. `cursor` query param = previous `meta.nextCursor`. Cursor encodes `timestamp` + `id` (opaque to clients).
- **Everything else small:** `page`, `pageSize`.
- Time: `from`, `to` ISO-8601 UTC. Dashboard also accepts `range=15m\|1h\|24h\|7d` which the API expands to `from`/`to`.
- Sort: event lists fixed `timestamp DESC, id DESC`. Do not take arbitrary `ORDER BY` from the client.

## Idempotency

- Ingest: `Idempotency-Key` optional (BullMQ job id, 24h). Event `eventId` required for safe retries (API may generate).
- Creates (org, project): not idempotent unless we add keys later. Duplicate slug → 409.

## Validation

class-validator / Zod on DTOs. Extra JSON properties: **forbid** (`whitelist`). Strings trimmed. Enums exact.

## Versioning

Only `/api/v1` in MVP. Breaking changes require `/api/v2` later, not silent field reuse.

## Related

- [endpoints.md](./endpoints.md)
- [../security.md](../security.md)

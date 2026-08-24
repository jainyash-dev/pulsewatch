# Dashboard behavior

Thin Next.js App Router client. **No** Next.js Route Handlers that reimplement the API. Rewrite `/api/v1` → Nest API ([ADR 009](./decisions/009-dashboard-polling.md)).

Authz is 100% API. Hide buttons by role; never as security.

## Screens

| Route (conceptual) | Purpose | APIs |
|---|---|---|
| `/login`, `/register` | Auth | `POST /auth/login`, `/register` |
| `/` or `/orgs` | Org switcher | `GET /organizations` |
| `/orgs/[orgId]` | Project list | `GET .../projects` |
| `/orgs/[orgId]/projects/[projectId]` | Overview KPIs + 3 charts | `dashboard/summary`, `timeseries` |
| `.../events` | Filterable event list + detail | `GET .../events` |
| `.../errors` | Error groups + detail | `error-groups` |
| `.../alerts` | Rules, executions, deliveries | alert endpoints |
| `.../settings` | Members (if A), keys (if W), destinations (if W) | matching endpoints |

Keep visual design clean and professional. Do not spend the project on animation or a design system.

## Overview widgets

- Request count, error rate, avg duration, p95, health
- Charts: requests over time, error rate over time, latency over time
- Recent errors (5–10)
- Top failing endpoints

Range selector: 15m / 1h / 24h / 7d. Optional environment filter.

## Polling

- Overview + charts: **10–15s** while the tab is visible (`document.visibilityState`). Pause when hidden.
- Event list: refresh on filter change; optional 15s poll.
- No WebSockets. No SSE until Phase 5 lists work and we explicitly add a tail.

## Filters (events)

Time range, environment, severity, service, endpoint, type, `minDurationMs`, search `q`. Cursor “Load more”, not page numbers.

## Empty and error states

- No events yet: copy pointing at SDK + ingest.
- 202 lag: do not claim live; “Updated every 15s” is enough.
- API 403/404: generic not found, no other-tenant leakage.
- API 503: “PulseWatch is unavailable”.

## Access token

Keep access JWT in memory (React context). Refresh via cookie on 401 once, then redirect to login. Do not use `localStorage` for tokens.

## Related

- [api/endpoints.md](./api/endpoints.md)
- [architecture/query-dashboard-sdk.md](./architecture/query-dashboard-sdk.md)

# Glossary

| Term | Meaning in PulseWatch |
|---|---|
| **Organization** | Tenant / billing-style container. API and database use this word. |
| **Workspace** | UI copy for an organization. Same entity. |
| **Project** | A registered application under an organization. Telemetry is isolated per project. |
| **User** | Human account. Authenticates with email/password and JWT. |
| **Member** | A user attached to an organization with a **role**. |
| **Role** | `owner`, `admin`, `member`, or `viewer`. |
| **API key** | Project ingest credential. Stored hashed. Header `X-Api-Key`. Never used for dashboard reads. |
| **JWT** | Access token for human API calls. Payload is `sub` (user id) only; org comes from the URL. |
| **Refresh token** | Opaque, hashed in DB, rotated. Used to mint new access tokens. |
| **Event** | A discrete log, error, or HTTP request row in `events`. |
| **Metric sample** | A custom gauge/counter point in `metric_samples` (not mixed into `events`). |
| **Rollup** | Pre-aggregated 1-minute request stats in `request_rollups` (dashboard + alerts). |
| **Watermark** | Per-project cursor of how far rollup processing has read. |
| **Fingerprint** | Stable hash used to group similar errors. |
| **Error group** | Aggregated error identity (`error_groups`) with count and last seen. |
| **Ingest** | Write path: authenticate, validate, enqueue, 202. |
| **Worker** | Process that consumes queues and runs repeatable jobs. |
| **Alert rule** | Threshold definition (kind, window, threshold, filters, cooldown). |
| **Alert state** | `ok` or `alerting` on the rule. |
| **Alert execution** | History row when a rule fires or resolves. |
| **Destination** | Email or webhook config for a project. |
| **Delivery** | One notification attempt/result (`notification_deliveries`). |
| **Request ID** | ID for an HTTP call into PulseWatch (our API). |
| **Correlation / trace ID** | ID from the customer app, stored on events. |
| **202 lag** | Time between accepted ingest and visibility in query APIs. |
| **Modular monolith** | One codebase, clear modules, **two** deployable processes (API and worker). |

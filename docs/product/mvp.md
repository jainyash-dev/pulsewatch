# MVP scope and definition of done

The MVP is a **polished, production-style slice**, not a clone of Datadog. Everything in this file is in scope unless [out-of-scope.md](./out-of-scope.md) says otherwise.

## In scope

- Accounts, JWT + refresh tokens, org-on-signup
- Organizations, membership, RBAC (`owner`, `admin`, `member`, `viewer`)
- Projects and hashed ingest API keys (create, list, revoke/rotate, last-used)
- Batch ingest `POST /api/v1/ingest` (logs, errors, requests, metrics)
- Rate limiting, payload limits, request IDs, 202 enqueue
- Worker persist, idempotency, error groups, minute request rollups, retention job
- Event query/filter/cursor pagination
- Dashboard KPIs and time series (polling)
- Threshold alerts on rollups + cooldown + execution history
- Email (Mailpit local, SES in AWS design) and webhooks (retry, timeout, delivery log)
- Node.js SDK + sample traffic app
- Docker Compose local stack
- Automated tests including tenant isolation
- Documented AWS production architecture and a cost-capped demo option
- Engineering docs and ADRs (this `docs/` tree)

## Definition of done (product)

A developer can:

1. Register
2. Log in
3. Use the auto-created organization (and create another if needed)
4. Create a project
5. Generate a project API key
6. Install/use the Node SDK
7. Send logs, errors, requests, and metrics
8. See events in PulseWatch after processing
9. Filter/search events
10. View dashboard statistics
11. Create an alert rule
12. Trigger the alert
13. Receive email and/or webhook notification
14. View alert and delivery history
15. Run the stack locally with Docker Compose
16. Run automated tests
17. Follow deployment documentation (AWS-shaped)
18. Read the docs and explain the architecture in an interview

## Extra done-checks (engineering)

- Tenant isolation tests pass
- Redis-down ingest returns 503 as specified
- ADRs exist for storage, API+worker split, queue-first ingest, scheduled alerts
- Sample app can drive a visible alert

## Explicitly deferred (not “failed MVP”)

- SSE live-tail of logs (optional after Phase 5)
- True p95 alerts if histogram work slips (avg/count/max alerts still required)
- Email verification, SSO, 2FA
- Publishing the SDK to npm (in-monorepo package is enough)

## Related

- Requirements: [requirements.md](./requirements.md)
- Phases: [../development/phases.md](../development/phases.md)

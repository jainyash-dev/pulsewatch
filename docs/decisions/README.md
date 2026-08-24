# Architecture Decision Records

Each ADR is short: problem, options, decision, why, tradeoffs.

These lock Batch A decisions. Changing one requires a new ADR that supersedes it — not a silent edit.

| ADR | Title |
|---|---|
| [000](./000-template.md) | Template |
| [001](./001-postgres-for-events.md) | PostgreSQL for event storage |
| [002](./002-api-and-worker-split.md) | API and worker as two processes |
| [003](./003-queue-first-ingest.md) | Queue-first ingest and fail-closed Redis |
| [004](./004-unified-events-and-rollups.md) | Unified events, metric samples, rollups |
| [005](./005-scheduled-alert-evaluation.md) | Scheduled alert evaluation |
| [006](./006-single-batch-ingest-api.md) | Single batch ingest endpoint |
| [007](./007-error-grouping.md) | Error grouping by fingerprint |
| [008](./008-rbac-and-org-on-signup.md) | RBAC and org on signup |
| [009](./009-dashboard-polling.md) | Dashboard polling |
| [010](./010-p95-strategy.md) | p95 strategy |
| [011](./011-git-workflow.md) | Git workflow |
| [012](./012-aws-and-cost-capped-demo.md) | AWS design and cost-capped demo |

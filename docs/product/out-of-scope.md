# Out of scope

Do not implement these in the MVP. They may appear later as explicit follow-ups with a new ADR if they change architecture.

## Do not build now

- Kubernetes
- Kafka (or other heavy brokers)
- Elasticsearch / OpenSearch
- ClickHouse
- A mesh of microservices (more than API + worker)
- Full distributed tracing product / OpenTelemetry collector
- Mobile apps
- Python SDK (Node SDK only)
- Slack, Teams, PagerDuty, or other extra notifiers
- Enterprise billing or usage-based billing
- Advanced team management (SSO, SCIM, audit-product UI beyond a simple audit table)
- AI / RAG / anomaly detection as a feature
- Public status pages
- Custom query language
- Schema-per-tenant Postgres

## Future extensions (parking lot)

Keep module boundaries so these *could* be added without a rewrite:

- OpenTelemetry ingest
- Distributed tracing
- Additional SDKs
- More notification channels
- Advanced aggregation and SLO/SLI
- Log retention UI / per-project retention
- Billing
- Richer org/team admin
- Public status pages
- Advanced search (or ES) if Postgres is proven insufficient

Document a future idea in an issue or a later ADR. Do not sneak it into the current phase.

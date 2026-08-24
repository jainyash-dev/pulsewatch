# ADR 001 — PostgreSQL for event storage

- **Status:** Accepted
- **Date:** 2026-08-24

## Problem

Where do we store logs, errors, requests, and metrics so we can filter by project, time, and dimensions without standing up a search cluster?

## Options considered

1. Elasticsearch / OpenSearch for events, Postgres for tenancy
2. ClickHouse for telemetry, Postgres for tenancy
3. PostgreSQL for both tenancy and telemetry, with indexes and rollup tables

## Decision

Use **PostgreSQL** as the only datastore for MVP telemetry. No Elasticsearch or ClickHouse.

## Why

The project is meant to show judgment, not tool count. At tens of events per second per project, indexed Postgres plus minute rollups can serve list queries and dashboards. One database keeps Compose, RDS, backups, and tests simple.

## Tradeoffs

Full-text search and high-cardinality analytics will hit limits. We accept ILIKE/prefix search with a length cap, 14-day raw retention, and pre-aggregated rollups. If that fails in production, a later ADR can add a dedicated store.

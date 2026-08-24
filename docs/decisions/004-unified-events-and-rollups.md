# ADR 004 — Unified events, metric samples, and rollups

- **Status:** Accepted
- **Date:** 2026-08-24

## Problem

Logs, errors, requests, and metrics share some filters but not the same access patterns. A single giant table and four cloned tables are both wrong.

## Options considered

1. Four tables: `logs`, `errors`, `requests`, `metrics` with duplicated indexes and query APIs
2. One `events` table for every type including custom metrics
3. `events` for log/error/request, `metric_samples` for custom metrics, `request_rollups` for dashboard/alerts

## Decision

**Option 3.** Type discriminator on `events` (`log` | `error` | `request`). JSONB `payload` for type-specific fields. Custom metrics are a timeseries, not discrete “events” in the product sense.

## Why

List/search code stays one path. Dashboards and windowed alerts need cheap aggregates — those come from rollups, not scans of raw requests. Metrics cardinality and queries differ enough to isolate.

## Tradeoffs

Nullable request columns on log rows. We do not GIN-index `payload` in MVP. Column-level contracts live in Batch C (`docs/database/schema.md`).

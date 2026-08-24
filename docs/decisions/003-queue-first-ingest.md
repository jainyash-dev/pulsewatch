# ADR 003 — Queue-first ingest and fail-closed Redis

- **Status:** Accepted
- **Date:** 2026-08-24

## Problem

Ingest must acknowledge quickly and avoid heavy work on the HTTP path. Redis may be down. Losing telemetry silently is unacceptable for an observability product.

## Options considered

1. Queue-first: validate, enqueue, **202**; persist in the worker. If Redis is down, **503 + Retry-After**
2. Always persist to Postgres in the request, then enqueue (outbox)
3. If Redis is down, write events synchronously to Postgres (degraded mode)

## Decision

**Queue-first 202** with Redis AOF in Compose. If Redis is unavailable, ingest **fails closed** (503). The SDK retries with the same `eventId`s. No sync-Postgres fallback in MVP.

## Why

Matches the latency goal and keeps the hot path small (auth cache + validate + enqueue). Fail-closed is honest and less code than a second write path. Idempotency makes client retries safe.

## Tradeoffs

Accepted events sit in Redis until the worker writes Postgres (RPO if Redis loses data despite AOF). 202 does not mean “queryable yet.” A transactional outbox can be a later ADR if we need stronger durability.

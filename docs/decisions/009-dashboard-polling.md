# ADR 009 — Dashboard polling instead of WebSockets

- **Status:** Accepted
- **Date:** 2026-08-24

## Problem

The brief asked for SSE “initially” and live error rate. Charts are aggregations; true push needs Redis pub/sub after persist.

## Options considered

1. WebSockets for all dashboard data
2. SSE from day one for charts and lists
3. **REST polling every 10–15s** for MVP; optional SSE live-tail after Phase 5

## Decision

**Polling for KPIs, series, and lists.** No WebSockets. SSE is not required for MVP.

## Why

Ingest is already eventually consistent. 10–15s matches that lag. Polling is cacheable, easy to test, and keeps the API the source of truth.

## Tradeoffs

Not “tick-by-tick” live. If we add SSE, it is a **tail of recent events**, not a replacement for rollup charts.

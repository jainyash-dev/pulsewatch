# ADR 010 — p95 latency strategy

- **Status:** Accepted
- **Date:** 2026-08-24

## Problem

The dashboard asks for p95 response time. Exact `percentile_cont` over 7 days of raw `events` will not stay honest as volume grows.

## Options considered

1. Always compute p95 on raw events for every range
2. Skip p95 in MVP (avg/max only)
3. Always expose **count, error count, avg, max** from rollups; **p95** from histogram buckets on rollups, or `percentile_cont` **only** for 15m/1h

## Decision

**Option 3.** Rollups store `duration_sum`, `duration_count`, `duration_max`, and a small **histogram** JSON (`le_50` … `inf`). p95 is estimated from the histogram for 24h/7d. Short windows may use raw percentile if row counts stay bounded.

p95 **alerts** wait until histogram data exists; avg/error-rate alerts do not.

## Why

Interview-credible: we know why naive percentiles fail. MVP still shows a p95 line.

## Tradeoffs

Histogram p95 is approximate. We will not claim exact global p95.

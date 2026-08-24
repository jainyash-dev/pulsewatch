# ADR 005 — Scheduled alert evaluation

- **Status:** Accepted
- **Date:** 2026-08-24

## Problem

Rules look like “error rate > 5% for 5 minutes.” Evaluating on every ingested event cannot compute that window and will spam notifications.

## Options considered

1. Evaluate alerts inside the ingest worker after each persist
2. Repeatable worker job (30–60s) that reads `request_rollups` (and watermarks) and applies threshold + cooldown
3. A standalone rules engine / streaming product

## Decision

**Scheduled evaluation** on rollups. Ingest never fires alerts or sends mail.

## Why

Windowed rates match the product. Cooldown and `ok` / `alerting` state live in one place. Ingest stays fast and idempotent.

## Tradeoffs

Alert delay is about one eval interval plus rollup lag (typically under two minutes), not millisecond. That is correct for this MVP. p95 alerts depend on ADR 010 histograms landing.

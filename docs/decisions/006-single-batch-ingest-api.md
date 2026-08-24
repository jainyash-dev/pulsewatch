# ADR 006 — Single batch ingest endpoint

- **Status:** Accepted
- **Date:** 2026-08-24

## Problem

The original brief listed four typed ingest URLs plus `/events`. The SDK needs batching and one rate-limit counter.

## Options considered

1. `POST /ingest/logs|errors|metrics|events` with no batch
2. Four typed endpoints, each accepting arrays
3. One `POST /api/v1/ingest` with `{ "events": [ { "type": ... } ] }`

## Decision

**One batch endpoint.** SDK methods (`log`, `error`, `request`, `metric`) are client sugar.

## Why

One auth, one size limit, one queue job per HTTP call, one 429 budget per API key. Workers branch on `type`.

## Tradeoffs

Optional typed aliases can be added later as wrappers. They must not become a second semantic. Payload schema is specified in [ingestion.md](../architecture/ingestion.md); HTTP details in Batch C.

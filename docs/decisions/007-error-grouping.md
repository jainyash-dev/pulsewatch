# ADR 007 — Error grouping by fingerprint

- **Status:** Accepted
- **Date:** 2026-08-24

## Problem

A flat list of every exception is noisy. Sentry-style grouping is high interview value and little extra schema.

## Options considered

1. Store errors only as `events` rows; UI lists them raw
2. `error_groups` keyed by `(project_id, fingerprint)` with count and last seen
3. Full issue workflow (assign, comments, releases)

## Decision

**Fingerprint + `error_groups` in MVP.** Worker upserts the group when persisting `type=error`. Grouping algorithm can be simple (normalized message + type + top stack frame). Clients may send `fingerprint`.

## Why

Small table, clear product story, cheap “top errors” without scanning all events.

## Tradeoffs

Fingerprints will mis-group sometimes. We do not build a full issue tracker. Status is `open` | `resolved` only.

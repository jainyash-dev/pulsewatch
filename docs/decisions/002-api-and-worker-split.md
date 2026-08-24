# ADR 002 — API and worker as two processes

- **Status:** Accepted
- **Date:** 2026-08-24

## Problem

Ingest HTTP should stay fast while persist, rollups, alerts, and notifications are slow and retryable. How many deployable units?

## Options considered

1. One Node process: NestJS HTTP plus BullMQ processors in-process
2. Modular monolith, **two** containers: `apps/api` and `apps/worker`
3. Many microservices (ingest, query, alerts, notify, …)

## Decision

**Two processes**, one codebase: API handles HTTP; worker handles queues and cron. Shared Prisma and `packages/shared`.

## Why

This is a real async boundary (scale and shutdown independently) without a service mesh. Ten services would dominate ops and hide the product.

## Tradeoffs

Two images, two health checks, two ECS services. Locally Compose runs both. We reject in-process workers so rollups cannot starve ingest on the same event loop in production.

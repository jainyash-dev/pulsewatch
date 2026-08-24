# ADR 012 — AWS production design and cost-capped demo

- **Status:** Accepted
- **Date:** 2026-08-24

## Problem

The portfolio should show a real AWS shape (ALB, ECS API+worker, RDS, ElastiCache, SES, CloudFront). Running that 24/7 is easy to overspend.

## Options considered

1. Full dual-service AWS stack from the first deploy, regardless of cost
2. Document AWS as the production architecture; allow a **smaller live demo** (single VM or one API task + RDS + Redis) with the README explaining the split
3. Skip AWS and use only a PaaS with no architecture story

## Decision

**Option 2.** Diagrams, env, and Phase 10 docs describe the full shape. The public demo URL may be cost-capped. Mail in AWS is **SES**; local is Mailpit.

## Why

Judgment includes cost. Interviewers can still walk the production diagram.

## Tradeoffs

The live URL may not be identical to the diagram. The README must say so explicitly. No email-verification gate in MVP (Mailpit/SES still used for alert mail).

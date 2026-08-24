# ADR 008 — RBAC and organization on signup

- **Status:** Accepted
- **Date:** 2026-08-24

## Problem

Multi-tenancy needs membership and roles. An empty account with no org is a poor first run and an authz edge-case factory.

## Options considered

1. Two roles only (`owner`, `member`); user creates org after signup
2. Four roles (`owner`, `admin`, `member`, `viewer`); **create a workspace on register**, user is `owner`
3. Invite-only orgs, no personal workspace

## Decision

**Option 2.** Users can create more organizations later. JWT does not embed org or role (stale-token risk). Every request loads membership for `:orgId` in the path.

## Why

Demo path is one command sequence. Four roles are enough to show real RBAC tests without an IAM product.

## Tradeoffs

Invite-email as a polished product is out of scope; adding a member by existing email is enough for MVP. Viewer cannot mint keys or change alerts.

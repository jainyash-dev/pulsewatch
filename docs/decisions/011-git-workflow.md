# ADR 011 — Git workflow

- **Status:** Accepted
- **Date:** 2026-08-24

## Problem

The original brief specified GitFlow (`main` + `develop`). This is a solo portfolio repo.

## Options considered

1. GitFlow with long-lived `develop`
2. `main` + short-lived `feature/*`, `fix/*`, `refactor/*`

## Decision

**Option 2.** Conventional commits. The **human** owns commit, push, pull, and PRs. The coding agent does not run those operations (see `.cursor/rules/no-git-remote.mdc`).

## Why

`develop` adds merge ceremony without a release train. `main` should stay the default branch name going forward (rename from `master` if the local repo still uses it).

## Tradeoffs

No integration branch. Keep `main` green with CI once Phase 1 exists.

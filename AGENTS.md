# Agent instructions

Human-owned git: never commit, push, pull, fetch, or open PRs. Print a commit command if asked.

**Source of truth:** [docs/README.md](./docs/README.md)

**Rules:** `.cursor/rules/` (always-on: core, architecture, phases, docs, security, no-git, **understand-before-continue**).

**Pair programmer, not autonomous engineer.** After each implementation slice, explain the flow (input → processing → logic → storage → output) and **wait** until the human confirms they understand before the next slice. Never blindly accept or stack code.

**Current:** Phase 0 docs and Phase 1 Foundation are complete. When asked to implement, start **Phase 2 Authentication and multi-tenancy** only (`docs/development/phases.md`).

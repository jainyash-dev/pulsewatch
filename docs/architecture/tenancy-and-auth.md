# Tenancy and authentication

## Tenant model

```text
User ──< organization_members (role) >── Organization ──< Project
                                                          ├── project_api_keys
                                                          ├── events / metric_samples / rollups
                                                          └── alert_rules / destinations
```

- **Organization** is the tenant. UI may say “workspace.”
- **Project** is the telemetry isolation boundary. Every event row has `project_id`.
- A user may belong to many organizations. Org context is **`/organizations/:orgId/...`**, never guessed from JWT.

Registration **creates** an organization and membership with role `owner` ([ADR 008](../decisions/008-rbac-and-org-on-signup.md)).

## RBAC

| Action | owner | admin | member | viewer |
|---|---|---|---|---|
| Read projects, events, dashboard, alert history | yes | yes | yes | yes |
| Create/update projects, alert rules, destinations | yes | yes | yes | no |
| Mint / revoke API keys | yes | yes | yes | no |
| Add/remove members, change roles (not last owner) | yes | yes* | no | no |
| Delete organization / transfer ownership | yes | no | no | no |

\*Admin cannot remove or demote the last owner, and cannot assign `owner`.

Enforcement is in API services/repositories (`WHERE project.organization_id = :orgId` **and** a membership row). The UI only hides buttons.

## Plane A — humans (dashboard and management APIs)

| Piece | Rule |
|---|---|
| Password | Argon2id preferred (bcrypt acceptable if native deps hurt). Never store plaintext. |
| Access JWT | ~15 minutes. Payload `{ sub: userId }` only. |
| Refresh | Opaque token, **hashed** in `refresh_tokens`, rotated on use, revoked on logout. |
| Transport | Next.js rewrites `/api/v1` → API so the browser is **same-origin**. httpOnly `refresh` cookie; access token in memory. Not localStorage. |
| Authorization | Load member role for `orgId` on every request. 404 if the org/project is not visible (do not leak existence to other tenants). |

Email verification is **not** required in MVP.

## Plane B — machines (ingest only)

| Piece | Rule |
|---|---|
| Header | `X-Api-Key: pw_live_<secret>` (or `pw_test_` in local/dev) |
| Storage | `key_prefix`, `key_hash` (SHA-256 or HMAC with server pepper), `last_four`. Never persist plaintext. |
| Create | Return full key **once**. List endpoints return prefix + last four + metadata. |
| Lookup | Prefix → candidate rows → hash compare. Redis cache `{ hash → { projectId, keyId, revoked } }` TTL ~60s. |
| Revoke | Set `revoked_at`, delete cache key. |
| last_used_at | At most once per minute, not on every ingest request. |
| Scope | Key can **only ingest** to its project. No query APIs accept API keys. |

## Isolation rules (non-negotiable)

1. No query without `project_id` (and org membership) on tenant data.
2. Guessable UUIDs of another tenant’s project return **404**.
3. Ingest with a revoked or unknown key returns **401**.
4. Isolation is covered by tests in Phase 2 onward.

## Related

- [ingestion.md](./ingestion.md)
- [data-flow.md](./data-flow.md)
- Routes: [../api/endpoints.md](../api/endpoints.md)

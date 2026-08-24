# Repository structure

Target layout after Phase 1. Do **not** create empty packages “for later.”

```text
pulsewatch/
├── apps/
│   ├── api/                 # NestJS HTTP
│   ├── worker/              # NestJS + BullMQ
│   ├── web/                 # Next.js App Router
│   └── sdk-node/            # Node SDK (Phase 8; folder may wait until then)
├── packages/
│   ├── database/            # Prisma schema, client, migrations, seed
│   ├── shared/              # Event types, error codes, constants
│   └── eslint-config/
├── examples/
│   └── node-api/            # Sample traffic app (Phase 8)
├── docs/                    # This documentation tree
├── .github/
│   └── workflows/
├── .cursor/
│   └── rules/               # Batch E
├── scripts/
├── docker-compose.yml
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
├── tsconfig.base.json
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

## Justified packages

| Package | Why |
|---|---|
| `packages/database` | One Prisma schema owned by a library both API and worker import |
| `packages/shared` | Types and constants shared by API, worker, and SDK |
| `packages/eslint-config` | One lint baseline |

**Do not add** `packages/types` or `packages/config`. Fold env parsing into each app plus `shared` if needed.

Prisma lives at `packages/database/prisma`, not a second root `prisma/` folder.

## Apps

| App | Phase it appears | Notes |
|---|---|---|
| `api` | 1 | Health first; product modules in later phases |
| `worker` | 1 | Boot + Redis/Postgres connectivity; processors in Phase 4 |
| `web` | 1 | Stub page + rewrite `/api/v1` → API |
| `sdk-node` | 8 | Not in Foundation |

## What we are not creating

- One Nest app per domain (logs, errors, metrics as separate *services*)
- A BFF in Next.js API routes that reimplements the backend
- Kafka, Helm, or Terraform folders before Phase 10

Nest **modules** inside `apps/api` (auth, organizations, projects, ingestion, events, alerts, health) are fine. That is modular monolith structure, not microservices.

## Related

- [overview.md](../architecture/overview.md)
- [phases.md](./phases.md)

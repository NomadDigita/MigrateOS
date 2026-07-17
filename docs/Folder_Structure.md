# Folder Structure

The source tree is intentionally introduced with runnable foundation work in Milestone 2. This document is the approved layout; creating empty source folders now would add noise without executable ownership.

```text
MigrateOS/
├── frontend/                         # Next.js application
│   ├── app/                          # Route segments and layouts
│   ├── components/                   # Reusable visual components
│   ├── features/                     # Feature-local UI, hooks, schemas
│   ├── lib/                          # API client, utilities, configuration
│   ├── styles/                       # Tokens and global styles
│   └── tests/                        # UI/unit/E2E test support
├── backend/
│   ├── app/
│   │   ├── api/                      # FastAPI routers, dependencies, schemas
│   │   ├── application/              # Use cases and port definitions
│   │   ├── domain/                   # Entities, policies, events, errors
│   │   ├── infrastructure/           # DB, Redis, GitHub, OpenAI, Git adapters
│   │   ├── agents/                   # Typed agent implementations
│   │   ├── prompts/                  # Versioned system/task prompts
│   │   ├── workers/                  # Celery tasks and task routing
│   │   ├── services/                 # Cross-cutting orchestration helpers
│   │   └── main.py                   # Composition root only
│   ├── alembic/                      # Schema migrations
│   └── tests/                        # Unit, integration, fixtures
├── infra/
│   ├── docker/                       # API/worker/web container definitions
│   ├── compose/                      # Local and CI compose overlays
│   ├── github/                       # Actions and reusable workflow support
│   └── observability/                # Telemetry/dashboard configuration
├── docs/
│   └── decisions/                    # Architecture decision records
├── fixtures/                         # Versioned safe legacy-repository samples
├── scripts/                          # Developer and CI automation
└── .github/workflows/                # CI workflows
```

## Ownership rules

- API handlers perform transport concerns only and call an application use case.
- `domain/` cannot import from `infrastructure/`, `api/`, or `workers/`.
- `agents/` use application ports and typed artifacts; provider SDK use stays in infrastructure adapters.
- Frontend feature code may import shared components/lib, but feature modules do not import each other’s internals.
- Migrations are append-only after release and reflect only database schema changes.
- Repository fixtures contain no secrets, licensed production source, or executable network-dependent setup.

## Root-file policy

Root files remain limited to project-wide configuration, contributor-facing documents, and compose entrypoints. Feature implementation belongs within its owning layer, preventing a gradual accumulation of unowned scripts and modules.

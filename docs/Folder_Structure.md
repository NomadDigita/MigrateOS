# Folder Structure

Milestone 2 implements the first runnable portion of this layout. Additional modules are introduced only when they have executable ownership.

```text
MigrateOS/
├── apps/
│   └── frontend/                     # Next.js 15 application
│   ├── app/                          # Route segments and layouts
│   ├── components/                   # Reusable visual components
│   ├── features/                     # Feature-local UI, hooks, schemas
│   ├── lib/                          # API client, utilities, configuration
│   ├── styles/                       # Tokens and global styles
│   └── tests/                        # UI/unit/E2E test support
├── backend/                          # FastAPI control plane
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
│   ├── tests/                        # API/unit tests
│   └── alembic/                      # Forward-only PostgreSQL migrations
├── workers/                          # Celery app and typed task entrypoints
├── docker/                           # Production container definitions
├── packages/                         # Future independently versioned packages only
├── shared/                           # Language-neutral generated/integration assets
├── infra/
│   ├── docker/                       # Future infrastructure support assets
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

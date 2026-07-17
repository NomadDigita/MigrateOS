# MigrateOS

**AI-powered software modernization platform.**

MigrateOS helps engineering teams understand, plan, execute, validate, and report safe upgrades of legacy repositories. It treats an LLM as one bounded capability inside a controlled modernization system—not as an unstructured coding chatbot.

## Status

Milestone 2 establishes the runnable platform foundation: a Next.js command-center UI, FastAPI control plane, Celery worker boundary, PostgreSQL schema migration, Redis integration, Docker Compose topology, and CI quality gates. Repository intelligence and migration mutation remain deliberately deferred to their dedicated milestones.

## What MigrateOS will do

- Analyze a connected Git repository and inventory its technologies, dependencies, and conventions.
- Detect outdated frameworks, deprecated APIs, likely breaking changes, and configuration risks.
- Produce an approval-ready migration plan with scope, ordering, risk, and rollback information.
- Coordinate specialized agents to make contained changes in an isolated repository workspace.
- Generate or update tests, run an allow-listed validation pipeline, and publish a transparent migration report and pull request.

## Product principles

1. **Plan before mutation.** No repository is changed before a persisted plan is approved.
2. **Evidence over assertion.** Findings must link to files, symbols, commands, or authoritative migration references.
3. **Least privilege by design.** Repository execution happens in a sandbox with an allow-listed command policy; credentials never enter prompts or logs.
4. **Human authority is explicit.** High-risk changes, branch writes, and pull-request creation require user approval.
5. **Every run is explainable.** Agent inputs, outputs, status transitions, and validation evidence are retained in a redacted audit trail.

## Documentation

| Document | Purpose |
| --- | --- |
| [Product requirements](docs/PRD.md) | Users, goals, constraints, and acceptance criteria |
| [System architecture](docs/Architecture.md) | Boundaries, execution flow, and architecture decisions |
| [Technical design](docs/Technical_Design.md) | Runtime contracts, orchestration, security, and operational choices |
| [Folder structure](docs/Folder_Structure.md) | Intended repository layout and dependency rules |
| [Milestone plan](docs/Milestone_Plan.md) | Sequenced, testable delivery milestones |
| [AI agents](docs/AI_Agents.md) | Agent responsibilities, contracts, guardrails, and handoffs |
| [API contracts](docs/API.md) | Versioned HTTP and streaming interface design |
| [Database design](docs/Database.md) | Core schema, relationships, retention, and migrations |
| [Frontend design](docs/Frontend_Design.md) | Information architecture, interaction design, and component system |
| [Development roadmap](docs/Roadmap.md) | Near-term delivery and open-source path |
| [Deployment](docs/Deployment.md) | Local, production, and operational topology |
| [Contributing](docs/Contributing.md) | Quality bar and contribution workflow |

## Local development

### Docker Compose (recommended)

```sh
cp .env.example .env
docker compose up --build
```

The frontend is available at `http://localhost:3000`; API liveness is at `http://localhost:8000/api/v1/health`. Compose applies the initial database migration before the API starts.

### Native development

```sh
python -m pip install -e ".[dev]"
npm --prefix apps/frontend install
python -m uvicorn backend.app.main:app --reload
python -m celery --app workers.celery_app:celery_app worker --loglevel=INFO
```

Run the full quality suite with `make verify`. Run `cp .env.example .env` first and point database/Redis URLs at local services when using native processes.

## Quality gates

`main` is protected by Python Ruff/Black/Pytest/compile checks and frontend Prettier/ESLint/Vitest/Next build checks. The GitHub Actions workflow also validates the Compose topology.

## Repository note

The upstream repository was initialized without a commit. This first commit establishes the project baseline on `main`.

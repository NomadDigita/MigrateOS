# MigrateOS

**AI-powered software modernization platform.**

MigrateOS helps engineering teams understand, plan, execute, validate, and report safe upgrades of legacy repositories. It treats an LLM as one bounded capability inside a controlled modernization system—not as an unstructured coding chatbot.

## Status

Milestone 1 is complete: the product contract, architecture, agent contracts, data/API designs, UX specification, and delivery plan are documented. Runtime application code deliberately begins in Milestone 2 so the first implementation has stable boundaries.

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

## Planned local development

Milestone 2 will introduce a Docker Compose development environment with a Next.js web application, FastAPI service, PostgreSQL, Redis, and a Celery worker. The exact commands will be added only alongside their runnable implementation.

## Repository note

The upstream repository was initialized without a commit. This first commit establishes the project baseline on `main`.

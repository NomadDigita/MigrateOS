# Milestone Plan

Each milestone has a narrow exit criterion, automated verification, and a deliberate commit. A milestone is not complete merely because files exist.

| Milestone | Scope | Exit criteria | Status |
| --- | --- | --- | --- |
| 1. Product & engineering foundation | Product contract, architecture, design specs, delivery plan, ADR | Documents agree on states, security boundaries, API/data ownership, and build order; baseline committed | Complete |
| 2. Runnable platform foundation | Compose, Next.js shell, FastAPI composition root, config, DB/Redis, Alembic, CI quality gates | Local stack boots; health checks, migration command, lint/type/test commands pass | Planned |
| 3. Repository intelligence | GitHub/repository intake, snapshotting, Tree-sitter inventory, dependency/framework findings, analysis UI | Deterministic fixture analysis produces evidence-backed inventory and risk signal | Planned |
| 4. Planning & approval | Migration playbooks, risk policy, plan versioning, approval flow, planner UI | Approved plan is immutable, explainable, and required before any mutation | Planned |
| 5. Governed execution | Sandboxed workspace, typed agents, patch application, live agent activity | Fixture receives contained patches only after approval; audit/event stream is replayable | Planned |
| 6. Validation & reporting | Test generation, allow-listed validation adapters, report rendering, report UI | Success/failure evidence appears in a downloadable, reviewable report | Planned |
| 7. GitHub delivery & hardening | Draft PR creation, auth/policies, observability, E2E/security/performance tests | End-to-end primary demo is reliable, secure, and under two minutes | Planned |
| 8. Open-source release readiness | Deployment docs, contribution process, examples, release automation, accessibility polish | New contributor can run fixture demo and understand governance | Planned |

## Milestone 1 completion record

**Completed:** PRD, clean architecture, technical design, folder map, agent contracts, API/database contracts, frontend design, delivery/roadmap, deployment and contribution documentation, and an initial ADR.

**Deliberate exclusions:** application source, dependency manifests, environment files, and runtime containers. Adding them before contract review would produce scaffolding that can drift from the agreed design.

**Verification:** cross-document state names, resource ownership, approval rules, and security boundaries have been aligned in the baseline documents. The next milestone will add executable checks alongside actual code.

## Change-control rule

Before a milestone changes a documented boundary—such as moving to microservices, allowing a new execution tool, weakening approval gates, or changing data ownership—it must update the relevant design document and add an ADR explaining the decision and migration path.

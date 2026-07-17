# Development Roadmap

## Delivery sequence

### Now — Foundation (completed)

The product boundary, workflow, clean architecture, security posture, contracts, UX system, and build sequence are documented. This prevents a visually impressive but structurally fragile demo.

### Next — Runnable vertical slice

Build the platform skeleton as a thin, production-minded slice: local Compose environment; frontend command-center shell; FastAPI health/config/API skeleton; SQLAlchemy/Alembic base; Redis/Celery wiring; structured logging; CI checks. The slice must start, migrate, test, and stop predictably before feature work begins.

### Then — Truthful repository intelligence

Add a deterministic legacy fixture and make MigrateOS discover it end-to-end. The goal is not broad language support; it is accurate, evidence-linked analysis for a small supported set with a transparent risk model.

### Then — Plan before action

Implement a playbook registry and plan lifecycle with a hard approval gate. Make risk, file scope, preconditions, validation criteria, and manual work reviewable before any patch exists.

### Then — Governed modernization

Introduce sandboxed workspaces, typed agents, a scoped patch pipeline, generated/updated tests, and fixed validation adapters. Preserve enough telemetry for a judge to see the orchestration advantage.

### Then — Delivery confidence

Complete report rendering, draft PR integration, E2E fixtures, security regression coverage, observability, documentation, and demo rehearsal. Optimize for a reliable two-minute narrative rather than unproven breadth.

## Release gates

| Gate | Evidence required |
| --- | --- |
| Architecture gate | ADRs/documentation agree with the executable dependency graph. |
| Security gate | Threat-model tests pass for unauthorized access, secrets, path escapes, command policy, and prompt injection. |
| Reliability gate | Job state transitions are idempotent; events replay after reconnect; failed tasks recover safely. |
| Quality gate | Formatting, static analysis, unit/integration/contract suites, and targeted E2E suite pass in CI. |
| Demo gate | A clean environment can run the primary fixture flow within two minutes with deterministic fallback data only where explicitly labeled. |

## Open-source path

After the hackathon, evolve MigrateOS through documented playbook plugins, additional repository hosts, richer policy controls, self-hosted deployment charts, accessible localization-ready UX, and a public fixture/evaluation corpus. Community contributions must preserve the typed-artifact and approval-first model; a capability that circumvents those constraints is not a compatible extension.

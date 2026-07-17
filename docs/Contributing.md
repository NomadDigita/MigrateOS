# Contributing to MigrateOS

## Contribution principles

Contributions must make modernization safer, more explainable, or more maintainable. We favor small, tested changes with clear boundaries over broad rewrites. Do not introduce a direct shell escape, secret handling path, untyped agent handoff, or state transition that bypasses approval.

## Before starting

1. Read the [architecture](Architecture.md), [technical design](Technical_Design.md), and relevant ADRs.
2. Choose the milestone and bounded issue/feature scope that the change supports.
3. Discuss material changes to security, persistence, job state, public API, or agent behavior before implementation.
4. Add an ADR when changing an established architectural decision.

## Development quality bar

- Keep domain/application/infrastructure dependencies aligned with the documented rules.
- Validate untrusted input at boundaries and return typed, safe errors.
- Add or update unit tests for policy/domain behavior; add integration or E2E coverage when crossing a process, database, queue, or browser boundary.
- Keep APIs additive where possible and regenerate/check OpenAPI artifacts when contracts change.
- Add migrations for schema changes; do not modify released migration history.
- Use structured logging with correlation IDs; redact secrets and sensitive repository content.
- Keep prompts, playbooks, and agent artifact schemas versioned and covered by fixture-based tests.
- Update documentation whenever behavior, configuration, or contributor workflow changes.

## Pull request checklist

- [ ] Scope is tied to a milestone/issue and the user-facing impact is described.
- [ ] Architecture boundaries and authorization/policy effects were considered.
- [ ] Tests and static checks pass locally and in CI.
- [ ] No credentials, customer repository content, or generated build artifacts are committed.
- [ ] Database/API/agent changes include compatibility notes and updated docs.
- [ ] UI changes include loading, empty, error, keyboard, and reduced-motion states.
- [ ] A reviewer can understand why the change exists from the PR description and tests.

## Commit guidance

Use focused, imperative commit messages such as `feat(api): add approved-plan execution guard` or `docs: define sandbox validation policy`. One completed milestone is committed as a coherent baseline; follow-up changes should be independently reviewable.

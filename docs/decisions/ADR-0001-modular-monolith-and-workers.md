# ADR-0001: Use a modular monolith control plane with separate workers

- **Status:** Accepted
- **Date:** 2026-07-17

## Context

MigrateOS needs a web/API control plane, durable orchestration, repository processing, sandboxed validation, and model integrations. The product must be credible at hackathon speed while remaining maintainable as an open-source project. Splitting each agent or subsystem into a microservice would multiply deployment, observability, authentication, and distributed-transaction complexity before the product boundary is proven.

## Decision

Build a FastAPI modular monolith for HTTP, authorization, domain policy, and application use cases. Run long-lived/retryable work in Celery workers through typed application use cases. Keep the domain/application boundaries strict so the worker, provider, GitHub, queue, and data adapters can be extracted if real scaling evidence requires it.

## Consequences

This gives the team a single deployable control plane, transactional job state, and simpler development while allowing independent worker scaling. It requires discipline: modules cannot reach across layers, workers cannot own state-machine policy, and slow work must not execute in API request handlers. A future service extraction requires an ADR, an API/event contract, ownership definition, operational plan, and data migration—not an ad hoc split.

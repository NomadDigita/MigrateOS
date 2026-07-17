# Technical Design

## Runtime components

| Component | Responsibility | Technology |
| --- | --- | --- |
| Web | Interactive product UI, authenticated API client, SSE event consumption | Next.js 15, React, TypeScript, Tailwind, Framer Motion, React Query, React Hook Form, Zod, Recharts |
| API | Authentication, authorization, command/query endpoints, event stream, job submission | FastAPI, Pydantic, SQLAlchemy |
| Worker | Durable execution of discovery, planning, mutation, validation, report tasks | Celery, Python |
| Data | Authoritative entities, audit history, plans, report artifacts | PostgreSQL, Alembic |
| Broker/cache | Celery transport/result coordination and transient stream fan-out | Redis |
| Repository adapter | Clone/worktree lifecycle, tree parsing, source evidence | GitPython, Tree-sitter |
| AI adapter | Structured model calls, prompt policy, output validation, usage accounting | OpenAI Responses API with configurable model/capability adapters |
| Runner | Disposable policy-controlled validation environment | Docker / Docker Compose |

## Repository processing contract

1. The API validates a repository request and records a `MigrationJob` with an idempotency key.
2. Discovery resolves an allowed repository reference and records the exact commit SHA.
3. A worker creates a disposable workspace at that SHA. It cannot reuse a previous job workspace.
4. Parsers produce a normalized `RepositoryInventory`; dependency and framework analyzers produce `Finding` artifacts with source spans.
5. The planner consumes validated inventory/findings and produces a versioned `MigrationPlan`.
6. A human approves that exact plan version before the executor creates changes.
7. Refactoring, configuration, and testing agents emit patch/artifact proposals. A patch applier validates path scope and applies them atomically to the disposable workspace.
8. The validation adapter selects only approved commands for the detected ecosystem; outputs are captured, size-limited, redacted, and persisted as evidence.
9. The report generator produces structured report data and a rendered Markdown/HTML representation. A GitHub adapter may create a draft PR only after authorization.

## Agent artifact envelope

All agents receive and return a typed envelope. Free-form explanations may be included but cannot drive state transitions.

```json
{
  "schema_version": "1.0",
  "job_id": "uuid",
  "agent_run_id": "uuid",
  "input_artifact_ids": ["uuid"],
  "status": "succeeded",
  "result": {},
  "evidence": [{"path": "package.json", "start_line": 1, "end_line": 30}],
  "warnings": [],
  "confidence": 0.91,
  "policy_decisions": ["repository_content_treated_as_untrusted"],
  "usage": {"provider": "openai", "model": "deployment-configured", "input_tokens": 0, "output_tokens": 0}
}
```

Pydantic models validate this envelope before persistence. Unknown fields are rejected at external boundaries and tolerated only in versioned internal extension maps.

## AI interaction policy

- System/developer instructions are authored in versioned prompt modules; repository text is supplied as quoted, labeled data.
- Model tools are limited to application-owned read-only analysis operations or a scoped patch proposal interface. A model cannot invoke a shell, network client, GitHub write, or secret reader directly.
- Responses use structured output schemas. Invalid or low-confidence output is retried only within a bounded policy and is escalated as `needs_attention` when unresolved.
- Prompts include a redaction pass and file/content size budgets. Binary files, lockfile bulk content, secrets, and unsupported formats are excluded by default.
- The deployment chooses an approved model identifier through configuration. The architecture does not hard-code model availability or billing assumptions.

## Validation policy

Validation is adapter-driven by ecosystem. An adapter supplies a fixed sequence of commands, expected artifacts, timeout/limit settings, and result parser. The first implementation will allow only commands explicitly selected by the platform for known fixture types. It will not run arbitrary repository-defined scripts merely because an agent recommends them.

## Configuration and secrets

Twelve-factor configuration is read from environment variables and validated at process startup. Separate settings models cover API, worker, database, GitHub, OpenAI, sandbox, telemetry, and retention. Production secrets come from the deployment secret store; local developer secrets live in ignored environment files. The API key is server/worker-only and never uses a `NEXT_PUBLIC_` variable.

## Error handling

Application errors use stable machine codes, safe messages, correlation IDs, and HTTP mapping at the API boundary. Retryability is explicit: transport faults may retry with backoff; policy denials, schema violations, invalid plans, and failed validation do not retry blindly. Full third-party responses are redacted before persistence.

## Testing strategy

| Test level | Focus |
| --- | --- |
| Unit | Domain transitions, risk calculation, policy checks, Pydantic contracts, prompt/adapter selection |
| Integration | API-to-database behavior, worker handoff, Redis stream/replay, Git sandbox adapter, migrations |
| Contract | OpenAPI compatibility, agent artifact schemas, GitHub/OpenAI adapters with recorded fixtures |
| End-to-end | Browser flow against a deterministic legacy-repository fixture and fake model provider |
| Security | Authorization, path traversal, secret redaction, prompt-injection fixtures, command policy enforcement |

The CI pipeline will fail on formatting, static checks, migrations, unit/integration suites, and affected E2E paths. Live model calls are excluded from pull-request CI; controlled evaluation runs use approved environments and budget ceilings.

# API Contracts

## Conventions

- Base path: `/api/v1`.
- JSON field names are `snake_case`; timestamps are UTC ISO 8601 strings; identifiers are UUIDs.
- Authenticated endpoints enforce tenant/project membership and resource-level authorization.
- Commands accept an `Idempotency-Key` header. Reusing a key with a different payload returns `409`.
- List responses use cursor pagination: `{ "data": [], "next_cursor": null }`.
- Error bodies are safe, structured, and correlation-aware:

```json
{
  "error": {
    "code": "plan_approval_required",
    "message": "The migration plan must be approved before execution.",
    "correlation_id": "uuid",
    "details": []
  }
}
```

## Core resources

| Resource | Key fields |
| --- | --- |
| Project | `id`, `name`, `organization_id`, `created_at` |
| Repository | `id`, `project_id`, `provider`, `external_id`, `default_branch`, `connection_status` |
| Analysis | `id`, `repository_id`, `source_snapshot_id`, `status`, `risk_summary` |
| Migration Job | `id`, `project_id`, `repository_id`, `status`, `source_snapshot_id`, `approved_plan_id`, `correlation_id` |
| Migration Plan | `id`, `job_id`, `version`, `status`, `steps`, `risk_assessment`, `approval` |
| Execution | `id`, `job_id`, `status`, `workspace_ref`, `validation_status`, `started_at`, `ended_at` |
| Agent Run | `id`, `execution_id`, `agent_type`, `status`, `reasoning_summary`, `artifact_refs` |
| Report | `id`, `job_id`, `status`, `summary`, `artifact_url`, `created_at` |

## Endpoint surface

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Liveness/readiness health for platform infrastructure |
| `GET` | `/projects` | List accessible projects |
| `POST` | `/projects` | Create project |
| `GET` | `/projects/{project_id}/repositories` | List connected repositories |
| `POST` | `/projects/{project_id}/repositories` | Connect/register repository through an approved provider flow |
| `POST` | `/repositories/{repository_id}/analyses` | Start asynchronous snapshot discovery and analysis |
| `GET` | `/analyses/{analysis_id}` | Read findings, evidence, technology profile, and risk summary |
| `POST` | `/repositories/{repository_id}/migration-jobs` | Create job from source ref and approved target/playbook request |
| `GET` | `/migration-jobs/{job_id}` | Read job, lifecycle, and high-level result |
| `POST` | `/migration-jobs/{job_id}/plans` | Request plan generation from completed analysis |
| `GET` | `/migration-jobs/{job_id}/plans/{plan_id}` | Read a specific immutable plan version |
| `POST` | `/migration-jobs/{job_id}/plans/{plan_id}/approval` | Approve or reject plan with policy/audit metadata |
| `POST` | `/migration-jobs/{job_id}/executions` | Start execution only for an approved plan |
| `GET` | `/migration-jobs/{job_id}/agent-runs` | Read ordered agent activity and artifacts |
| `GET` | `/migration-jobs/{job_id}/events` | SSE stream and replay of redacted job events |
| `GET` | `/migration-jobs/{job_id}/report` | Read completed report data/rendering metadata |
| `POST` | `/migration-jobs/{job_id}/pull-requests` | Create a draft PR after authorization and validation policy pass |

## Command request examples

```json
POST /api/v1/repositories/7bc0.../migration-jobs
{
  "source_ref": "main",
  "playbook_id": "node-express-4-to-5",
  "target": {"framework": "express", "version": "5"},
  "options": {"generate_tests": true}
}
```

```json
POST /api/v1/migration-jobs/3af1.../plans/926c.../approval
{
  "decision": "approved",
  "comment": "Proceed with the proposed staged upgrade."
}
```

The API resolves `source_ref` to a commit SHA immediately and persists that immutable snapshot. It rejects missing playbooks, unsupported target combinations, invalid state transitions, or unauthorized scope before creating worker work.

## Server-sent events

`GET /migration-jobs/{job_id}/events` returns `text/event-stream`. Clients may pass `Last-Event-ID` to replay events after reconnecting. Event payloads are redacted, sequenced, and persisted before delivery.

```text
id: 184
event: agent.status_changed
data: {"job_id":"3af1...","agent_run_id":"4d11...","agent_type":"refactoring","status":"running","at":"2026-07-17T10:00:00Z"}
```

Event categories include `job.status_changed`, `agent.status_changed`, `agent.log`, `artifact.created`, `validation.completed`, and `report.ready`. `agent.log` is rate-limited, size-limited, and contains no raw secrets, prompts, or unrestricted source content.

## Authorization model

Roles are `owner`, `maintainer`, `contributor`, and `viewer`. Owners manage project/repository connections and retention settings; maintainers approve plans and authorize PR creation; contributors create analyses/plans; viewers read non-sensitive project artifacts. Service-to-service worker calls use workload identity rather than browser credentials.

## Compatibility policy

The OpenAPI document is generated from Pydantic/FastAPI schemas and checked in CI. Additive optional fields are compatible; renamed, removed, or semantic-breaking fields require a new `/api/v2` path or a documented deprecation period.

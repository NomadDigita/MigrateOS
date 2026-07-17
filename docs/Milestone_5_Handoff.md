# Milestone 5 — Live Workflow Handoff

**Checkpoint date:** 2026-07-17  
**Base commit audited:** `a4ee26e` (`feat(milestone-5): add live repository onboarding workflow`)

## Why this checkpoint exists

This document records the implementation approach and the exact state of the
Milestone 5 work. It is intentionally candid: the persisted live workflow is
implemented and verified at the backend level, while real repository mutation,
allow-listed validation, GitHub App authorization, and final production
configuration remain the next bounded delivery steps. Nothing in the dashboard
pretends that those blocked actions completed.

## Approach taken

### 1. Preserve the documented architecture

The starting commit added a synchronous import route that used a separate
Supabase REST schema (`repository_snapshots`, `events`, `migration_steps`) not
represented by the repository's Alembic migrations or database models. The
existing architecture specifies PostgreSQL as the authoritative store, with
Supabase providing the managed PostgreSQL deployment. The checkpoint therefore
extends the existing SQLAlchemy/Alembic model instead of creating a competing
persistence path.

`20260717_0002_live_workflow` adds the missing durable records:

- `source_snapshots` for immutable repository-analysis metadata;
- `artifacts` for checksummed structured analysis, plan, agent, and report
  outputs;
- `approvals` for explicit plan decisions;
- `job_events` for ordered, durable event replay.

`20260717_0003_pin_job_snapshots` links each job to its exact source snapshot
and backfills that relationship for existing rows with a matching commit SHA.

The migration is forward-only and the Render start command now applies it before
starting Uvicorn.

### 2. Persist before streaming

`WorkflowService` is the orchestration boundary for the live path:

1. `POST /api/v1/repositories/import` validates a public GitHub URL, writes the
   repository/job command and initial events, then returns `202`.
2. Repository intelligence runs asynchronously, persists its snapshot metadata
   and a checksummed analysis artifact, then creates a versioned migration plan.
3. The planner, dependency, framework, configuration, and security outcomes are
   stored as typed agent records and artifacts.
4. An approval-ready report is persisted with the plan.
5. `POST /api/v1/migration-jobs/{job_id}/plans/{plan_id}/approval` records the
   approval before scheduling execution.
6. `GET /api/v1/migration-jobs/{job_id}/events` replays persisted events over
   SSE using `Last-Event-ID`; the matching `/events/ws` endpoint reads the same
   records over WebSockets.

The in-process background dispatcher is the default because Redis is optional.
When a Render worker and Redis are configured, set
`MIGRATEOS_WORKFLOW_DISPATCH=celery` to use the existing typed Celery tasks.

### 3. Keep execution honest and approval-gated

No patch provider, validation adapter, or GitHub App authorization exists in the
repository/configuration yet. After approval, the Refactor, Test Generator,
Validation, and Pull Request agents persist `blocked` outcomes and a report with
the exact reason. They do **not** fabricate patches, test results, validation
success, or a pull request. This preserves the product's approval and evidence
principles while making the current limitation visible to users.

### 4. Remove UI mock data

The hard-coded dashboard metrics, agent entries, execution log, repository
intelligence counts, and landing-page demo repository action were removed. The
landing page only submits a real URL. The dashboard, repository-intelligence
view, and new job overview/plan/execution/agents/report routes fetch the public
API and have loading, empty, success, and error states. The job workspace uses a
WebSocket to invalidate live data and reloads the complete persisted history on
refresh.

## Completed and verified in this checkpoint

- All repository documentation, ADRs, API, deployment, database, and
  architecture documents were read before implementation.
- PostgreSQL/Supabase integration now uses the documented SQLAlchemy/Alembic
  data model rather than the unmatched Supabase REST tables from the starting
  commit.
- Import, plan, report, artifacts, agent history, explicit approval, SSE replay,
  WebSocket delivery, and live dashboard/job API paths are implemented.
- A new workflow integration test uses a disposable relational database and
  verifies import, planning, artifact persistence, report generation, approval,
  blocked execution reporting, and event replay.
- Backend verification passed:
  - `python -m ruff check backend workers`
  - `python -m black --check backend workers`
  - `python -m compileall -q backend workers`
  - `python -m pytest` — 5 passed
  - `alembic -c backend/alembic.ini upgrade head --sql` — generated the
    `source_snapshots`, `artifacts`, and `job_events` DDL.
- `apps/frontend/package-lock.json` was generated from the already pinned
  `package.json`, restoring the repository's existing `npm ci` CI contract.
- Frontend source was formatted with the pinned Prettier `3.5.2` release.

## Deployment state and next actions

The public checks taken before this checkpoint showed:

- Vercel frontend: reachable (`200`).
- Render health endpoint: reachable (`200`), but it reported
  `environment=development`.
- Previous `/api/v1/platform/overview`: `503`, because the starting commit
  required unconfigured Supabase REST credentials.

Before deploying this checkpoint, configure Render with:

```text
MIGRATEOS_ENVIRONMENT=production
MIGRATEOS_DATABASE_URL=postgresql+psycopg://...  # Supabase PostgreSQL connection
MIGRATEOS_CORS_ORIGINS=https://migrate-os.vercel.app
```

Then configure Vercel with:

```text
NEXT_PUBLIC_API_BASE_URL=https://migrateos.onrender.com/api/v1
```

The updated `render.yaml` runs Alembic before Uvicorn. Deploying therefore
requires a Supabase PostgreSQL connection that can apply revisions
`20260717_0002` and `20260717_0003`.

The local frontend package manager became unresponsive during `npm ci` despite
the npm registry being reachable and the lockfile being generated. The backend
test suite is green; the remaining frontend `npm run format:check`,
`npm run lint`, `npm run test`, and `npm run build` should be rerun on the next
machine/session before declaring the milestone fully verified.

## Where the work is heading

1. Re-run the frontend quality/build suite and fix any TypeScript or rendering
   findings.
2. Apply the Supabase migration through Render, set production/CORS variables,
   and verify import, SSE replay, and WebSocket delivery against the deployed
   API.
3. Add a scoped patch-provider port and a disposable worktree implementation
   that can emit actual patch artifacts only after approval.
4. Add allow-listed validation adapters for supported ecosystems and persist
   their redacted command evidence.
5. Add GitHub App authentication/authorization and explicit PR-creation
   authorization before enabling the Pull Request Agent.
6. Run the complete deployed browser flow, then update this handoff into the
   final Milestone 5 engineering report.

## Working offline

The committed backend and frontend source can be inspected, edited, and tested
offline once their Python/npm dependencies are available locally. The live
repository-import flow, GitHub clone, Supabase migration/deployment, Render,
Vercel, and package installation all require network access. The current
checkpoint is safe to continue from offline, but those external verifications
cannot be performed without connectivity.

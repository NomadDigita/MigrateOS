# Deployment Design

## Environments

| Environment | Purpose | Data policy |
| --- | --- | --- |
| Local | Contributor development with Docker Compose | Synthetic fixtures and local-only secrets in ignored files |
| CI | Repeatable tests and security checks | Ephemeral services; no production credentials or live model calls |
| Staging | Integration/evaluation validation | Isolated GitHub/OpenAI projects and scrubbed test repositories |
| Production | Customer workloads | Managed Postgres/Redis/object storage, secret manager, workload identities, monitored sandbox workers |

## Milestone 2 local topology

`compose.yaml` provides a reproducible local stack: Next.js frontend (3000), FastAPI API (8000), Celery worker, PostgreSQL 16, and Redis 7.4. The API waits for healthy Postgres/Redis and runs Alembic before serving traffic. All Python container processes run unprivileged. `docker compose config --quiet` is a CI gate; the next milestone adds a running integration smoke test against this topology.

## Production topology

Run the web app, API, worker, and sandbox runner as separately deployable workloads. PostgreSQL, Redis, object storage, and secrets are managed services. API workloads are stateless and horizontally scalable; worker queues separate latency-sensitive planning from resource-intensive repository/validation work. Sandbox jobs use isolated short-lived compute with no host Docker socket, unprivileged execution, mounted workspace only, egress policy, and hard resource limits.

## Required controls

- TLS at the edge; secure cookies and CSRF protection for browser auth flows.
- GitHub App installation tokens scoped to the repository operation and rotated by provider mechanisms.
- OpenAI credentials restricted to server/worker workloads and supplied through a secret manager.
- Encrypted transport and storage; backup/restore exercises for PostgreSQL; point-in-time recovery where available.
- Structured logs redacted before export, centralized metrics/traces, health/readiness probes, and actionable alerts.
- Image provenance, dependency scanning, least-privileged service identities, and pinned base images.
- Versioned database migrations as a release precondition, with expand/migrate/contract steps for breaking schema changes.

## Render packaging

Render installs the MigrateOS distribution with Poetry. Its import packages are explicitly configured as `backend` and `workers`, so Poetry installs them into the virtual environment rather than guessing that a `migrateos/` package exists. The repository root must be the Render service root directory, and the start command runs `poetry run alembic -c backend/alembic.ini upgrade head` before `poetry run uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`. Configure `MIGRATEOS_DATABASE_URL` with the Supabase PostgreSQL connection string; the service uses SQLAlchemy/Alembic rather than a browser-exposed Supabase credential. Do not configure Render to run `app.main:app` or set `backend/` as the service root; both select a different import architecture. In Render Settings, leave **Root Directory** blank and use `/api/v1/health` as the **Health Check Path**. If the deploy log says `No 'script_location' key found in configuration`, Render is not using the repository root or is not receiving the `backend/alembic.ini` configuration file. Docker retains matching setuptools package discovery for its independent `pip install .` build path.

### Supabase from Render (required IPv4 path)

Render cannot reach Supabase's IPv6-only direct PostgreSQL endpoint (`db.<project-ref>.supabase.co`). In the Supabase dashboard, select **Connect**, copy the **Session pooler** connection string (port `5432`), replace the scheme with `postgresql+psycopg://`, and set that exact value as `MIGRATEOS_DATABASE_URL` in Render. The username for a pooled connection includes the project reference; retain it exactly as supplied by Supabase. URL-encode special characters in the password. Do not copy the direct connection string, transaction-pooler (`6543`) string, Supabase service-role key, or browser-facing API key into this setting.

After saving the environment variable, run **Manual Deploy → Clear build cache & deploy**. A successful release logs the Alembic upgrade before Uvicorn starts. The durable workflow tables and `alembic_version` are created by that release; do not create them manually from the Supabase SQL editor.

### Recovering a pre-Alembic Supabase schema

Early MigrateOS deployments could have created a separate, manual Supabase schema in `public`. It is not structurally compatible with the SQLAlchemy/Alembic schema (for example, its `projects` ownership column and its plan/snapshot relationships differ), so it must never be stamped as an Alembic revision. If the database has legacy MigrateOS objects but no `alembic_version` table, run [`supabase/archive_legacy_migrateos_schema.sql`](../supabase/archive_legacy_migrateos_schema.sql) once in the Supabase SQL Editor. The script archives only those named legacy objects in `migrateos_legacy_20260718`; it does not delete their data. After it completes, deploy Render again so Alembic creates the current schema from revision `20260717_0001` through `20260717_0003`.

### Production sign-in (GitHub and Google only)

MigrateOS uses Supabase Auth for browser sign-in and validates the resulting access token at the API boundary. Email/password, magic-link, and anonymous sign-in are deliberately not part of this release.

1. In Supabase **Authentication → URL Configuration**, set Site URL to `https://migrate-os.vercel.app` and add `https://migrate-os.vercel.app/auth/callback` to Redirect URLs.
2. Create a GitHub OAuth App and a Google OAuth Web application. Each provider uses `https://<project-ref>.supabase.co/auth/v1/callback`; enable only GitHub and Google in Supabase Auth. Provider client secrets stay in Supabase, never Vercel or Render.
3. In Vercel, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for Production and Preview.
4. In Render, set `MIGRATEOS_SUPABASE_URL` and `MIGRATEOS_SUPABASE_PUBLISHABLE_KEY`, plus `MIGRATEOS_CORS_ORIGINS=https://migrate-os.vercel.app`.

The backend maps the verified Supabase user UUID to a dedicated MigrateOS user and workspace on first import. Every repository, plan, report, approval, dashboard projection, SSE replay, and WebSocket event stream is authorized against that owner; a caller cannot select another project by ID.

## Release procedure

1. CI verifies the exact commit and publishes signed/versioned artifacts.
2. Deploy migrations using the compatible expansion phase, then roll out API/web/workers.
3. Run readiness checks and a non-mutating smoke test.
4. Enable new playbooks or model/prompt versions behind explicit configuration flags.
5. Monitor error, queue, sandbox, latency, cost, and validation-failure metrics.
6. Roll back application images/configuration on regression; use documented data restore procedures rather than reversing migrations blindly.

## Disaster and incident posture

No migration job is the sole copy of a customer repository; source control remains canonical. Job workspaces are disposable. The system preserves redacted artifact metadata sufficient to explain an incident, while retention policy controls large source-derived artifacts. Incidents that affect repository tokens, secrets, sandbox isolation, or unauthorized mutations trigger credential revocation, job suspension, audit review, and customer notification according to the organization’s response policy.

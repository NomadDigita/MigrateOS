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

Render deploys the API as an application, not a Python distribution. `pyproject.toml` therefore sets Poetry `package-mode = false`: Poetry installs runtime dependencies without searching for a nonexistent `migrateos/` source package. The start command imports the real package explicitly: `uvicorn backend.app.main:app`. Docker retains setuptools package discovery for its independent `pip install .` build path, which correctly includes `backend` and `workers`.

## Release procedure

1. CI verifies the exact commit and publishes signed/versioned artifacts.
2. Deploy migrations using the compatible expansion phase, then roll out API/web/workers.
3. Run readiness checks and a non-mutating smoke test.
4. Enable new playbooks or model/prompt versions behind explicit configuration flags.
5. Monitor error, queue, sandbox, latency, cost, and validation-failure metrics.
6. Roll back application images/configuration on regression; use documented data restore procedures rather than reversing migrations blindly.

## Disaster and incident posture

No migration job is the sole copy of a customer repository; source control remains canonical. Job workspaces are disposable. The system preserves redacted artifact metadata sufficient to explain an incident, while retention policy controls large source-derived artifacts. Incidents that affect repository tokens, secrets, sandbox isolation, or unauthorized mutations trigger credential revocation, job suspension, audit review, and customer notification according to the organization’s response policy.

import { publicConfig } from "./config";

export interface PlatformEvent {
  id: number;
  job_id: string;
  sequence: number;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface RepositorySummary {
  id: string;
  project_id: string;
  provider: string;
  external_id: string;
  default_branch: string;
  connection_status: string;
  created_at: string;
}

export interface JobSummary {
  id: string;
  repository_id: string;
  status: string;
  source_ref: string;
  source_commit_sha: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanSummary {
  id: string;
  job_id: string;
  status: string;
  risk_score: number;
  created_at: string;
}

export interface PlatformOverview {
  projects: Array<{ id: string; name: string; created_at: string }>;
  repositories: RepositorySummary[];
  jobs: JobSummary[];
  plans: PlanSummary[];
  events: PlatformEvent[];
  metrics: {
    project_count: number;
    repository_count: number;
    job_count: number;
    plan_count: number;
    active_job_count: number;
  };
}

export interface JobDetail {
  job: JobSummary;
  repository: Pick<RepositorySummary, "id" | "external_id" | "provider" | "default_branch"> | null;
  snapshot: {
    id: string;
    commit_sha: string | null;
    tree_hash: string | null;
    captured_at: string;
    summary: {
      health_score: number | null;
      file_count: number;
      dependency_count: number;
      technology_count: number;
      migration_opportunity_count: number;
    };
  } | null;
  plans: Array<{
    id: string;
    status: string;
    version: number;
    plan: {
      executive_summary?: string;
      risk_score?: number;
      overall_risk?: string;
      steps?: Array<{
        id: string;
        title: string;
        description: string;
        risk: string;
        affected_dependencies: string[];
        rollback_instructions: string;
      }>;
      human_tasks?: string[];
    };
    risk_assessment: { risk_score?: number; overall_risk?: string; confidence?: number };
    created_at: string;
  }>;
  report: {
    id: string;
    status: string;
    summary: Record<string, unknown>;
    artifact_id: string | null;
    created_at: string;
  } | null;
  agents: Array<{
    id: string;
    agent_type: string;
    status: string;
    message: string;
    payload: Record<string, unknown>;
    created_at: string;
  }>;
  artifacts: Array<{ id: string; kind: string; checksum: string; created_at: string }>;
  events: PlatformEvent[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${publicConfig.apiBaseUrl}${path}`, {
    cache: "no-store",
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
  });
  if (response.ok) return (await response.json()) as T;
  const body = (await response.json().catch(() => null)) as { detail?: string } | null;
  throw new Error(body?.detail ?? "The live platform request failed.");
}

export function getPlatformOverview(): Promise<PlatformOverview> {
  return request<PlatformOverview>("/platform/overview");
}

export function getJobDetail(jobId: string): Promise<JobDetail> {
  return request<JobDetail>(`/migration-jobs/${jobId}`);
}

export function importRepository(
  githubUrl: string,
): Promise<{ job_id: string; repository_id: string }> {
  return request("/repositories/import", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
    body: JSON.stringify({ github_url: githubUrl }),
  });
}

export function approvePlan(
  jobId: string,
  planId: string,
  comment?: string,
): Promise<{ execution_id: string }> {
  return request(`/migration-jobs/${jobId}/plans/${planId}/approval`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment: comment || null }),
  });
}

export function jobEventsWebSocketUrl(jobId: string, afterSequence: number): string {
  const url = new URL(publicConfig.apiBaseUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = `${url.pathname.replace(/\/$/, "")}/migration-jobs/${jobId}/events/ws`;
  url.searchParams.set("after_sequence", String(afterSequence));
  return url.toString();
}

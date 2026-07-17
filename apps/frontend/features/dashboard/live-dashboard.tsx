"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Activity, Database, FolderGit2, Workflow } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { StatusDot, type SignalStatus } from "@/components/ui/status";
import { getPlatformOverview } from "@/lib/platform-api";

function signalStatus(status: string): SignalStatus {
  if (["queued", "discovering"].includes(status)) return "analyzing";
  if (["planning", "awaiting_approval"].includes(status)) return "planning";
  if (["executing"].includes(status)) return "migrating";
  if (["validating"].includes(status)) return "validating";
  if (["completed", "reported"].includes(status)) return "success";
  if (["failed", "needs_attention", "cancelled"].includes(status)) return "warning";
  return "idle";
}

function DashboardLoading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
    </div>
  );
}

export function LiveDashboard({
  repositoryFocus = false,
}: Readonly<{ repositoryFocus?: boolean }>) {
  const query = useQuery({
    queryKey: ["platform-overview"],
    queryFn: getPlatformOverview,
    refetchInterval: 5_000,
  });
  if (query.isLoading) return <DashboardLoading />;
  if (query.isError) {
    return (
      <GlassPanel>
        <div className="relative">
          <h2 className="font-display text-xl font-semibold">Live data unavailable</h2>
          <p className="mt-2 text-sm text-ink-muted">{query.error.message}</p>
          <button
            type="button"
            onClick={() => query.refetch()}
            className="mt-4 rounded-lg border border-surface-muted px-3 py-2 text-sm font-semibold text-accent-primary"
          >
            Retry
          </button>
        </div>
      </GlassPanel>
    );
  }
  const data = query.data;
  if (repositoryFocus && data.repositories.length === 0) {
    return (
      <GlassPanel>
        <div className="relative">
          <h2 className="font-display text-xl font-semibold">No repository analyses yet</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Submit a public GitHub repository from the home page to create the first persisted
            analysis.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-lg bg-accent-primary px-3 py-2 text-sm font-bold text-canvas"
          >
            Analyze a repository
          </Link>
        </div>
      </GlassPanel>
    );
  }
  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Projects"
          value={data.metrics.project_count}
          status="success"
          icon={FolderGit2}
          detail="Persisted"
        />
        <StatCard
          label="Repositories"
          value={data.metrics.repository_count}
          status="analyzing"
          icon={Database}
          detail="Tracked"
        />
        <StatCard
          label="Migration jobs"
          value={data.metrics.job_count}
          status="planning"
          icon={Workflow}
          detail={`${data.metrics.active_job_count} active`}
        />
        <StatCard
          label="Plans"
          value={data.metrics.plan_count}
          status="success"
          icon={Activity}
          detail="Versioned"
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <GlassPanel>
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold">
                  {repositoryFocus ? "Repositories" : "Recent migration jobs"}
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Durable history from the control plane.
                </p>
              </div>
              <StatusDot status="success" label="live" />
            </div>
            {repositoryFocus ? (
              <ul className="mt-5 space-y-3">
                {data.repositories.map((repository) => (
                  <li
                    key={repository.id}
                    className="rounded-xl border border-surface-muted bg-elevated/40 p-4"
                  >
                    <p className="break-all font-mono text-xs text-ink">{repository.external_id}</p>
                    <p className="mt-2 text-sm text-ink-muted">
                      {repository.provider} · {repository.default_branch}
                    </p>
                  </li>
                ))}
              </ul>
            ) : data.jobs.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-surface-muted p-5 text-sm text-ink-muted">
                No migration activity has been recorded yet.
              </div>
            ) : (
              <ul className="mt-5 space-y-3">
                {data.jobs.map((job) => (
                  <li key={job.id}>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="block rounded-xl border border-surface-muted bg-elevated/40 p-4 transition hover:border-accent-primary"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-xs text-ink">{job.id.slice(0, 8)}</span>
                        <StatusDot
                          status={signalStatus(job.status)}
                          label={job.status.replaceAll("_", " ")}
                        />
                      </div>
                      <p className="mt-2 text-sm text-ink-muted">Source ref: {job.source_ref}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </GlassPanel>
        <GlassPanel>
          <div className="relative">
            <h2 className="font-display text-xl font-semibold">Historical activity</h2>
            <p className="mt-1 text-sm text-ink-muted">Reload-safe events retained by sequence.</p>
            {data.events.length === 0 ? (
              <p className="mt-5 rounded-xl border border-dashed border-surface-muted p-5 text-sm text-ink-muted">
                Events appear here when a repository workflow begins.
              </p>
            ) : (
              <ol className="mt-5 space-y-3 font-mono text-xs text-ink-muted">
                {data.events.slice(0, 12).map((event) => (
                  <li key={`${event.job_id}-${event.sequence}`} className="flex gap-3">
                    <span className="text-status-success" aria-hidden="true">
                      ●
                    </span>
                    <span>
                      <time dateTime={event.created_at}>
                        {new Date(event.created_at).toLocaleTimeString()}
                      </time>{" "}
                      {event.event_type}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </GlassPanel>
      </div>
    </section>
  );
}

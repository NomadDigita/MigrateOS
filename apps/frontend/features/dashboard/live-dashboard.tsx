"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowUpRight,
  Database,
  FolderGit2,
  GitBranch,
  Radar,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
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

function formatEventType(eventType: string) {
  return eventType.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function DashboardLoading() {
  return (
    <div className="space-y-6" aria-label="Loading workspace data" aria-busy="true">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-36 rounded-3xl" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    </div>
  );
}

function AccessStage({
  signIn,
}: Readonly<{ signIn: (provider: "github" | "google") => Promise<void> }>) {
  return (
    <GlassPanel className="border-accent-primary/25 bg-[radial-gradient(circle_at_80%_0%,hsl(var(--accent-secondary)/0.22),transparent_37%),linear-gradient(135deg,hsl(var(--accent-primary)/0.12),transparent_55%)] p-6 sm:p-8">
      <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-primary/30 bg-accent-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-accent-primary">
            <ShieldCheck size={14} aria-hidden="true" /> Private by design
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Enter your own modernization space.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-ink-muted sm:text-base">
            Your repositories, plans, reports, and event history are isolated to your account from
            the first analysis onward.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <button
            type="button"
            onClick={() => void signIn("github")}
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-accent-primary px-5 text-sm font-bold text-canvas shadow-[0_12px_32px_hsl(var(--accent-primary)/0.24)] transition hover:-translate-y-0.5 hover:brightness-110"
          >
            Continue with GitHub <ArrowUpRight size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => void signIn("google")}
            className="min-h-11 rounded-2xl border border-white/15 bg-white/5 px-5 text-sm font-bold text-ink transition hover:border-accent-secondary/50 hover:bg-accent-secondary/10"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </GlassPanel>
  );
}

function EmptyRepositoryStage() {
  return (
    <GlassPanel className="border-accent-primary/25 bg-[radial-gradient(circle_at_85%_10%,hsl(var(--accent-primary)/0.18),transparent_35%),linear-gradient(135deg,hsl(var(--accent-secondary)/0.16),transparent_58%)] p-0">
      <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
        <div>
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-accent-primary/30 bg-accent-primary/15 text-accent-primary shadow-[0_0_30px_hsl(var(--accent-primary)/0.18)]">
            <Radar size={21} aria-hidden="true" />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-accent-primary">
            Intelligence starts with context
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            No repository analyses yet.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-ink-muted">
            Bring in a public GitHub repository and MigrateOS will preserve its source snapshot, map
            its technology signals, and build the first reviewable path forward.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-accent-primary px-5 text-sm font-bold text-canvas shadow-[0_12px_32px_hsl(var(--accent-primary)/0.22)] transition hover:-translate-y-0.5 hover:brightness-110"
          >
            Analyze a repository <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="rounded-3xl border border-white/10 bg-canvas/35 p-4 shadow-inner">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
            <span>First signal</span>
            <Sparkles size={14} className="text-status-validating" aria-hidden="true" />
          </div>
          <div className="mt-4 space-y-3">
            {[
              "Pin the source snapshot",
              "Reveal architecture signals",
              "Generate a governed plan",
            ].map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-primary/15 text-xs font-bold text-accent-primary">
                  {index + 1}
                </span>
                <span className="text-sm text-ink-muted">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}

export function LiveDashboard({
  repositoryFocus = false,
}: Readonly<{ repositoryFocus?: boolean }>) {
  const { ready, user, signIn } = useAuth();
  const query = useQuery({
    queryKey: ["platform-overview"],
    queryFn: getPlatformOverview,
    refetchInterval: 5_000,
    enabled: ready && Boolean(user),
  });

  if (!ready) return <DashboardLoading />;
  if (!user) return <AccessStage signIn={signIn} />;

  const data = query.data;
  if (query.isError) {
    return (
      <GlassPanel className="border-status-warning/35 bg-[radial-gradient(circle_at_90%_0%,hsl(var(--status-warning)/0.13),transparent_34%)]">
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-status-warning">
              Connection signal interrupted
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold">
              Your private workspace could not refresh.
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              {query.error instanceof Error
                ? query.error.message
                : "The platform could not load the latest workspace activity."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-status-warning/35 bg-status-warning/10 px-4 text-sm font-bold text-ink transition hover:bg-status-warning/20"
          >
            <RefreshCw size={15} aria-hidden="true" /> Retry connection
          </button>
        </div>
      </GlassPanel>
    );
  }
  if (query.isLoading || !data) return <DashboardLoading />;
  if (repositoryFocus && data.repositories.length === 0) return <EmptyRepositoryStage />;

  return (
    <section className="space-y-5 sm:space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Projects"
          value={data.metrics.project_count}
          status="success"
          icon={FolderGit2}
          detail="Private"
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

      <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <GlassPanel hoverable className="min-h-[18rem] p-5 sm:p-6">
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-primary">
                  {repositoryFocus ? "Connected source map" : "Execution stream"}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
                  {repositoryFocus ? "Repository intelligence" : "Recent migration jobs"}
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  {repositoryFocus
                    ? "Source snapshots and branches kept ready for review."
                    : "A durable, reviewable timeline across every migration."}
                </p>
              </div>
              <StatusDot status="success" label="live" />
            </div>

            {repositoryFocus ? (
              <ul className="mt-6 grid gap-3">
                {data.repositories.map((repository) => (
                  <li
                    key={repository.id}
                    className="group rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-accent-primary/45 hover:bg-accent-primary/[0.055]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-accent-primary">
                          <GitBranch size={15} aria-hidden="true" />
                          <span className="text-[11px] font-bold uppercase tracking-[0.15em]">
                            {repository.provider}
                          </span>
                        </div>
                        <p className="mt-2 break-all font-mono text-sm text-ink">
                          {repository.external_id}
                        </p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-canvas/40 px-2.5 py-1 font-mono text-[11px] text-ink-muted">
                        {repository.default_branch}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : data.jobs.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-canvas/20 p-5">
                <p className="font-display text-lg font-semibold">The execution stream is quiet.</p>
                <p className="mt-2 text-sm leading-6 text-ink-muted">
                  Start with a repository analysis to see its planning and validation signals appear
                  here.
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-accent-primary hover:text-ink"
                >
                  Analyze a repository <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <ul className="mt-6 space-y-3">
                {data.jobs.map((job) => (
                  <li key={job.id}>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="group block rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:-translate-y-0.5 hover:border-accent-primary/45 hover:bg-accent-primary/[0.055]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="font-mono text-xs text-ink">Run {job.id.slice(0, 8)}</span>
                        <StatusDot
                          status={signalStatus(job.status)}
                          label={job.status.replaceAll("_", " ")}
                        />
                      </div>
                      <p className="mt-3 truncate text-sm text-ink-muted">
                        Source ref: {job.source_ref}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </GlassPanel>

        <GlassPanel hoverable className="min-h-[18rem] p-5 sm:p-6">
          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-tertiary">
                  Evidence trail
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
                  Historical activity
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Reload-safe events retained by sequence.
                </p>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-accent-tertiary/25 bg-accent-tertiary/10 text-accent-tertiary">
                <Sparkles size={16} aria-hidden="true" />
              </span>
            </div>
            {data.events.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-canvas/20 p-5 text-sm leading-6 text-ink-muted">
                Events appear here when a repository workflow begins. Each signal remains available
                after a refresh.
              </div>
            ) : (
              <ol className="mt-6 space-y-3">
                {data.events.slice(0, 12).map((event) => (
                  <li
                    key={`${event.job_id}-${event.sequence}`}
                    className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.025] p-3"
                  >
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-status-success shadow-[0_0_12px_hsl(var(--status-success)/0.65)]"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">
                        {formatEventType(event.event_type)}
                      </p>
                      <time
                        dateTime={event.created_at}
                        className="mt-1 block font-mono text-[11px] text-ink-muted"
                      >
                        {new Date(event.created_at).toLocaleString()}
                      </time>
                    </div>
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

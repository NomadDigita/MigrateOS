"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, FileCheck2, FileText, Radio, ShieldCheck } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusDot, type SignalStatus } from "@/components/ui/status";
import {
  approvePlan,
  getJobDetail,
  jobEventsWebSocketUrl,
  type JobDetail,
} from "@/lib/platform-api";

export type JobWorkspaceMode = "overview" | "plan" | "execution" | "agents" | "report";

function signalStatus(status: string): SignalStatus {
  if (["queued", "discovering"].includes(status)) return "analyzing";
  if (["planning", "awaiting_approval"].includes(status)) return "planning";
  if (status === "executing") return "migrating";
  if (status === "validating") return "validating";
  if (["completed", "reported", "succeeded"].includes(status)) return "success";
  if (["failed", "needs_attention", "blocked", "cancelled"].includes(status)) return "warning";
  return "idle";
}

function useJobWebSocket(jobId: string, lastSequence: number) {
  const queryClient = useQueryClient();
  const [connection, setConnection] = useState<"connecting" | "live" | "reconnecting">(
    "connecting",
  );
  useEffect(() => {
    let socket: WebSocket | undefined;
    let reconnectTimer: number | undefined;
    let stopped = false;
    const connect = () => {
      if (stopped) return;
      setConnection(socket ? "reconnecting" : "connecting");
      socket = new WebSocket(jobEventsWebSocketUrl(jobId, lastSequence));
      socket.onopen = () => setConnection("live");
      socket.onmessage = () =>
        queryClient.invalidateQueries({ queryKey: ["migration-job", jobId] });
      socket.onclose = () => {
        if (!stopped) reconnectTimer = window.setTimeout(connect, 1_000);
      };
    };
    connect();
    return () => {
      stopped = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [jobId, lastSequence, queryClient]);
  return connection;
}

function JobLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      <Skeleton className="h-80" />
    </div>
  );
}

function JobNavigation({ jobId, mode }: Readonly<{ jobId: string; mode: JobWorkspaceMode }>) {
  const items: Array<{ label: string; mode: JobWorkspaceMode; href: string }> = [
    { label: "Overview", mode: "overview", href: `/jobs/${jobId}` },
    { label: "Plan", mode: "plan", href: `/jobs/${jobId}/plan` },
    { label: "Execution", mode: "execution", href: `/jobs/${jobId}/execution` },
    { label: "Agents", mode: "agents", href: `/jobs/${jobId}/agents` },
    { label: "Report", mode: "report", href: `/jobs/${jobId}/report` },
  ];
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Migration job sections">
      {items.map((item) => (
        <Link
          key={item.mode}
          href={item.href}
          aria-current={mode === item.mode ? "page" : undefined}
          className={
            mode === item.mode
              ? "rounded-lg bg-accent-primary px-3 py-2 text-sm font-bold text-canvas"
              : "rounded-lg border border-surface-muted px-3 py-2 text-sm font-semibold text-ink-muted transition hover:border-accent-primary hover:text-ink"
          }
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function ReportSummary({ report }: Readonly<{ report: NonNullable<JobDetail["report"]> }>) {
  const summary = report.summary;
  const narrative =
    typeof summary.summary === "string"
      ? summary.summary
      : "A durable report artifact was generated.";
  const outcome =
    typeof summary.outcome === "string" ? summary.outcome.replaceAll("_", " ") : report.status;
  const validation =
    typeof summary.validation === "object" && summary.validation !== null
      ? (summary.validation as Record<string, unknown>)
      : null;
  const pullRequest =
    typeof summary.pull_request === "object" && summary.pull_request !== null
      ? (summary.pull_request as Record<string, unknown>)
      : null;
  return (
    <GlassPanel>
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Migration report
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold">{outcome}</h2>
          </div>
          <StatusDot
            status={signalStatus(report.status)}
            label={report.status.replaceAll("_", " ")}
          />
        </div>
        <p className="mt-4 text-sm leading-6 text-ink-muted">{narrative}</p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {validation ? (
            <div className="rounded-xl bg-elevated/55 p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Validation
              </dt>
              <dd className="mt-2 text-sm text-ink">{String(validation.status ?? "unknown")}</dd>
              <dd className="mt-1 text-sm text-ink-muted">{String(validation.reason ?? "")}</dd>
            </div>
          ) : null}
          {pullRequest ? (
            <div className="rounded-xl bg-elevated/55 p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Pull request
              </dt>
              <dd className="mt-2 text-sm text-ink">{String(pullRequest.status ?? "unknown")}</dd>
              <dd className="mt-1 text-sm text-ink-muted">{String(pullRequest.reason ?? "")}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </GlassPanel>
  );
}

function PlanView({ detail, jobId }: Readonly<{ detail: JobDetail; jobId: string }>) {
  const queryClient = useQueryClient();
  const plan = detail.plans[0];
  const approval = useMutation({
    mutationFn: () => {
      if (!plan) throw new Error("The migration plan is not available for approval.");
      return approvePlan(jobId, plan.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["migration-job", jobId] }),
  });
  if (!plan)
    return (
      <GlassPanel>
        <div className="relative">
          <h2 className="font-display text-xl font-semibold">Plan not available yet</h2>
          <p className="mt-2 text-sm text-ink-muted">
            The repository analysis is still running or did not produce a migration plan.
          </p>
        </div>
      </GlassPanel>
    );
  return (
    <div className="space-y-6">
      <GlassPanel>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Version {plan.version}
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold">
              {plan.plan.executive_summary ?? "Migration plan"}
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Risk score: {plan.risk_assessment.risk_score ?? "not calculated"} ·{" "}
              {plan.risk_assessment.overall_risk ?? "unknown"} risk
            </p>
          </div>
          {plan.status === "awaiting_approval" ? (
            <button
              type="button"
              onClick={() => approval.mutate()}
              disabled={approval.isPending}
              className="rounded-lg bg-status-success px-4 py-2 text-sm font-bold text-canvas disabled:opacity-60"
            >
              {approval.isPending ? "Recording approval…" : "Approve plan"}
            </button>
          ) : (
            <StatusDot
              status={signalStatus(plan.status)}
              label={plan.status.replaceAll("_", " ")}
            />
          )}
        </div>
        {approval.isError ? (
          <p className="relative mt-4 text-sm text-status-failed" role="alert">
            {approval.error.message}
          </p>
        ) : null}
      </GlassPanel>
      <ol className="space-y-4">
        {plan.plan.steps?.length ? (
          plan.plan.steps.map((step) => (
            <li key={step.id}>
              <GlassPanel>
                <div className="relative">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold">{step.title}</h3>
                    <StatusDot
                      status={signalStatus(step.risk === "low" ? "completed" : "needs_attention")}
                      label={`${step.risk} risk`}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-ink-muted">{step.description}</p>
                  <p className="mt-4 font-mono text-xs text-ink-muted">
                    Dependencies: {step.affected_dependencies.join(", ") || "None identified"}
                  </p>
                  <p className="mt-2 text-xs text-ink-muted">
                    Rollback: {step.rollback_instructions}
                  </p>
                </div>
              </GlassPanel>
            </li>
          ))
        ) : (
          <li>
            <GlassPanel>
              <div className="relative text-sm text-ink-muted">
                The persisted analysis found no versioned dependency changes to plan.
              </div>
            </GlassPanel>
          </li>
        )}
      </ol>
    </div>
  );
}

function ExecutionView({
  detail,
  connection,
}: Readonly<{ detail: JobDetail; connection: string }>) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <GlassPanel>
        <div className="relative">
          <div className="flex items-center gap-3">
            <Radio className="text-accent-primary" size={18} />
            <div>
              <h2 className="font-display text-xl font-semibold">Live event stream</h2>
              <p className="mt-1 text-sm text-ink-muted">
                WebSocket {connection}; history replays from durable event sequences.
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm text-ink-muted">
            Current job state:{" "}
            <span className="font-semibold text-ink">{detail.job.status.replaceAll("_", " ")}</span>
          </p>
        </div>
      </GlassPanel>
      <GlassPanel>
        <div className="relative">
          <h2 className="font-display text-xl font-semibold">Workflow events</h2>
          {detail.events.length === 0 ? (
            <p className="mt-5 text-sm text-ink-muted">
              No persisted workflow events are available yet.
            </p>
          ) : (
            <ol className="mt-5 space-y-3 font-mono text-xs text-ink-muted">
              {detail.events.map((event) => (
                <li key={event.sequence} className="grid grid-cols-[4rem_1fr] gap-3">
                  <time dateTime={event.created_at}>
                    {new Date(event.created_at).toLocaleTimeString()}
                  </time>
                  <span>
                    <span className="text-status-success">●</span> {event.event_type}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </GlassPanel>
    </div>
  );
}

function AgentsView({ detail }: Readonly<{ detail: JobDetail }>) {
  return (
    <GlassPanel>
      <div className="relative">
        <div className="flex items-center gap-3">
          <Bot className="text-accent-secondary" size={18} />
          <div>
            <h2 className="font-display text-xl font-semibold">Agent activity</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Typed, persisted outcomes only; blocked work is shown honestly.
            </p>
          </div>
        </div>
        {detail.agents.length === 0 ? (
          <p className="mt-5 text-sm text-ink-muted">
            Agent activity appears when the job begins processing.
          </p>
        ) : (
          <ol className="mt-6 space-y-3">
            {detail.agents.map((agent) => (
              <li
                key={agent.id}
                className="rounded-xl border border-surface-muted bg-elevated/45 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-semibold text-ink">{agent.agent_type}</h3>
                  <StatusDot status={signalStatus(agent.status)} label={agent.status} />
                </div>
                <p className="mt-2 text-sm text-ink-muted">{agent.message}</p>
                <time
                  className="mt-3 block font-mono text-xs text-ink-muted"
                  dateTime={agent.created_at}
                >
                  {new Date(agent.created_at).toLocaleString()}
                </time>
              </li>
            ))}
          </ol>
        )}
      </div>
    </GlassPanel>
  );
}

function OverviewView({ detail }: Readonly<{ detail: JobDetail }>) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {detail.snapshot ? (
          <GlassPanel>
            <div className="relative">
              <FileCheck2 className="text-accent-primary" size={20} />
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Source snapshot
              </p>
              <p className="mt-2 font-display text-2xl font-semibold">
                {detail.snapshot.summary.file_count} files
              </p>
              <p className="mt-2 break-all font-mono text-xs text-ink-muted">
                {detail.snapshot.commit_sha ?? "Commit unavailable"}
              </p>
            </div>
          </GlassPanel>
        ) : (
          <GlassPanel>
            <div className="relative">
              <p className="text-sm text-ink-muted">
                Snapshot data will appear after repository discovery.
              </p>
            </div>
          </GlassPanel>
        )}
        <GlassPanel>
          <div className="relative">
            <ShieldCheck className="text-status-success" size={20} />
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Evidence artifacts
            </p>
            <p className="mt-2 font-display text-2xl font-semibold">{detail.artifacts.length}</p>
            <p className="mt-2 text-sm text-ink-muted">Checksummed and persisted</p>
          </div>
        </GlassPanel>
        <GlassPanel>
          <div className="relative">
            <FileText className="text-accent-secondary" size={20} />
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Report state
            </p>
            <p className="mt-2 font-display text-2xl font-semibold">
              {detail.report?.status.replaceAll("_", " ") ?? "Pending"}
            </p>
            <p className="mt-2 text-sm text-ink-muted">Generated from the workflow record</p>
          </div>
        </GlassPanel>
      </div>
      {detail.report ? (
        <ReportSummary report={detail.report} />
      ) : (
        <GlassPanel>
          <div className="relative">
            <h2 className="font-display text-xl font-semibold">Report pending</h2>
            <p className="mt-2 text-sm text-ink-muted">
              The report is generated when repository analysis reaches a terminal planning state.
            </p>
          </div>
        </GlassPanel>
      )}
    </div>
  );
}

export function JobWorkspace({ jobId, mode }: Readonly<{ jobId: string; mode: JobWorkspaceMode }>) {
  const query = useQuery({
    queryKey: ["migration-job", jobId],
    queryFn: () => getJobDetail(jobId),
    refetchInterval: 30_000,
  });
  const lastSequence = query.data?.events.at(-1)?.sequence ?? 0;
  const connection = useJobWebSocket(jobId, lastSequence);
  if (query.isLoading) return <JobLoading />;
  if (query.isError)
    return (
      <GlassPanel>
        <div className="relative">
          <h1 className="font-display text-2xl font-semibold">Migration job unavailable</h1>
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
  const detail = query.data;
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-primary">
            Migration job
          </p>
          <h1 className="mt-2 break-all font-display text-3xl font-semibold">
            {detail.repository?.external_id ?? jobId}
          </h1>
          <p className="mt-2 font-mono text-xs text-ink-muted">Job {detail.job.id}</p>
        </div>
        <StatusDot
          status={signalStatus(detail.job.status)}
          label={detail.job.status.replaceAll("_", " ")}
        />
      </section>
      <JobNavigation jobId={jobId} mode={mode} />
      {mode === "overview" ? <OverviewView detail={detail} /> : null}
      {mode === "plan" ? <PlanView detail={detail} jobId={jobId} /> : null}
      {mode === "execution" ? <ExecutionView detail={detail} connection={connection} /> : null}
      {mode === "agents" ? <AgentsView detail={detail} /> : null}
      {mode === "report" ? (
        detail.report ? (
          <ReportSummary report={detail.report} />
        ) : (
          <GlassPanel>
            <div className="relative">
              <h2 className="font-display text-xl font-semibold">Report pending</h2>
              <p className="mt-2 text-sm text-ink-muted">
                The job has not produced a report artifact yet.
              </p>
            </div>
          </GlassPanel>
        )
      ) : null}
    </div>
  );
}

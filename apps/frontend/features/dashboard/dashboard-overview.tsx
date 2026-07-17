import { Activity, Radar, ShieldCheck, Workflow } from "lucide-react";

import { AgentCard } from "@/components/ui/agent-card";
import { GlassPanel } from "@/components/ui/glass-panel";
import { RiskBadge, StatusDot } from "@/components/ui/status";
import { StatCard } from "@/components/ui/stat-card";
import { StreamingLogPanel } from "@/components/ui/streaming-log-panel";

import { agents, executionLog } from "./dashboard-data";

export function DashboardOverview() {
  return (
    <main className="space-y-6 p-5 lg:p-8">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-primary">System operational</p><h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Modernization at a glance</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">A transparent control plane for every repository, risk signal, and agent decision.</p></div>
        <RiskBadge level="moderate" />
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Platform health">
        <StatCard label="Active jobs" value={3} status="migrating" icon={Workflow} detail="1 awaiting review" />
        <StatCard label="Agents online" value={10} status="success" icon={Activity} detail="All orchestrated" />
        <StatCard label="Risk coverage" value={86} suffix="%" status="analyzing" icon={Radar} detail="Evidence linked" />
        <StatCard label="Policy checks" value={42} status="success" icon={ShieldCheck} detail="No violations" />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <StreamingLogPanel lines={executionLog} className="xl:row-span-2" />
        <GlassPanel hoverable><div className="relative flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Current operation</p><h2 className="mt-2 font-display text-xl font-semibold">Express 4 → 5</h2></div><StatusDot status="planning" label="planning" /></div><div className="relative mt-7 space-y-4">{["Snapshot locked", "Breaking changes mapped", "Plan awaiting approval"].map((step, index) => <div key={step} className="flex items-center gap-3"><span className={index < 2 ? "h-2.5 w-2.5 rounded-full bg-status-success" : "h-2.5 w-2.5 rounded-full bg-status-planning"} aria-hidden="true" /><span className="text-sm text-ink-muted">{step}</span></div>)}</div></GlassPanel>
        <GlassPanel><div className="relative"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Repository intelligence</p><div className="mt-5 grid grid-cols-3 gap-3"><div className="rounded-xl bg-accent-primary/10 p-3"><p className="font-display text-xl font-semibold text-accent-primary">1,248</p><p className="mt-1 text-xs text-ink-muted">files</p></div><div className="rounded-xl bg-accent-secondary/10 p-3"><p className="font-display text-xl font-semibold text-accent-secondary">12</p><p className="mt-1 text-xs text-ink-muted">findings</p></div><div className="rounded-xl bg-status-warning/10 p-3"><p className="font-display text-xl font-semibold text-status-warning">4</p><p className="mt-1 text-xs text-ink-muted">manual</p></div></div></div></GlassPanel>
      </section>
      <section id="agents"><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Specialist orchestration</p><h2 className="mt-1 font-display text-xl font-semibold">Agent activity</h2></div><StatusDot status="success" label="4 agents" /></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{agents.map((agent, index) => <AgentCard key={agent.name} {...agent} index={index} />)}</div></section>
    </main>
  );
}

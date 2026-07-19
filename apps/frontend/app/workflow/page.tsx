import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  FileSearch,
  Gauge,
  GitBranch,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from "lucide-react";

import { MarketingNav } from "@/components/navigation/marketing-nav";

const phases = [
  {
    number: "01",
    Icon: FileSearch,
    eyebrow: "Source layer",
    title: "Capture what is actually there.",
    body: "Import a public repository, resolve its reference, and preserve an immutable source snapshot before recommendations begin.",
    signal: "Snapshot sealed",
    tone: "cyan",
  },
  {
    number: "02",
    Icon: Gauge,
    eyebrow: "Intelligence layer",
    title: "Turn evidence into a decision.",
    body: "Repository intelligence maps technologies, dependencies, and findings so the planner can create a reviewable, versioned path.",
    signal: "Plan assembled",
    tone: "violet",
  },
  {
    number: "03",
    Icon: ShieldCheck,
    eyebrow: "Governance layer",
    title: "Keep humans in the loop.",
    body: "Risk, scope, validation, rollback, and approval are explicit records—not invisible assumptions behind an automated action.",
    signal: "Approval required",
    tone: "pink",
  },
  {
    number: "04",
    Icon: CheckCircle2,
    eyebrow: "Memory layer",
    title: "Keep the proof in reach.",
    body: "Reports, artifacts, and sequence-numbered events stay available across reconnects, refreshes, and later review.",
    signal: "Evidence retained",
    tone: "gold",
  },
] as const;

const orbitStops = ["Repository", "Snapshot", "Plan", "Approval", "Report"];

export default function WorkflowPage() {
  return (
    <main className="signal-grid min-h-screen overflow-x-clip bg-grid">
      <MarketingNav />
      <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-6 sm:pt-16 lg:pb-24">
        <div className="pointer-events-none absolute left-[15%] top-20 h-72 w-72 rounded-full bg-accent-primary/10 blur-[110px]" />
        <div className="pointer-events-none absolute right-[7%] top-44 h-80 w-80 rounded-full bg-accent-secondary/20 blur-[120px]" />

        <div className="relative grid items-center gap-9 lg:grid-cols-[minmax(0,0.9fr)_minmax(430px,0.8fr)] lg:gap-16">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-accent-primary/35 bg-accent-primary/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-accent-primary">
              <Waypoints size={14} aria-hidden="true" /> The modernization path
            </p>
            <h1 className="mt-6 max-w-[10ch] font-display text-5xl font-semibold leading-[0.92] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
              Move fast. <span className="text-accent-primary">Keep every signal.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-ink-muted sm:text-lg">
              MigrateOS makes AI-assisted modernization visible: source evidence, a governed plan,
              human approval, and a durable record of the outcome.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 rounded-2xl bg-accent-primary px-5 py-3.5 text-sm font-bold text-canvas shadow-[0_15px_42px_hsl(var(--accent-primary)/0.22)] transition hover:-translate-y-0.5 hover:brightness-110"
              >
                Start an analysis{" "}
                <ArrowRight className="transition group-hover:translate-x-1" size={17} />
              </Link>
              <Link
                href="/security"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.045] px-5 py-3.5 text-sm font-bold text-ink transition hover:border-accent-secondary/60 hover:bg-white/[0.09]"
              >
                See guardrails <ShieldCheck size={17} />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[34rem]">
            <div
              className="workflow-orbit absolute inset-8 rounded-[2.5rem] border border-dashed border-accent-secondary/35"
              aria-hidden="true"
            />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[linear-gradient(145deg,hsl(var(--surface)/0.9),hsl(var(--accent-secondary)/0.13))] p-4 shadow-[0_30px_90px_hsl(var(--shadow)/0.48)] backdrop-blur-xl sm:p-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_12%,hsl(var(--accent-tertiary)/0.24),transparent_27%),radial-gradient(circle_at_18%_88%,hsl(var(--accent-primary)/0.18),transparent_28%)]" />
              <div className="relative rounded-[1.45rem] border border-white/10 bg-canvas/70 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-status-failed" />
                    <span className="h-2.5 w-2.5 rounded-full bg-status-validating" />
                    <span className="h-2.5 w-2.5 rounded-full bg-status-success" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-muted">
                    live blueprint
                  </span>
                </div>
                <div className="mt-7 grid place-items-center py-4">
                  <div className="workflow-core relative grid h-32 w-32 place-items-center rounded-[2.1rem] border border-accent-primary/35 bg-accent-primary/10 shadow-[0_0_55px_hsl(var(--accent-primary)/0.19)] sm:h-36 sm:w-36">
                    <div className="absolute inset-3 rounded-[1.55rem] border border-accent-tertiary/40" />
                    <GitBranch className="relative text-accent-primary" size={36} />
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {orbitStops.slice(0, 4).map((stop, index) => (
                    <div
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2.5 text-xs font-semibold text-ink-muted"
                      key={stop}
                    >
                      <span className="grid h-5 w-5 place-items-center rounded-md bg-accent-primary/10 font-mono text-[10px] text-accent-primary">
                        {index + 1}
                      </span>
                      {stop}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2 overflow-hidden rounded-xl border border-status-success/20 bg-status-success/[0.07] px-3 py-2.5 font-mono text-[11px] text-status-success">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-status-success shadow-[0_0_16px_hsl(var(--status-success))]" />
                  <span className="workflow-type">evidence stream connected_</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-3 hidden items-center gap-2 rounded-2xl border border-white/15 bg-surface/80 px-3 py-2.5 text-xs font-bold text-ink shadow-glass backdrop-blur-xl sm:flex">
              <Sparkles size={15} className="text-status-validating" /> Human-governed AI
            </div>
          </div>
        </div>

        <div className="relative mt-16 flex items-center gap-3 sm:mt-24">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-accent-primary/50 to-transparent" />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
            Four explicit stages
          </p>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-accent-secondary/50 to-transparent" />
        </div>

        <ol className="relative mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {phases.map(({ number, Icon, eyebrow, title, body, signal, tone }) => (
            <li
              key={number}
              className="group relative isolate overflow-hidden rounded-[1.7rem] border border-white/12 bg-surface/70 p-5 shadow-glass backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-accent-primary/45 hover:shadow-[0_26px_70px_hsl(var(--shadow)/0.42)] sm:p-6"
            >
              <div className={`workflow-card-glow workflow-card-glow-${tone}`} aria-hidden="true" />
              <div className="relative flex items-start justify-between gap-5">
                <div>
                  <span className="font-mono text-xs font-bold text-accent-tertiary">{number}</span>
                  <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
                    {eyebrow}
                  </p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-2xl border border-accent-primary/25 bg-accent-primary/10 text-accent-primary transition duration-500 group-hover:rotate-6 group-hover:scale-110">
                  <Icon size={20} />
                </span>
              </div>
              <h2 className="relative mt-7 font-display text-2xl font-semibold leading-[1.03] tracking-tight">
                {title}
              </h2>
              <p className="relative mt-4 text-sm leading-7 text-ink-muted">{body}</p>
              <div className="relative mt-7 flex items-center justify-between border-t border-white/10 pt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
                  {signal}
                </span>
                <ChevronRight
                  size={15}
                  className="text-accent-primary transition group-hover:translate-x-1"
                />
              </div>
            </li>
          ))}
        </ol>

        <div className="relative mt-12 overflow-hidden rounded-[2rem] border border-status-success/25 bg-[linear-gradient(110deg,hsl(var(--status-success)/0.13),hsl(var(--surface)/0.82)_42%,hsl(var(--accent-secondary)/0.16))] p-7 shadow-glass sm:p-9">
          <div
            className="absolute -right-10 -top-12 h-48 w-48 rounded-full border border-status-success/25"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-status-success">
                Designed for responsible velocity
              </p>
              <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                A path your engineering team can replay and trust.
              </h2>
            </div>
            <Link
              href="/"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-ink px-5 py-3 font-bold text-canvas transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Open MigrateOS <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

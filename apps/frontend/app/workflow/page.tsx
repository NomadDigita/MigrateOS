import Link from "next/link";
import { ArrowRight, CheckCircle2, FileSearch, Gauge, ShieldCheck, Waypoints } from "lucide-react";

import { MarketingNav } from "@/components/navigation/marketing-nav";

const phases = [
  [
    "01",
    FileSearch,
    "Capture the source of truth",
    "Import a repository URL, resolve its reference, and persist the repository plus immutable snapshot metadata.",
  ],
  [
    "02",
    Gauge,
    "Turn evidence into a plan",
    "Repository intelligence records technologies, dependencies, and findings before the planner produces a versioned migration plan.",
  ],
  [
    "03",
    ShieldCheck,
    "Pause for an explicit decision",
    "The plan stays reviewable with risk, scope, validation, and rollback controls. Approval is a record—not an implied click.",
  ],
  [
    "04",
    CheckCircle2,
    "Preserve the outcome",
    "Agent outcomes, report artifacts, and sequence-numbered events remain available when the page reconnects or refreshes.",
  ],
] as const;

export default function WorkflowPage() {
  return (
    <main className="signal-grid min-h-screen bg-grid">
      <MarketingNav />
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-14 sm:pt-24">
        <div className="max-w-3xl">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-accent-primary">
            <Waypoints size={15} /> The modernization path
          </p>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-6xl">
            A visible system around every upgrade.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-muted">
            MigrateOS keeps the useful parts of AI-assisted modernization—speed and pattern
            recognition—inside a workflow your team can inspect and govern.
          </p>
        </div>
        <ol className="mt-14 grid gap-4 lg:grid-cols-4">
          {phases.map(([number, Icon, title, body]) => (
            <li
              key={number}
              className="relative overflow-hidden rounded-[1.7rem] border border-surface-muted bg-surface/75 p-6 shadow-glass"
            >
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-accent-secondary/15 blur-2xl" />
              <span className="relative font-mono text-xs font-bold text-accent-tertiary">
                {number}
              </span>
              <span className="relative mt-9 grid h-11 w-11 place-items-center rounded-xl border border-accent-primary/20 bg-accent-primary/10 text-accent-primary">
                <Icon size={20} />
              </span>
              <h2 className="relative mt-6 font-display text-2xl font-semibold">{title}</h2>
              <p className="relative mt-3 text-sm leading-7 text-ink-muted">{body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-col gap-5 rounded-[2rem] border border-status-success/25 bg-gradient-to-r from-status-success/10 via-surface to-accent-secondary/10 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-status-success">
              Ready when your repository is
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold">
              Start from a public GitHub repository.
            </h2>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-5 py-3 font-bold text-canvas transition hover:brightness-110"
          >
            Analyze a repository <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}

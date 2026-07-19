import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Github,
  Network,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { MarketingNav } from "@/components/navigation/marketing-nav";

const questions = [
  {
    number: "01",
    question: "What happens after I submit a repository URL?",
    answer:
      "MigrateOS creates a private repository and migration-job record, captures repository intelligence, then produces a persisted migration plan and report. Your workspace reveals the artifacts and event history as they are recorded.",
  },
  {
    number: "02",
    question: "Does MigrateOS execute changes automatically?",
    answer:
      "No. Planning is deliberately separated from execution. A plan needs an explicit approval record before constrained execution can begin, and blocked integrations are shown honestly instead of being presented as completed work.",
  },
  {
    number: "03",
    question: "Can I return to an analysis after a refresh?",
    answer:
      "Yes. Repository snapshots, plans, reports, artifacts, and event sequences are persisted. The dashboard and job pages read those durable records from the API—not demo data or temporary browser state.",
  },
  {
    number: "04",
    question: "How are live updates delivered?",
    answer:
      "The job workspace listens for persisted workflow events through WebSockets, while the API also supports replayable server-sent events. Refreshing the page does not erase historical activity.",
  },
  {
    number: "05",
    question: "Why might the dashboard say live data is unavailable?",
    answer:
      "That state means the frontend reached the API but the API could not complete its storage-backed request. Check the Render service configuration, especially its Supabase PostgreSQL connection string and applied Alembic migrations.",
  },
];

export default function FaqPage() {
  return (
    <main className="signal-grid min-h-screen overflow-x-clip bg-grid">
      <MarketingNav />
      <section className="relative mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-6 sm:pt-16 lg:pb-28">
        <div className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-accent-tertiary/15 blur-[120px]" />
        <div className="relative overflow-hidden rounded-[2.2rem] border border-white/15 bg-[linear-gradient(125deg,hsl(var(--surface)/0.93),hsl(var(--accent-secondary)/0.16)_48%,hsl(var(--status-failed)/0.1))] px-6 py-8 shadow-[0_28px_90px_hsl(var(--shadow)/0.46)] sm:px-10 sm:py-12">
          <div
            className="absolute -right-20 -top-24 h-80 w-80 rounded-full border border-accent-tertiary/25"
            aria-hidden="true"
          />
          <div
            className="absolute -right-6 top-11 grid h-40 w-40 place-items-center rounded-full border border-accent-primary/20 bg-accent-primary/[0.06] sm:h-52 sm:w-52"
            aria-hidden="true"
          >
            <span className="faq-orbit grid h-24 w-24 place-items-center rounded-[2rem] border border-white/15 bg-canvas/70 shadow-2xl sm:h-32 sm:w-32">
              <CircleHelp className="text-status-validating" size={42} />
            </span>
          </div>
          <div className="relative max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-status-validating/35 bg-status-validating/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-status-validating">
              <Sparkles size={14} /> MigrateOS field guide
            </p>
            <h1 className="mt-6 max-w-[12ch] font-display text-5xl font-semibold leading-[0.93] tracking-[-0.065em] sm:text-6xl">
              Clear answers for <span className="text-accent-primary">serious change.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-ink-muted sm:text-lg">
              A practical reference for importing repositories, reviewing AI-produced migration
              plans, and understanding the signals inside your workspace.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-ink-muted">
              {["Private workspaces", "Evidence retained", "Approval first"].map((item) => (
                <span
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-canvas/35 px-3 py-2"
                  key={item}
                >
                  <CheckCircle2 size={14} className="text-status-success" /> {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mt-10 grid gap-7 lg:grid-cols-[0.34fr_0.66fr]">
          <aside className="h-fit rounded-[1.8rem] border border-white/10 bg-surface/65 p-5 shadow-glass backdrop-blur-xl lg:sticky lg:top-28">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent-primary">
              Quick path
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold leading-tight">
              Built around a governed workflow.
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink-muted">
              New here? Start with how MigrateOS turns a repository into a reviewable change plan.
            </p>
            <Link
              href="/workflow"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-accent-primary transition hover:gap-3"
            >
              Explore the workflow <ArrowRight size={16} />
            </Link>
            <div className="mt-7 border-t border-white/10 pt-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
                Fast facts
              </p>
              <dl className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <dt className="text-ink-muted">Source</dt>
                  <dd className="font-semibold text-ink">GitHub URL</dd>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <dt className="text-ink-muted">Sign-in</dt>
                  <dd className="font-semibold text-ink">GitHub / Google</dd>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <dt className="text-ink-muted">Review</dt>
                  <dd className="font-semibold text-status-success">Always recorded</dd>
                </div>
              </dl>
            </div>
          </aside>

          <section className="space-y-3" aria-label="Frequently asked questions">
            {questions.map(({ number, question, answer }) => (
              <details
                key={question}
                className="faq-disclosure group overflow-hidden rounded-[1.55rem] border border-white/12 bg-surface/75 shadow-glass backdrop-blur-xl transition hover:border-accent-primary/35"
              >
                <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-5 marker:hidden sm:px-6 sm:py-6">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-accent-primary/20 bg-accent-primary/[0.09] font-mono text-[11px] font-bold text-accent-primary">
                    {number}
                  </span>
                  <span className="flex-1 font-display text-lg font-semibold leading-snug sm:text-xl">
                    {question}
                  </span>
                  <span className="faq-plus grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 text-lg text-ink-muted transition group-open:rotate-45 group-open:border-accent-primary/50 group-open:text-accent-primary">
                    +
                  </span>
                </summary>
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 group-open:grid-rows-[1fr]">
                  <div className="overflow-hidden">
                    <p className="mx-5 mb-5 border-t border-white/10 pt-5 text-sm leading-7 text-ink-muted sm:mx-6 sm:mb-6 sm:pt-6">
                      {answer}
                    </p>
                  </div>
                </div>
              </details>
            ))}
          </section>
        </div>

        <section className="relative mt-10 grid gap-4 md:grid-cols-2" aria-label="Product guides">
          <Link
            href="/workflow"
            className="group rounded-[1.7rem] border border-accent-primary/20 bg-[linear-gradient(135deg,hsl(var(--accent-primary)/0.13),hsl(var(--surface)/0.86)_54%)] p-6 shadow-glass transition hover:-translate-y-1 hover:border-accent-primary/55"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-primary/15 text-accent-primary">
              <Network size={22} />
            </span>
            <h2 className="mt-6 font-display text-2xl font-semibold">Follow the workflow</h2>
            <p className="mt-2 max-w-sm text-sm leading-7 text-ink-muted">
              See exactly how a repository moves from snapshot to a governed review.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-accent-primary">
              Explore process{" "}
              <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </span>
          </Link>
          <Link
            href="/security"
            className="group rounded-[1.7rem] border border-accent-tertiary/20 bg-[linear-gradient(135deg,hsl(var(--accent-tertiary)/0.12),hsl(var(--surface)/0.86)_54%)] p-6 shadow-glass transition hover:-translate-y-1 hover:border-accent-tertiary/55"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-tertiary/15 text-accent-tertiary">
              <ShieldCheck size={22} />
            </span>
            <h2 className="mt-6 font-display text-2xl font-semibold">Understand the guardrails</h2>
            <p className="mt-2 max-w-sm text-sm leading-7 text-ink-muted">
              Learn why approval, redaction, and evidence are first-class controls.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-accent-tertiary">
              View guardrails{" "}
              <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </span>
          </Link>
        </section>

        <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[1.8rem] border border-white/12 bg-canvas/50 p-6 shadow-glass sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-center gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-ink">
              <Github size={21} />
            </span>
            <div>
              <p className="font-display text-lg font-semibold">Ready to inspect a repository?</p>
              <p className="text-sm text-ink-muted">
                Bring a public GitHub URL. MigrateOS handles the evidence trail.
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-5 py-3 font-bold text-canvas transition hover:-translate-y-0.5 hover:brightness-110"
          >
            Analyze a repository <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}

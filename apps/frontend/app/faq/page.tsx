import Link from "next/link";
import { ArrowRight, CircleHelp } from "lucide-react";

import { MigrateOSMark } from "@/components/brand/migrateos-mark";

const questions = [
  {
    question: "What happens after I submit a repository URL?",
    answer:
      "MigrateOS creates a durable repository and migration-job record, captures repository intelligence, then produces a persisted migration plan and report. The job workspace exposes the artifacts and event history as they are recorded.",
  },
  {
    question: "Does MigrateOS execute changes automatically?",
    answer:
      "No. Planning is separated from execution. A plan requires an explicit approval record before the constrained execution stage can begin, and blocked integrations are shown honestly rather than being represented as completed work.",
  },
  {
    question: "Can I return to an analysis after a refresh?",
    answer:
      "Yes. Repository snapshots, plans, reports, artifacts, and event sequences are persisted. The dashboard and job pages read those durable records from the API instead of using demo data.",
  },
  {
    question: "How are live updates delivered?",
    answer:
      "The job workspace listens for persisted workflow events through WebSockets, while the API also supports replayable server-sent events. Refreshing a page does not discard historical activity.",
  },
  {
    question: "Why might the dashboard say live data is unavailable?",
    answer:
      "That state means the frontend reached the API but the API could not complete its storage-backed request. Check the Render service configuration, especially the Supabase PostgreSQL connection string and applied Alembic migrations.",
  },
];

export default function FaqPage() {
  return (
    <main className="signal-grid min-h-screen bg-grid">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" aria-label="MigrateOS home">
          <MigrateOSMark />
        </Link>
        <Link
          className="text-sm font-semibold text-ink-muted transition hover:text-accent-primary"
          href="/dashboard"
        >
          Open command center
        </Link>
      </header>
      <section className="mx-auto max-w-4xl px-6 pb-24 pt-16 sm:pt-24">
        <div className="rounded-[2rem] border border-accent-tertiary/25 bg-gradient-to-br from-accent-secondary/15 via-surface to-status-failed/10 p-8 shadow-glass sm:p-12">
          <CircleHelp className="text-status-validating" size={30} />
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-accent-tertiary">
            MigrateOS guide
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Questions, answered with the real workflow.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-muted">
            A practical reference for importing repositories, reviewing plans, and understanding
            live platform states.
          </p>
        </div>
        <section className="mt-8 space-y-3" aria-label="Frequently asked questions">
          {questions.map(({ question, answer }) => (
            <details
              key={question}
              className="group rounded-2xl border border-surface-muted bg-surface/75 p-5 shadow-glass"
            >
              <summary className="cursor-pointer list-none pr-8 font-display text-lg font-semibold marker:hidden">
                {question}
              </summary>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-ink-muted">{answer}</p>
            </details>
          ))}
        </section>
        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-2 rounded-xl bg-accent-primary px-5 py-3 font-bold text-canvas transition hover:brightness-110"
        >
          Analyze a repository <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}

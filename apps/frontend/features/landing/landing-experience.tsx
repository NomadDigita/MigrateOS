"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, GitPullRequest, ShieldCheck, Sparkles } from "lucide-react";

import { MigrateOSMark } from "@/components/brand/migrateos-mark";
import { GlassPanel } from "@/components/ui/glass-panel";
import { EcosystemStage } from "@/features/landing/ecosystem-stage";
import { ImportForm } from "@/features/repository-import/import-form";

const reveal = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export function LandingExperience() {
  return (
    <main className="signal-grid min-h-screen bg-grid">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" aria-label="MigrateOS home">
          <MigrateOSMark />
        </Link>
        <nav
          className="flex items-center gap-5 text-sm font-semibold text-ink-muted"
          aria-label="Primary navigation"
        >
          <Link className="transition hover:text-accent-primary" href="/faq">
            FAQ
          </Link>
          <Link className="transition hover:text-accent-primary" href="/dashboard">
            Open command center
          </Link>
        </nav>
      </header>
      <motion.section
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.1 }}
        className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pt-28"
      >
        <div>
          <motion.p
            variants={reveal}
            className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-primary"
          >
            Governed AI modernization
          </motion.p>
          <motion.h1
            variants={reveal}
            className="mt-7 max-w-3xl font-display text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl"
          >
            Legacy software, <span className="text-accent-primary">brought forward</span> with
            evidence.
          </motion.h1>
          <motion.p variants={reveal} className="mt-7 max-w-xl text-lg leading-8 text-ink-muted">
            Connect a public repository. MigrateOS persists the source snapshot, evidence-backed
            plan, report artifacts, and replayable agent activity before any approval-gated
            execution.
          </motion.p>
          <motion.div variants={reveal}>
            <ImportForm />
          </motion.div>
        </div>
        <motion.div variants={reveal}>
          <EcosystemStage />
        </motion.div>
      </motion.section>
      <section className="mx-auto grid max-w-7xl gap-4 px-6 pb-24 md:grid-cols-3">
        {[
          [
            ShieldCheck,
            "Understand",
            "Inventory frameworks, dependencies, and architecture with source-linked evidence.",
          ],
          [
            CheckCircle2,
            "Approve",
            "Review a persisted, staged plan with risk, scope, validation, and rollback controls.",
          ],
          [
            GitPullRequest,
            "Deliver",
            "Keep constrained agent outcomes and report artifacts visible to reviewers.",
          ],
        ].map(([Icon, title, body]) => (
          <GlassPanel key={title as string} hoverable>
            <div className="relative">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-secondary/12 text-accent-secondary">
                {<Icon size={19} />}
              </span>
              <h2 className="mt-6 font-display text-xl font-semibold">{title as string}</h2>
              <p className="mt-3 text-sm leading-6 text-ink-muted">{body as string}</p>
            </div>
          </GlassPanel>
        ))}
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-24" aria-labelledby="ecosystem-heading">
        <div className="rounded-[2rem] border border-surface-muted bg-gradient-to-br from-surface via-surface to-accent-secondary/10 p-6 shadow-glass sm:p-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-status-validating">
                <Sparkles size={15} /> The MigrateOS ecosystem
              </p>
              <h2
                id="ecosystem-heading"
                className="mt-4 font-display text-3xl font-semibold sm:text-4xl"
              >
                One evidence trail from source to review.
              </h2>
            </div>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 font-semibold text-accent-primary transition hover:text-status-validating"
            >
              Explore the workflow <ArrowRight size={17} />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {[
              ["01", "Capture", "Snapshot source, dependencies, and architecture."],
              ["02", "Reason", "Turn findings into a staged, reviewable plan."],
              ["03", "Govern", "Require an explicit approval before execution."],
              ["04", "Remember", "Keep reports, artifacts, and events replayable."],
            ].map(([number, title, body]) => (
              <div
                key={number}
                className="rounded-2xl border border-surface-muted/80 bg-canvas/35 p-5"
              >
                <span className="font-mono text-xs font-bold text-accent-tertiary">{number}</span>
                <h3 className="mt-6 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="flex flex-col gap-5 rounded-[2rem] border border-status-validating/25 bg-gradient-to-r from-status-validating/12 via-accent-secondary/10 to-status-failed/10 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-status-validating">
              Need a quick answer?
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold">
              Understand the safeguards before you start.
            </h2>
          </div>
          <Link
            href="/faq"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-ink/20 bg-surface/70 px-5 py-3 font-bold text-ink transition hover:border-accent-primary hover:text-accent-primary"
          >
            Read the FAQ <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}

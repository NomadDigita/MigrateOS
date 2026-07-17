"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, GitPullRequest, ShieldCheck } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";
import { ImportForm } from "@/features/repository-import/import-form";

const reveal = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export function LandingExperience() {
  return (
    <main className="signal-grid min-h-screen bg-grid">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-primary font-display font-bold text-canvas">
            M
          </span>
          <span className="font-display text-lg font-bold">MigrateOS</span>
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-ink-muted transition-colors hover:text-accent-primary"
        >
          Open command center
        </Link>
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
          <GlassPanel className="p-6">
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-muted">
                Governed workflow
              </p>
              <ol className="mt-6 space-y-4">
                {[
                  "Persist an immutable source snapshot",
                  "Generate an evidence-backed migration plan",
                  "Record explicit approval before execution",
                  "Retain artifacts, reports, and replayable events",
                ].map((step, index) => (
                  <li
                    key={step}
                    className="flex gap-4 rounded-xl border border-surface-muted/70 bg-elevated/55 p-4"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-primary/10 text-sm font-bold text-accent-primary">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-6 text-ink-muted">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </GlassPanel>
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
    </main>
  );
}

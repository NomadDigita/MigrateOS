"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, GitPullRequest, ShieldCheck } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";
import { StatusDot } from "@/components/ui/status";
import { ImportForm } from "@/features/repository-import/import-form";

const reveal = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export function LandingExperience() {
  return (
    <main className="signal-grid min-h-screen bg-grid">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6"><Link href="/" className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-primary text-canvas font-display font-bold">M</span><span className="font-display text-lg font-bold">MigrateOS</span></Link><Link href="/dashboard" className="text-sm font-semibold text-ink-muted transition-colors hover:text-accent-primary">Open command center</Link></header>
      <motion.section initial="hidden" animate="visible" transition={{ staggerChildren: 0.1 }} className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pt-28">
        <div><motion.div variants={reveal}><StatusDot status="analyzing" label="Governed AI modernization" /></motion.div><motion.h1 variants={reveal} className="mt-7 max-w-3xl font-display text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl">Legacy software, <span className="text-accent-primary">brought forward</span> with evidence.</motion.h1><motion.p variants={reveal} className="mt-7 max-w-xl text-lg leading-8 text-ink-muted">Connect a repository. MigrateOS maps the risk, assembles an approval-ready plan, coordinates specialist agents, and delivers a validated pull request.</motion.p><motion.div variants={reveal}><ImportForm /></motion.div></div>
        <motion.div variants={reveal}><GlassPanel className="p-6" hoverable><div className="relative flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-muted">Migration signal</p><h2 className="mt-2 font-display text-xl font-semibold">node-service / main</h2></div><StatusDot status="migrating" label="active" /></div><div className="relative mt-8 space-y-4">{[["Repository discovery", "success"], ["Risk assessment", "success"], ["Plan review", "planning"], ["Sandbox validation", "idle"]].map(([label, status]) => <div key={label} className="flex items-center justify-between rounded-xl border border-surface-muted/70 bg-elevated/55 p-4"><span className="text-sm font-medium">{label}</span><StatusDot status={status as "success" | "planning" | "idle"} /></div>)}</div><div className="relative mt-6 rounded-xl bg-accent-primary/10 p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-primary">Risk posture</p><p className="mt-2 text-sm leading-6 text-ink-muted">12 evidence-backed changes · 4 manual review items · rollback path recorded</p></div></GlassPanel></motion.div>
      </motion.section>
      <section id="workflow" className="mx-auto grid max-w-7xl gap-4 px-6 pb-24 md:grid-cols-3">{[[ShieldCheck, "Understand", "Inventory frameworks, dependencies, and breaking changes with source-linked evidence."], [CheckCircle2, "Approve", "Review a staged plan with risk, scope, validation, and rollback controls."], [GitPullRequest, "Deliver", "Coordinate constrained agents into a validated, reviewable pull request."]].map(([Icon, title, body]) => <GlassPanel key={title as string} hoverable><div className="relative"><span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-secondary/12 text-accent-secondary">{<Icon size={19} />}</span><h2 className="mt-6 font-display text-xl font-semibold">{title as string}</h2><p className="mt-3 text-sm leading-6 text-ink-muted">{body as string}</p></div></GlassPanel>)}</section>
    </main>
  );
}

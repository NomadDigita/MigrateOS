import { GitBranch, Radar, ShieldCheck, Sparkles } from "lucide-react";

import { Sidebar } from "@/components/navigation/sidebar";
import { TopNav } from "@/components/navigation/top-nav";
import { LiveDashboard } from "@/features/dashboard/live-dashboard";

const signals = [
  { label: "Source pinning", detail: "Immutable repository snapshots", icon: GitBranch },
  { label: "Architecture radar", detail: "Languages, dependencies, and structure", icon: Radar },
  { label: "Evidence guard", detail: "Every next step stays reviewable", icon: ShieldCheck },
];

export default function RepositoryIntelligencePage() {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <TopNav />
        <main className="p-4 sm:p-6 lg:p-8">
          <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_88%_15%,hsl(var(--accent-secondary)/0.28),transparent_28%),radial-gradient(circle_at_20%_90%,hsl(var(--accent-primary)/0.13),transparent_34%),hsl(var(--surface)/0.58)] px-5 py-7 shadow-glass sm:px-8 sm:py-9">
            <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(hsl(var(--grid)/0.13)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--grid)/0.13)_1px,transparent_1px)] [background-size:34px_34px]" />
            <div className="relative grid gap-7 xl:grid-cols-[1fr_auto] xl:items-end">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-accent-primary/30 bg-accent-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-accent-primary">
                  <Radar size={14} aria-hidden="true" /> Repository intelligence
                </div>
                <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                  See the codebase <span className="text-accent-primary">before</span> you change
                  it.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-ink-muted sm:text-base">
                  A cinematic control surface for the source facts that make a modernization plan
                  defensible: branches, technology signals, snapshots, and the evidence behind each
                  recommendation.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-canvas/35 p-3 backdrop-blur-xl">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-status-success/15 text-status-success">
                  <Sparkles size={18} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">
                    Live collection
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">Private source intelligence</p>
                </div>
              </div>
            </div>

            <div className="relative mt-7 grid gap-3 sm:grid-cols-3">
              {signals.map(({ label, detail, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl"
                >
                  <Icon size={17} className="text-accent-primary" aria-hidden="true" />
                  <p className="mt-4 text-sm font-bold text-ink">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-ink-muted">{detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <LiveDashboard repositoryFocus />
          </section>
        </main>
      </div>
    </div>
  );
}

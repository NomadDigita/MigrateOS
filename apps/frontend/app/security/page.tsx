import Link from "next/link";
import { ArrowRight, Eye, LockKeyhole, ShieldCheck, TerminalSquare } from "lucide-react";

import { MarketingNav } from "@/components/navigation/marketing-nav";

const safeguards = [
  [
    LockKeyhole,
    "Secrets stay server-side",
    "Credentials are deployment secrets, excluded from prompts, artifacts, reports, and browser state.",
  ],
  [
    ShieldCheck,
    "Approval is a hard boundary",
    "A migration plan must be explicitly approved before constrained execution can begin.",
  ],
  [
    TerminalSquare,
    "Commands are policy controlled",
    "Validation adapters select allow-listed commands; repository content does not decide what the platform runs.",
  ],
  [
    Eye,
    "Reports remain accountable",
    "Artifacts, agent outcomes, and historical events are durable and can be replayed after refresh.",
  ],
] as const;

export default function SecurityPage() {
  return (
    <main className="signal-grid min-h-screen bg-grid">
      <MarketingNav />
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-14 sm:pt-24">
        <div className="rounded-[2rem] border border-accent-tertiary/25 bg-gradient-to-br from-accent-secondary/16 via-surface to-status-failed/12 p-8 shadow-glass sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-tertiary">
            Guardrails, by design
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-6xl">
            Modernization without a black box.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-muted">
            MigrateOS is not a free-running coding agent. It is a control plane that preserves
            authority, evidence, and reviewability around AI capabilities.
          </p>
        </div>
        <section className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="MigrateOS safeguards">
          {safeguards.map(([Icon, title, body]) => (
            <article
              key={title}
              className="rounded-2xl border border-surface-muted bg-surface/70 p-6 shadow-glass"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-tertiary/12 text-accent-tertiary">
                <Icon size={20} />
              </span>
              <h2 className="mt-6 font-display text-2xl font-semibold">{title}</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-ink-muted">{body}</p>
            </article>
          ))}
        </section>
        <Link
          href="/faq"
          className="mt-10 inline-flex items-center gap-2 font-bold text-accent-primary hover:text-status-validating"
        >
          Read the practical FAQ <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}

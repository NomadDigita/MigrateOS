import Link from "next/link";

import { MigrateOSMark } from "@/components/brand/migrateos-mark";

export function MarketingNav() {
  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-6">
      <Link href="/" aria-label="MigrateOS home" className="rounded-xl">
        <MigrateOSMark />
      </Link>
      <nav
        className="hidden items-center gap-6 text-sm font-semibold text-ink-muted md:flex"
        aria-label="Primary navigation"
      >
        <Link className="transition hover:text-accent-primary" href="/workflow">
          Workflow
        </Link>
        <Link className="transition hover:text-accent-primary" href="/security">
          Guardrails
        </Link>
        <Link className="transition hover:text-accent-primary" href="/faq">
          FAQ
        </Link>
      </nav>
      <Link
        className="inline-flex shrink-0 items-center rounded-xl border border-accent-primary/40 bg-accent-primary/10 px-4 py-2.5 text-sm font-bold text-ink transition hover:border-accent-primary hover:bg-accent-primary hover:text-canvas"
        href="/dashboard"
      >
        Open workspace
      </Link>
    </header>
  );
}

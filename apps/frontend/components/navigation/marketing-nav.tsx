"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { MigrateOSMark } from "@/components/brand/migrateos-mark";

export function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-canvas/45 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-4">
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
        <div className="flex items-center gap-2">
          <Link
            className="hidden shrink-0 items-center rounded-xl border border-accent-primary/40 bg-accent-primary/10 px-4 py-2.5 text-sm font-bold text-ink transition hover:border-accent-primary hover:bg-accent-primary hover:text-canvas sm:inline-flex"
            href="/dashboard"
          >
            Open workspace
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/[0.06] text-ink md:hidden"
            aria-expanded={open}
            aria-controls="marketing-mobile-menu"
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open ? (
        <nav
          id="marketing-mobile-menu"
          className="liquid-glass mx-4 mb-4 grid gap-1 rounded-2xl p-3 md:hidden"
          aria-label="Mobile navigation"
        >
          {[
            ["/workflow", "Workflow"],
            ["/security", "Guardrails"],
            ["/faq", "FAQ"],
            ["/dashboard", "Open workspace"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-ink-muted transition hover:bg-white/[0.07] hover:text-ink"
            >
              {label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

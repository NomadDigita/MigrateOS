"use client";

import Link from "next/link";
import { CheckCircle2, LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { MigrateOSMark } from "@/components/brand/migrateos-mark";
import { useTheme } from "@/components/theme-provider";

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const provider = user?.app_metadata.provider === "github" ? "GitHub" : "Google";
  const name = String(
    user?.user_metadata.full_name || user?.user_metadata.name || user?.email || "",
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-canvas/90 shadow-[0_12px_44px_hsl(var(--shadow)/0.22)] backdrop-blur-3xl supports-[backdrop-filter]:bg-canvas/72">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-5 sm:px-6 sm:py-4">
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
          {user ? (
            <button
              type="button"
              onClick={() => void signOut()}
              title={`Connected with ${provider}. Select to sign out.`}
              className="hidden max-w-52 items-center gap-2 rounded-xl border border-status-success/30 bg-status-success/10 px-3 py-2 text-xs font-bold text-status-success transition hover:bg-status-success/20 sm:inline-flex"
            >
              <CheckCircle2 size={14} aria-hidden="true" />
              <span className="truncate">{name || `Connected with ${provider}`}</span>
              <span className="sr-only">Sign out</span>
            </button>
          ) : null}
          <Link
            className="hidden shrink-0 items-center rounded-xl border border-accent-primary/40 bg-accent-primary/10 px-4 py-2.5 text-sm font-bold text-ink transition hover:border-accent-primary hover:bg-accent-primary hover:text-canvas sm:inline-flex"
            href="/dashboard"
          >
            Open workspace
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/[0.06] text-ink transition hover:border-accent-primary/40 hover:text-accent-primary"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
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
          {user ? (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="mt-1 flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold text-status-success transition hover:bg-status-success/10"
            >
              <LogOut size={16} /> Connected with {provider} - sign out
            </button>
          ) : null}
        </nav>
      ) : null}
    </header>
  );
}

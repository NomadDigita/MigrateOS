"use client";

import Link from "next/link";
import { Home, Menu, Moon, ShieldCheck, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { MigrateOSMark } from "@/components/brand/migrateos-mark";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/components/auth/auth-provider";

export function TopNav() {
  const { theme, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const displayName = user?.user_metadata.full_name || user?.user_metadata.name || user?.email;

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <header className="sticky top-0 z-50 isolate flex min-h-[4.75rem] items-center justify-between gap-3 border-b border-surface-muted/80 bg-canvas/80 px-4 py-3 shadow-[0_12px_36px_hsl(var(--shadow)/0.22)] backdrop-blur-2xl sm:px-5 lg:px-8">
      <Link href="/" className="lg:hidden" aria-label="MigrateOS home">
        <MigrateOSMark label={false} className="sm:hidden" />
        <MigrateOSMark className="hidden gap-2 sm:inline-flex" />
      </Link>
      <div className="hidden lg:block">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
          <ShieldCheck size={13} className="text-accent-primary" /> Workspace
        </p>
        <p className="mt-1 font-display font-semibold tracking-tight">
          Modernization command center
        </p>
      </div>
      <div className="flex items-center gap-2">
        {displayName ? (
          <button
            type="button"
            onClick={() => void signOut()}
            className="hidden max-w-44 truncate rounded-xl border border-accent-primary/20 bg-accent-primary/10 px-3 py-2 text-xs font-bold text-accent-primary transition hover:bg-accent-primary/20 sm:block"
            title="Sign out"
          >
            {String(displayName)}
          </button>
        ) : null}
        <Link
          href="/"
          className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-ink-muted transition hover:text-accent-primary sm:flex lg:hidden"
        >
          <Home size={15} /> Home
        </Link>
        <button
          type="button"
          onClick={() => setDrawerOpen((value) => !value)}
          className="grid h-9 w-9 place-items-center rounded-xl border border-surface-muted bg-surface text-ink-muted transition-colors hover:text-accent-primary lg:hidden"
          aria-label={drawerOpen ? "Close workspace navigation" : "Open workspace navigation"}
          aria-expanded={drawerOpen}
        >
          {drawerOpen ? <X size={17} /> : <Menu size={17} />}
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          className="grid h-9 w-9 place-items-center rounded-xl border border-surface-muted bg-surface text-ink-muted transition-colors hover:text-accent-primary"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
      {drawerOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-canvas/90 backdrop-blur-xl lg:hidden"
            aria-label="Close workspace navigation"
            onClick={() => setDrawerOpen(false)}
          />
          <nav
            className="fixed inset-x-0 bottom-0 top-[4.75rem] z-50 overflow-y-auto border-t border-white/10 bg-canvas/98 px-4 py-6 shadow-[0_-18px_80px_hsl(var(--shadow)/0.55)] lg:hidden"
            aria-label="Workspace navigation"
          >
            <div className="liquid-glass mx-auto max-w-md rounded-[1.75rem] border border-white/15 bg-surface/95 p-3 shadow-2xl">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-accent-primary"
              >
                <Home size={17} /> Back to home
              </Link>
              {[
                ["/dashboard", "Command center"],
                ["/repository-intelligence", "Repository intelligence"],
                ["/workflow", "How it works"],
                ["/faq", "Guides & FAQ"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-ink-muted transition hover:bg-white/[0.06] hover:text-ink"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </>
      ) : null}
    </header>
  );
}

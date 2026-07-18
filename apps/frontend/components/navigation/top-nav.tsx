"use client";

import Link from "next/link";
import { Moon, ShieldCheck, Sun } from "lucide-react";

import { MigrateOSMark } from "@/components/brand/migrateos-mark";
import { useTheme } from "@/components/theme-provider";

export function TopNav() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="flex items-center justify-between border-b border-surface-muted/80 bg-canvas/45 px-5 py-4 backdrop-blur-xl lg:px-8">
      <Link href="/" className="lg:hidden" aria-label="MigrateOS home">
        <MigrateOSMark className="gap-2" />
      </Link>
      <div className="hidden lg:block">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
          <ShieldCheck size={13} className="text-accent-primary" /> Workspace
        </p>
        <p className="mt-1 font-display font-semibold tracking-tight">
          Modernization command center
        </p>
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        className="grid h-9 w-9 place-items-center rounded-xl border border-surface-muted bg-surface text-ink-muted transition-colors hover:text-accent-primary"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      >
        {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    </header>
  );
}

"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";

export function TopNav() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="flex items-center justify-between border-b border-surface-muted px-5 py-4 lg:px-8">
      <Link href="/" className="font-display text-lg font-bold lg:hidden">MigrateOS</Link>
      <div className="hidden lg:block"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">Workspace</p><p className="mt-1 font-display font-semibold">Modernization command center</p></div>
      <button type="button" onClick={toggleTheme} className="grid h-9 w-9 place-items-center rounded-xl border border-surface-muted bg-surface text-ink-muted transition-colors hover:text-accent-primary" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
        {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    </header>
  );
}

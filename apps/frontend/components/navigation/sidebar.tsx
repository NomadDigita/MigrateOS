"use client";

import Link from "next/link";
import { CircleHelp, House, LayoutDashboard, ScanSearch, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";

import { MigrateOSMark } from "@/components/brand/migrateos-mark";
import { cn } from "@/lib/cn";

const items = [
  { href: "/dashboard", label: "Command center", icon: LayoutDashboard },
  { href: "/repository-intelligence", label: "Repository intelligence", icon: ScanSearch },
  { href: "/workflow", label: "How it works", icon: ShieldCheck },
  { href: "/faq", label: "Guides & FAQ", icon: CircleHelp },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-surface-muted/80 bg-surface/45 p-5 backdrop-blur-2xl lg:flex lg:flex-col">
      <Link
        href="/"
        className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
      >
        <MigrateOSMark />
      </Link>
      <Link
        href="/"
        className="mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 text-xs font-bold uppercase tracking-[0.13em] text-ink-muted transition hover:border-accent-primary/40 hover:text-accent-primary"
      >
        <House size={15} /> Back to home
      </Link>
      <div className="mt-10 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
        Navigate
      </div>
      <nav className="mt-3 space-y-1.5" aria-label="Primary navigation">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
              pathname === href
                ? "bg-gradient-to-r from-accent-primary/15 to-accent-secondary/10 text-ink shadow-[inset_0_0_0_1px_hsl(var(--accent-primary)/0.16)]"
                : "text-ink-muted hover:bg-elevated/80 hover:text-ink",
            )}
          >
            <Icon
              className={
                pathname === href ? "text-accent-primary" : "group-hover:text-accent-primary"
              }
              size={17}
              aria-hidden="true"
            />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto overflow-hidden rounded-2xl border border-accent-secondary/20 bg-gradient-to-br from-accent-secondary/10 via-surface to-status-validating/10 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent-tertiary">
          Evidence first
        </p>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          Every modernization decision remains reviewable and replayable.
        </p>
      </div>
    </aside>
  );
}

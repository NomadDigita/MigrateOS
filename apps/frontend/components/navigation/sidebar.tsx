import Link from "next/link";
import { Activity, Bot, LayoutDashboard, ScanSearch, Settings } from "lucide-react";

import { cn } from "@/lib/cn";

const items = [
  { href: "/dashboard", label: "Command center", icon: LayoutDashboard },
  { href: "/repository-intelligence", label: "Repository intelligence", icon: ScanSearch },
  { href: "/dashboard#agents", label: "Agent activity", icon: Bot },
  { href: "/dashboard#stream", label: "Live stream", icon: Activity },
  { href: "/dashboard#settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-surface-muted bg-surface/40 p-5 lg:block">
      <Link href="/" className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-primary text-canvas font-display font-bold">M</span><span className="font-display text-lg font-bold tracking-tight">MigrateOS</span></Link>
      <nav className="mt-12 space-y-2" aria-label="Primary navigation">
        {items.map(({ href, label, icon: Icon }, index) => <Link key={href} href={href} className={cn("flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors", index === 0 ? "bg-accent-primary/12 text-accent-primary" : "text-ink-muted hover:bg-elevated hover:text-ink")}><Icon size={17} aria-hidden="true" />{label}</Link>)}
      </nav>
    </aside>
  );
}

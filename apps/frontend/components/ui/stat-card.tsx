import type { LucideIcon } from "lucide-react";

import { AnimatedCounter } from "./animated-counter";
import { GlassPanel } from "./glass-panel";
import { StatusDot, type SignalStatus } from "./status";

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  status: SignalStatus;
  icon: LucideIcon;
  detail: string;
}

export function StatCard({ label, value, suffix, status, icon: Icon, detail }: Readonly<StatCardProps>) {
  return (
    <GlassPanel hoverable className="p-4">
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">{label}</p>
          <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
            <AnimatedCounter value={value} suffix={suffix} />
          </p>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-primary/10 text-accent-primary">
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>
      <div className="relative mt-5 flex items-center justify-between gap-3">
        <StatusDot status={status} />
        <span className="text-xs text-ink-muted">{detail}</span>
      </div>
    </GlassPanel>
  );
}

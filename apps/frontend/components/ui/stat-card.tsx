import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

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
  index?: number;
}

export function StatCard({
  label,
  value,
  suffix,
  status,
  icon: Icon,
  detail,
  index = 0,
}: Readonly<StatCardProps>) {
  return (
    <GlassPanel
      hoverable
      className="group min-h-[10.75rem] p-5 sm:min-h-[11.5rem]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted sm:text-xs">
              {label}
            </p>
            <p className="mt-4 font-display text-5xl font-semibold leading-none tracking-[-0.07em] text-ink sm:text-6xl">
              <AnimatedCounter value={value} suffix={suffix} />
            </p>
          </div>
          <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-accent-primary/30 bg-accent-primary/[0.12] text-accent-primary shadow-[0_0_30px_hsl(var(--accent-primary)/0.22)] before:absolute before:inset-1 before:rounded-xl before:border before:border-white/20 before:bg-white/[0.04] after:absolute after:-inset-4 after:animate-pulseSignal after:rounded-full after:border after:border-accent-primary/30">
            <Icon className="relative z-10" size={21} strokeWidth={1.8} aria-hidden="true" />
          </span>
        </div>
        <div className="mt-7 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-3.5">
          <StatusDot status={status} />
          <span className="flex min-w-0 items-center gap-1 truncate text-xs font-medium text-ink-muted">
            {detail}{" "}
            <ArrowUpRight size={13} className="text-accent-primary/70" aria-hidden="true" />
          </span>
        </div>
      </div>
    </GlassPanel>
  );
}

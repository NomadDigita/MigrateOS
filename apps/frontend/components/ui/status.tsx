import { cn } from "@/lib/cn";

export type SignalStatus =
  | "idle"
  | "analyzing"
  | "planning"
  | "migrating"
  | "validating"
  | "success"
  | "warning"
  | "failed";

const statusColor: Record<SignalStatus, string> = {
  idle: "bg-status-idle",
  analyzing: "bg-status-analyzing",
  planning: "bg-status-planning",
  migrating: "bg-status-migrating",
  validating: "bg-status-validating",
  success: "bg-status-success",
  warning: "bg-status-warning",
  failed: "bg-status-failed",
};

export function StatusDot({ status, label }: Readonly<{ status: SignalStatus; label?: string }>) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
      <span className={cn("h-2 w-2 rounded-full", statusColor[status])} aria-hidden="true" />
      {label ?? status}
    </span>
  );
}

export function RiskBadge({ level }: Readonly<{ level: "low" | "moderate" | "high" }>) {
  const status: Record<typeof level, SignalStatus> = { low: "success", moderate: "warning", high: "failed" };
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-surface-muted bg-elevated/80 px-3 py-1 text-xs font-semibold text-ink">
      <span className={cn("h-1.5 w-1.5 rounded-full", statusColor[status[level]])} aria-hidden="true" />
      {level} risk
    </span>
  );
}

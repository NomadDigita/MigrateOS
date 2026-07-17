import { cn } from "@/lib/cn";

export function Skeleton({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-surface-muted/70", className)} aria-busy="true">
      <span className="absolute inset-y-0 -left-full w-2/3 bg-gradient-to-r from-transparent via-ink/10 to-transparent animate-shimmer" />
    </div>
  );
}

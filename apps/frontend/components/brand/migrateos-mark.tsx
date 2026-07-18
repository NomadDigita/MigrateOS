import { useId } from "react";

import { cn } from "@/lib/cn";

export function MigrateOSMark({
  className,
  label = true,
}: Readonly<{ className?: string; label?: boolean }>) {
  const gradientId = useId();
  const glowId = useId();

  return (
    <span className={cn("group inline-flex items-center gap-3", className)}>
      <svg
        aria-hidden="true"
        className="h-10 w-10 shrink-0 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105"
        fill="none"
        viewBox="0 0 48 48"
      >
        <defs>
          <linearGradient id={gradientId} x1="7" x2="42" y1="8" y2="40">
            <stop stopColor="#A78BFA" />
            <stop offset="0.42" stopColor="#F9C74F" />
            <stop offset="0.72" stopColor="#FB7185" />
            <stop offset="1" stopColor="#F0ABFC" />
          </linearGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M10 31.5 18.2 15 27 34 37.5 12.5"
          stroke={`url(#${gradientId})`}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        <circle cx="10" cy="31.5" fill="#F0ABFC" r="4" />
        <circle cx="18.2" cy="15" fill="#F9C74F" r="4" />
        <circle cx="27" cy="34" fill="#FB7185" r="4" />
        <circle cx="37.5" cy="12.5" fill="white" filter={`url(#${glowId})`} r="4.5" />
      </svg>
      {label ? (
        <span className="font-display text-lg font-bold tracking-[-0.06em] text-ink">
          Migrate
          <span className="bg-gradient-to-r from-accent-secondary via-status-validating to-accent-tertiary bg-clip-text text-transparent">
            OS
          </span>
        </span>
      ) : null}
    </span>
  );
}

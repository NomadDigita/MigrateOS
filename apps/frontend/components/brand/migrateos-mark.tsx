import { cn } from "@/lib/cn";

export function MigrateOSMark({
  className,
  label = true,
}: Readonly<{ className?: string; label?: boolean }>) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <svg aria-hidden="true" className="h-10 w-10 shrink-0" fill="none" viewBox="0 0 48 48">
        <defs>
          <linearGradient id="migrateos-signal" x1="7" x2="42" y1="8" y2="40">
            <stop stopColor="#A78BFA" />
            <stop offset="0.42" stopColor="#F9C74F" />
            <stop offset="0.72" stopColor="#FB7185" />
            <stop offset="1" stopColor="#F0ABFC" />
          </linearGradient>
          <filter id="migrateos-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M10 31.5 18.2 15 27 34 37.5 12.5"
          stroke="url(#migrateos-signal)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        <circle cx="10" cy="31.5" fill="#F0ABFC" r="4" />
        <circle cx="18.2" cy="15" fill="#F9C74F" r="4" />
        <circle cx="27" cy="34" fill="#FB7185" r="4" />
        <circle cx="37.5" cy="12.5" fill="white" filter="url(#migrateos-glow)" r="4.5" />
      </svg>
      {label ? (
        <span className="font-display text-lg font-bold tracking-tight text-ink">
          Migrate<span className="text-accent-tertiary">OS</span>
        </span>
      ) : null}
    </span>
  );
}

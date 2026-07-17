"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";

import { GlassPanel } from "./glass-panel";

export interface LogLine {
  timestamp: string;
  level: "info" | "success" | "warning" | "error";
  message: string;
}

const levelColor: Record<LogLine["level"], string> = {
  info: "text-status-analyzing",
  success: "text-status-success",
  warning: "text-status-warning",
  error: "text-status-failed",
};

function highlight(message: string): React.ReactNode {
  const segments = message.split(
    /(\+\+\+|---|[\w./-]+\.(?:ts|tsx|py|json|yaml)|\b(?:error|failed)\b)/gi,
  );
  return segments.map((segment, index) => {
    if (/^\+\+\+$/.test(segment))
      return (
        <span key={index} className="text-status-success">
          {segment}
        </span>
      );
    if (/^---$/.test(segment))
      return (
        <span key={index} className="text-status-failed">
          {segment}
        </span>
      );
    if (/\.(ts|tsx|py|json|yaml)$/i.test(segment))
      return (
        <span key={index} className="text-accent-primary">
          {segment}
        </span>
      );
    if (/^(error|failed)$/i.test(segment))
      return (
        <span key={index} className="text-status-failed">
          {segment}
        </span>
      );
    return <span key={index}>{segment}</span>;
  });
}

export function StreamingLogPanel({
  lines,
  className,
}: Readonly<{ lines: LogLine[]; className?: string }>) {
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  return (
    <GlassPanel className={cn("p-0", className)}>
      <div className="relative flex items-center justify-between border-b border-surface-muted px-5 py-4">
        <div>
          <p className="font-display text-sm font-semibold">Live execution stream</p>
          <p className="mt-1 text-xs text-ink-muted">Redacted agent events · reconnect-safe</p>
        </div>
        <span
          className="h-2 w-2 animate-pulseSignal rounded-full bg-status-success"
          aria-label="Live"
        />
      </div>
      <div
        ref={logRef}
        className="relative h-64 overflow-y-auto px-5 py-4 font-mono text-xs leading-6"
        aria-live="polite"
      >
        {lines.map((line, index) => (
          <p
            key={`${line.timestamp}-${index}`}
            className="grid grid-cols-[5.5rem_0.8rem_1fr] gap-2 text-ink-muted"
          >
            <time>{line.timestamp}</time>
            <span
              className={cn("mt-2 h-1.5 w-1.5 rounded-full", levelColor[line.level])}
              aria-hidden="true"
            />
            <span>{highlight(line.message)}</span>
          </p>
        ))}
      </div>
    </GlassPanel>
  );
}

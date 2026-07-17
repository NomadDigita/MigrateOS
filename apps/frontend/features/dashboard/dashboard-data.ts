import type { LogLine } from "@/components/ui/streaming-log-panel";
import type { SignalStatus } from "@/components/ui/status";

export const agents: Array<{ name: string; status: SignalStatus; reasoning: string }> = [
  { name: "Repository Discovery", status: "success", reasoning: "Mapped 1,248 files and detected the active service boundaries." },
  { name: "Dependency Analysis", status: "success", reasoning: "Flagged 12 stale packages with lockfile evidence and upgrade paths." },
  { name: "Migration Planner", status: "planning", reasoning: "Sequencing changes around the project’s public API contract." },
  { name: "Validation Agent", status: "idle", reasoning: "Waiting for an approved plan before allocating a sandbox runner." },
];

export const executionLog: LogLine[] = [
  { timestamp: "10:42:01", level: "info", message: "repository snapshot pinned at 65a2e9b" },
  { timestamp: "10:42:04", level: "success", message: "+++ package.json dependency manifest normalized" },
  { timestamp: "10:42:08", level: "info", message: "src/server/router.tsx linked to migration scope" },
  { timestamp: "10:42:11", level: "warning", message: "legacy middleware pattern needs plan review" },
];

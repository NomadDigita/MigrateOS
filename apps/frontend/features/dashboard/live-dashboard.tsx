"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, Database, FolderGit2 } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { getPlatformOverview } from "@/lib/platform-api";

export function LiveDashboard() {
  const query = useQuery({ queryKey: ["platform-overview"], queryFn: getPlatformOverview, refetchInterval: 15_000 });
  if (query.isLoading) return <div className="grid gap-4 sm:grid-cols-3"><Skeleton className="h-40" /><Skeleton className="h-40" /><Skeleton className="h-40" /></div>;
  if (query.isError) return <GlassPanel><div className="relative"><h2 className="font-display text-xl font-semibold">Live data unavailable</h2><p className="mt-2 text-sm text-ink-muted">{query.error.message}</p></div></GlassPanel>;
  const data = query.data;
  return <section className="space-y-6"><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Projects" value={data.metrics.project_count} status="success" icon={FolderGit2} detail="Supabase" /><StatCard label="Repositories" value={data.metrics.repository_count} status="analyzing" icon={Database} detail="Tracked" /><StatCard label="Plans" value={data.metrics.plan_count} status="planning" icon={Activity} detail="Approval workflow" /></div><GlassPanel><div className="relative"><h2 className="font-display text-xl font-semibold">Live activity</h2>{data.events.length === 0 ? <p className="mt-4 text-sm text-ink-muted">No events yet. Import a repository to begin analysis.</p> : <ol className="mt-4 space-y-3 font-mono text-xs text-ink-muted">{data.events.slice(0, 12).map((event) => <li key={event.id}><span className="text-status-success">●</span> {event.event_type}</li>)}</ol>}</div></GlassPanel></section>;
}

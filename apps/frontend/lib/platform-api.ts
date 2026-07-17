import { publicConfig } from "./config";

export interface PlatformOverview { projects: Array<{ id: string; name: string }>; repositories: Array<{ id: string; external_id: string; provider: string }>; plans: Array<{ id: string; status: string; risk_score: number }>; events: Array<{ id: string; event_type: string; payload: Record<string, unknown>; created_at: string }>; metrics: { project_count: number; repository_count: number; plan_count: number }; }

export async function getPlatformOverview(): Promise<PlatformOverview> {
  const response = await fetch(`${publicConfig.apiBaseUrl}/platform/overview`);
  if (!response.ok) throw new Error("Live platform data is unavailable.");
  return response.json() as Promise<PlatformOverview>;
}

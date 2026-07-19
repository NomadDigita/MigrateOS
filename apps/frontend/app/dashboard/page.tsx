import { Sidebar } from "@/components/navigation/sidebar";
import { TopNav } from "@/components/navigation/top-nav";
import { LiveDashboard } from "@/features/dashboard/live-dashboard";
import { WorkspaceGate } from "@/components/auth/workspace-gate";

export default function DashboardPage() {
  return (
    <WorkspaceGate>
      <div className="min-h-screen lg:flex">
        <Sidebar />
        <div className="min-w-0 flex-1 overflow-x-clip">
          <TopNav />
          <main className="relative isolate p-4 pt-5 sm:p-6 lg:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem] bg-[radial-gradient(circle_at_75%_0%,hsl(var(--accent-secondary)/0.14),transparent_38%),radial-gradient(circle_at_10%_10%,hsl(var(--accent-primary)/0.1),transparent_30%)]"
            />
            <LiveDashboard />
          </main>
        </div>
      </div>
    </WorkspaceGate>
  );
}

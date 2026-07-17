import { Sidebar } from "@/components/navigation/sidebar";
import { TopNav } from "@/components/navigation/top-nav";
import { LiveDashboard } from "@/features/dashboard/live-dashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <TopNav />
        <main className="p-5 lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-primary">
            Live platform
          </p>
          <h1 className="mt-2 mb-8 font-display text-3xl font-semibold">
            Modernization command center
          </h1>
          <LiveDashboard />
        </main>
      </div>
    </div>
  );
}

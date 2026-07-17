import { Sidebar } from "@/components/navigation/sidebar";
import { TopNav } from "@/components/navigation/top-nav";
import { JobWorkspace } from "@/features/jobs/job-workspace";

export default async function PlanPage({
  params,
}: Readonly<{ params: Promise<{ jobId: string }> }>) {
  const { jobId } = await params;
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <TopNav />
        <main className="p-5 lg:p-8">
          <JobWorkspace jobId={jobId} mode="plan" />
        </main>
      </div>
    </div>
  );
}

import { Sidebar } from "@/components/navigation/sidebar";
import { TopNav } from "@/components/navigation/top-nav";
import { DashboardOverview } from "@/features/dashboard/dashboard-overview";

export default function DashboardPage() { return <div className="min-h-screen lg:flex"><Sidebar /><div className="min-w-0 flex-1"><TopNav /><DashboardOverview /></div></div>; }

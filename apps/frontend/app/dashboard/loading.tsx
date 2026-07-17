import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return <main className="space-y-6 p-5 lg:p-8"><Skeleton className="h-20 w-80" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-40" />)}</div><div className="grid gap-6 xl:grid-cols-2"><Skeleton className="h-72" /><Skeleton className="h-72" /></div></main>;
}

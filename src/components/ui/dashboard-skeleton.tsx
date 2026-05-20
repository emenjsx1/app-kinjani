import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-5 elev-2 space-y-3">
            <Skeleton className="h-4 w-24 shimmer" />
            <Skeleton className="h-8 w-20 shimmer" />
            <Skeleton className="h-3 w-32 shimmer" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-5 elev-2 space-y-4">
            <Skeleton className="h-4 w-40 shimmer" />
            <Skeleton className="h-[200px] w-full shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

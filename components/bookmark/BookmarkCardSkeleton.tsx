import { Skeleton } from "@/components/ui/skeleton";

export function BookmarkCardSkeleton() {
  return (
    <div className="flex gap-5 rounded-xl border border-border bg-card p-4">
      <Skeleton className="h-[140px] w-[220px] shrink-0 rounded-2xl" />
      <div className="flex flex-1 flex-col gap-3 py-1">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-auto flex gap-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

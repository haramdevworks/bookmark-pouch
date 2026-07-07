import { Skeleton } from "@/components/ui/skeleton";

export function BookmarkCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:gap-5">
      <Skeleton className="h-40 w-full shrink-0 rounded-2xl sm:h-[140px] sm:w-[220px]" />
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

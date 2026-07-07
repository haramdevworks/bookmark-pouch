import { BookmarkCardSkeleton } from "@/components/bookmark/BookmarkCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-6 w-28" />
        <Skeleton className="mt-2 h-3.5 w-24" />
      </div>
      <Skeleton className="h-10 w-full rounded-2xl" />
      <div className="flex flex-col gap-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <BookmarkCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

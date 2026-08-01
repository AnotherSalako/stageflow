import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex w-24 shrink-0 flex-col items-center gap-1.5">
            <Skeleton className="h-14 w-14 rounded-full" />
            <Skeleton className="h-2.5 w-14" />
          </div>
        ))}
      </div>
      <Skeleton className="-mx-4 h-64 w-auto rounded-[28px]" />
    </div>
  );
}

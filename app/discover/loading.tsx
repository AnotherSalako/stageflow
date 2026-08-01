import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-bg px-4 py-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-9 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-4 w-full max-w-xs" />
      <Skeleton className="mt-4 h-12 rounded-2xl" />
      <div className="mt-4 flex gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex shrink-0 flex-col items-center gap-1.5">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-2.5 w-10" />
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-[22px]" />
        ))}
      </div>
    </main>
  );
}

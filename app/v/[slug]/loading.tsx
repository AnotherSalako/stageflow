import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-bg pb-10">
      <div className="flex items-center gap-3 px-4 pt-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 flex-col gap-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-1.5 h-3 w-20" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="relative mx-4 mt-4 aspect-[4/5] overflow-hidden rounded-[28px]">
        <Skeleton className="h-full w-full rounded-none" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-52 w-52 rounded-full border-4 border-bg bg-white/10" />
        </div>
      </div>
      <div className="px-4 pt-6">
        <Skeleton className="h-16 rounded-[22px]" />
        <Skeleton className="mt-6 h-6 w-32 rounded-full" />
        <Skeleton className="mt-2 h-16 w-full" />
        <Skeleton className="mt-4 h-24 rounded-[22px]" />
        <div className="mt-6 grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  );
}

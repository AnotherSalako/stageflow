import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-48" />
      </div>
      <Skeleton className="h-12 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-24 rounded-[22px]" />
        <Skeleton className="h-24 rounded-[22px]" />
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/empty-state";

export default function AdminLoading() {
  return (
    <div>
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-3 h-9 w-1/2 max-w-sm" />
      <Skeleton className="mt-3 h-4 w-2/3 max-w-md" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-3xl" />
        ))}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 w-full rounded-3xl lg:col-span-2" />
        <Skeleton className="h-80 w-full rounded-3xl" />
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/empty-state";

export default function Loading() {
  return (
    <div className="container-page py-12">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="mt-5 h-10 w-3/4 max-w-xl" />
      <Skeleton className="mt-3 h-4 w-1/2 max-w-md" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="surface p-5">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="mt-4 h-5 w-4/5" />
            <Skeleton className="mt-2 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

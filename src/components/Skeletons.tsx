import { Skeleton } from "@/components/Loading";

/** Profile page placeholder: avatar, name, stats and settings rows. */
export function ProfileSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading profile">
      <div className="mt-6 flex flex-col items-center">
        <Skeleton className="h-28 w-28 rounded-full" />
        <Skeleton className="mt-7 h-7 w-44" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24 rounded-3xl" />
        ))}
      </div>

      <Skeleton className="mt-8 h-7 w-52" />

      <div className="mt-4 space-y-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-[72px] rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

/** Bookings list placeholder: segmented tabs + photo cards. */
export function BookingsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading bookings">
      <Skeleton className="mt-3 h-14 rounded-full" />
      <div className="mt-5 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-3xl border border-border/60 bg-card p-3">
            <Skeleton className="h-36 w-full rounded-2xl" />
            <Skeleton className="mt-3 h-5 w-2/3" />
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="mt-4 flex gap-2">
              <Skeleton className="h-9 flex-1 rounded-full" />
              <Skeleton className="h-9 flex-1 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Orders list placeholder: thumbnail rows with a tracking rail. */
export function OrdersSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading orders">
      <Skeleton className="mt-3 h-12 rounded-full" />
      <div className="mt-5 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="rounded-3xl border border-border/60 bg-card p-4">
            <div className="flex gap-3">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
                <Skeleton className="mt-2 h-3 w-1/3" />
              </div>
            </div>
            <Skeleton className="mt-4 h-1.5 w-full rounded-full" />
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-9 flex-1 rounded-full" />
              <Skeleton className="h-9 flex-1 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

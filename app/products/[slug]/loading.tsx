export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Gallery Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square w-full bg-secondary/50 animate-pulse rounded-3xl border border-border/40" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-20 h-20 bg-secondary/40 animate-pulse rounded-2xl border border-border/30" />
              ))}
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="h-6 w-28 bg-muted animate-pulse rounded-full" />
              <div className="h-10 w-3/4 bg-muted animate-pulse rounded-lg" />
              <div className="h-4 w-40 bg-muted animate-pulse rounded" />
            </div>

            <div className="h-12 w-48 bg-muted animate-pulse rounded-lg" />

            <div className="space-y-2 pt-4">
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4/6 bg-muted animate-pulse rounded" />
            </div>

            <div className="h-14 w-full bg-muted animate-pulse rounded-2xl pt-4" />

            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="h-16 bg-secondary/40 animate-pulse rounded-xl border border-border/30" />
              <div className="h-16 bg-secondary/40 animate-pulse rounded-xl border border-border/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

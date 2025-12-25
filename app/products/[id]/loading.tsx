export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="h-20 bg-muted animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button skeleton */}
        <div className="h-6 w-20 bg-muted animate-pulse rounded mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Images skeleton */}
          <div>
            <div className="h-96 bg-muted animate-pulse rounded-lg mb-4" />
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          </div>

          {/* Info skeleton */}
          <div className="flex flex-col">
            <div className="mb-8 space-y-4">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            </div>

            {/* Color variants skeleton */}
            <div className="mb-8">
              <div className="h-4 w-32 bg-muted animate-pulse rounded mb-3" />
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 w-24 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            </div>

            {/* Description skeleton */}
            <div className="mb-8 space-y-2">
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            </div>

            {/* Size skeleton */}
            <div className="mb-8">
              <div className="h-4 w-16 bg-muted animate-pulse rounded mb-2" />
              <div className="h-12 w-full bg-muted animate-pulse rounded" />
            </div>

            {/* Quantity skeleton */}
            <div className="mb-8">
              <div className="h-4 w-20 bg-muted animate-pulse rounded mb-4" />
              <div className="h-10 w-32 bg-muted animate-pulse rounded" />
            </div>

            {/* Add to cart button skeleton */}
            <div className="h-14 w-full bg-muted animate-pulse rounded-lg mb-4" />

            {/* Wishlist and share buttons skeleton */}
            <div className="flex gap-4">
              <div className="flex-1 h-12 bg-muted animate-pulse rounded-lg" />
              <div className="flex-1 h-12 bg-muted animate-pulse rounded-lg" />
            </div>

            {/* Info text skeleton */}
            <div className="mt-8 pt-8 border-t border-border space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        </div>

        {/* Related products skeleton */}
        <div>
          <div className="h-8 w-40 bg-muted animate-pulse rounded mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="aspect-square bg-muted animate-pulse rounded-lg mb-4" />
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-1/2 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="h-32 bg-muted animate-pulse mt-16" />
    </div>
  )
}

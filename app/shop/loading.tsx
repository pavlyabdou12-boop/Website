export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="h-16 border-b border-border" />

      {/* Hero Section skeleton */}
      <section className="bg-muted/50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-12 w-64 bg-muted animate-pulse rounded" />
          <div className="h-6 w-96 bg-muted animate-pulse rounded mt-2" />
        </div>
      </section>

      {/* Products skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <div className="aspect-square bg-muted animate-pulse rounded-lg mb-4" />
              <div className="h-6 w-3/4 bg-muted animate-pulse rounded mb-2" />
              <div className="h-5 w-1/2 bg-muted animate-pulse rounded mb-2" />
              <div className="h-6 w-1/4 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

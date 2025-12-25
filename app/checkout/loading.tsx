export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 bg-muted/50 animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-10 w-48 bg-muted/50 rounded animate-pulse mb-12" />

        <div className="mb-12 flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-muted/50 animate-pulse" />
              {i < 3 && <div className="w-5 h-5 bg-muted/50 rounded animate-pulse" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-8 w-64 bg-muted/50 rounded animate-pulse" />
            <div className="space-y-4">
              <div className="h-12 bg-muted/50 rounded animate-pulse" />
              <div className="h-12 bg-muted/50 rounded animate-pulse" />
              <div className="h-12 bg-muted/50 rounded animate-pulse" />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-muted/50 rounded-lg p-6 animate-pulse">
              <div className="h-6 w-32 bg-muted rounded mb-6" />
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

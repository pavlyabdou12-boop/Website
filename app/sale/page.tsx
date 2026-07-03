import { PRODUCTS } from "@/lib/product-data"
import ProductCard from "@/components/product-card"

export const metadata = {
  title: "Winter Collection Sale | Sisies",
  description: "Shop our Winter Collection on sale with exclusive discounts on luxury abayas and outerwear.",
}

export default function SalePage() {
  // Filter products from winter collection
  const winterProducts = PRODUCTS.filter((product) => product.collection === "winter")

  return (
    <main className="min-h-screen bg-background">
      <div className="px-4 py-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-light mb-4 text-balance">Winter Collection Sale</h1>
            <p className="text-lg text-muted-foreground">
              Discover our curated winter collection with exclusive discounts on premium pieces.
            </p>
          </div>

          {winterProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {winterProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">No products in the winter collection at this time.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

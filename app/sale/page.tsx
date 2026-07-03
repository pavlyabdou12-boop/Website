"use client"

import { PRODUCTS } from "@/lib/product-data"
import Link from "next/link"
import Image from "next/image"
import Header from "@/components/header"
import Footer from "@/components/footer"

function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    black: "#1a1a1a",
    mint: "#98d4bb",
    burgundy: "#722F37",
    olive: "#556B2F",
    beige: "#d4b896",
    gray: "#808080",
    brown: "#8B4513",
    cream: "#FFFDD0",
    creamy: "#F5F5DC",
    yellow: "#FFD700",
    pink: "#FFB6D9",
  }
  return colorMap[color.toLowerCase()] || "#cccccc"
}

export default function SalePage() {
  // Filter products from winter collection
  const winterProducts = PRODUCTS.filter((product) => product.collection === "winter")

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <section className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-light mb-4 text-balance">Winter Collection Sale</h1>
          <p className="text-lg text-muted-foreground">
            Discover our curated winter collection with exclusive discounts on premium pieces.
          </p>
        </div>

        {winterProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {winterProducts.map((product) => (
              <div key={product.id} className="group">
                <Link href={`/products/${product.id}`} className="cursor-pointer">
                  <div className="relative overflow-hidden aspect-square mb-4 rounded-lg bg-muted">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />

                    {(product as any).soldOut && (
                      <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                        Sold Out
                      </span>
                    )}

                    {product.isNewArrival && !(product as any).soldOut && (
                      <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-medium px-2 py-1 rounded">
                        New
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-medium group-hover:text-accent transition text-primary">
                    {product.name}
                  </h3>
                </Link>

                {product.colorVariants && product.colorVariants.length > 1 ? (
                  <div className="flex items-center gap-2 mt-2 mb-2">
                    {product.colorVariants.map((variant) => (
                      <Link
                        key={variant.productId}
                        href={`/products/${variant.productId}`}
                        className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                          variant.productId === product.id
                            ? "border-accent ring-2 ring-accent/30"
                            : "border-border hover:border-accent"
                        }`}
                        style={{ backgroundColor: getColorHex(variant.color) }}
                        title={variant.color.charAt(0).toUpperCase() + variant.color.slice(1)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm capitalize mb-2 text-muted-foreground">
                    {product.color}
                  </p>
                )}

                <p className="text-base font-medium text-foreground">
                  EGP {product.price.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">No products in the winter collection at this time.</p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}

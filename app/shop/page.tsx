"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { PRODUCTS } from "@/lib/product-data"

export default function ShopPage() {
  const [sortBy, setSortBy] = useState("featured")
  const searchParams = useSearchParams()

  // ✅ دايمًا أول ما الصفحة تتفتح (وأي مرة الـ URL يتغير) نرجع لفوق
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior })
  }, [searchParams])

  // السيرش جاي من الـ URL ?search=
  const rawSearch = searchParams.get("search") ?? ""
  const searchQuery = rawSearch.toLowerCase()

  // لو عندك برودكتس أكتر من 7 شيل الـ slice
  const allSisiesProducts = PRODUCTS.slice(0, 7)

  const filteredProducts = useMemo(() => {
    let products = [...allSisiesProducts]

    // فلترة بالـ search (name + category + description لو موجودة)
    if (searchQuery.trim()) {
      products = products.filter((p) => {
        const name = p.name?.toLowerCase() || ""
        const category = p.category?.toLowerCase() || ""
        const description = p.description?.toLowerCase() || ""

        return (
          name.includes(searchQuery) ||
          category.includes(searchQuery) ||
          description.includes(searchQuery)
        )
      })
    }

    // الـ sort
    if (sortBy === "price-low") {
      products.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-high") {
      products.sort((a, b) => b.price - a.price)
    } else if (sortBy === "name") {
      products.sort((a, b) => a.name.localeCompare(b.name))
    }

    return products
  }, [sortBy, searchQuery, allSisiesProducts])

  // New Arrivals (ثابتة وتحت الـ All Products)
  const newArrivals = allSisiesProducts.slice(0, 4)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ✅ Anchor أعلى الصفحة */}
      <div id="top" />

      {/* Hero Section */}
      <section className="bg-muted/50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-light text-pretty">Shop All</h1>
          <p className="text-muted-foreground mt-2">
            Browse our complete collection of elegant pieces
          </p>
        </div>
      </section>

      {/* All Products + Sort */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="w-full">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
            <p className="text-muted-foreground">
              Showing {filteredProducts.length} results
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-muted-foreground">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-background border border-border px-3 py-2 rounded cursor-pointer text-sm"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group cursor-pointer"
                >
                  <div className="relative overflow-hidden bg-muted aspect-square mb-4 rounded-lg">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <h3 className="text-lg font-medium group-hover:text-accent transition">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground text-sm capitalize mb-2">
                    {product.category}
                  </p>
                  <p className="font-semibold">EGP {product.price}.00</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No products found. Try another search.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Arrivals */}
      <section className="py-16 md:py-24 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-10 text-center text-pretty">
            New Arrivals
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden bg-muted aspect-square mb-4 rounded-lg">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <h3 className="text-lg font-medium mb-2 group-hover:text-accent transition">
                  {product.name}
                </h3>
                <p className="text-muted-foreground">EGP {product.price}.00</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

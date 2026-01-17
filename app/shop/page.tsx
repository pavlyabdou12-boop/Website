"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { PRODUCTS } from "@/lib/product-data"

function ShopContent() {
  const [sortBy, setSortBy] = useState("featured")
  const searchParams = useSearchParams()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior })
  }, [searchParams])

  const rawSearch = searchParams.get("search") ?? ""
  const searchQuery = rawSearch.toLowerCase()

  // For products with colorVariants, only show the first color variant in the shop list
  const uniqueProducts = useMemo(() => {
    const seenProductGroups = new Set<string>()
    return PRODUCTS.filter((product) => {
      // Skip the Midi Slip Dress (id: 8) from shop listing
      if (product.id === 8) return false

      // If product has color variants, create a group key based on product name
      if (product.colorVariants && product.colorVariants.length > 0) {
        const groupKey = product.name
        if (seenProductGroups.has(groupKey)) {
          return false // Skip duplicate color variants
        }
        seenProductGroups.add(groupKey)
      }
      return true
    })
  }, [])

  const filteredProducts = useMemo(() => {
    let products = [...uniqueProducts]

    if (searchQuery.trim()) {
      products = products.filter((p) => {
        const name = p.name?.toLowerCase() || ""
        const category = p.category?.toLowerCase() || ""
        const description = p.description?.toLowerCase() || ""

        return name.includes(searchQuery) || category.includes(searchQuery) || description.includes(searchQuery)
      })
    }

    if (sortBy === "price-low") {
      products.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-high") {
      products.sort((a, b) => b.price - a.price)
    } else if (sortBy === "name") {
      products.sort((a, b) => a.name.localeCompare(b.name))
    }

    return products
  }, [sortBy, searchQuery, uniqueProducts])

  const newArrivals = useMemo(() => {
    return PRODUCTS.filter((p) => p.isNewArrival === true)
  }, [])

  return (
    <>
      {/* Anchor at top of page */}
      <div id="top" />

      {/* Hero Section */}
      <section className="bg-muted/50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-light text-pretty">Shop All</h1>
          <p className="text-muted-foreground mt-2">Browse our complete collection of elegant pieces</p>
        </div>
      </section>

      {/* All Products + Sort */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="w-full">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
            <p className="text-muted-foreground">Showing {filteredProducts.length} results</p>
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
                <Link key={product.id} href={`/products/${product.id}`} className="group cursor-pointer">
                  <div className="relative overflow-hidden bg-muted aspect-square mb-4 rounded-lg">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                    {product.isNewArrival && (
                      <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-medium px-2 py-1 rounded">
                        New
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-medium group-hover:text-accent transition">{product.name}</h3>
                  <p className="text-muted-foreground text-sm capitalize mb-2">{product.color}</p>
                  <p className="font-semibold">EGP {product.price}.00</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No products found. Try another search.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Arrivals */}
      <section className="py-16 md:py-24 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-10 text-center text-pretty">New Arrivals</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group cursor-pointer">
                <div className="relative overflow-hidden bg-muted aspect-square mb-4 rounded-lg">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-medium px-2 py-1 rounded">
                    New
                  </span>
                </div>
                <h3 className="text-lg font-medium mb-2 group-hover:text-accent transition">{product.name}</h3>
                <p className="text-muted-foreground text-sm capitalize mb-1">{product.color}</p>
                <p className="text-muted-foreground">EGP {product.price}.00</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="h-16 bg-background" />}>
        <Header />
      </Suspense>

      <Suspense fallback={<div className="h-96 bg-muted/50" />}>
        <ShopContent />
      </Suspense>

      <Suspense fallback={<div className="h-20 bg-background" />}>
        <Footer />
      </Suspense>
    </div>
  )
}

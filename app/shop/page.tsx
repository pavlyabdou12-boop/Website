"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { PRODUCTS } from "@/lib/product-data"

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
  }
  return colorMap[color.toLowerCase()] || "#cccccc"
}

function ShopContent() {
  const [sortBy, setSortBy] = useState("featured")
  const searchParams = useSearchParams()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior })
  }, [searchParams])

  const rawSearch = searchParams.get("search") ?? ""
  const searchQuery = rawSearch.toLowerCase()
  const collectionFilter = searchParams.get("collection") ?? ""

  const uniqueProducts = useMemo(() => {
    const seenProductGroups = new Set<string>()
    return PRODUCTS.filter((product) => {
      // Skip the Midi Slip Dress (id: 8) from shop listing
      if (product.id === 8) return false

      // If product has color variants, create a group key based on product name (without color)
      if (product.colorVariants && product.colorVariants.length > 0) {
        // Get base name without color
        const baseName = product.name.replace(/Black |Mint |Burgundy |Olive |Beige /gi, "").trim()
        const groupKey = baseName || product.name
        if (seenProductGroups.has(groupKey)) {
          return false // Skip duplicate color variants - we'll show swatches instead
        }
        seenProductGroups.add(groupKey)
      }
      return true
    })
  }, [])

  const filteredProducts = useMemo(() => {
    let products = [...uniqueProducts]

    // Filter by collection if specified
    if (collectionFilter) {
      products = products.filter((p) => p.collection === collectionFilter)
    }

    if (searchQuery.trim()) {
      products = products.filter((p) => {
        const name = p.name?.toLowerCase() || ""
        const category = p.category?.toLowerCase() || ""
        const description = p.description?.toLowerCase() || ""
        const collection = p.collection?.toLowerCase() || ""

        return (
          name.includes(searchQuery) ||
          category.includes(searchQuery) ||
          description.includes(searchQuery) ||
          collection.includes(searchQuery)
        )
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
  }, [sortBy, searchQuery, collectionFilter, uniqueProducts])

  const newArrivals = useMemo(() => {
    return PRODUCTS.filter((p) => p.isNewArrival === true)
  }, [])

  const pageTitle = collectionFilter === "ramadan" ? "Ramadan Collection" : collectionFilter === "winter" ? "Winter Collection" : "Shop All"
  const pageDescription = collectionFilter === "ramadan"
    ? "Elegant abayas for the holiest nights"
    : collectionFilter === "winter"
    ? "Stay warm and stylish with our winter pieces"
    : "Browse our complete collection of elegant pieces"

  return (
    <>
      {/* Anchor at top of page */}
      <div id="top" />

      {/* Hero Section */}
      <section className={`py-12 px-4 ${collectionFilter === "ramadan" ? "bg-[#1a1a1a]" : "bg-muted/50"}`}>
        <div className="max-w-7xl mx-auto">
          <h1 className={`text-4xl md:text-5xl font-light text-pretty ${collectionFilter === "ramadan" ? "text-[#d4af37]" : ""}`}>
            {pageTitle}
          </h1>
          <p className={`mt-2 ${collectionFilter === "ramadan" ? "text-[#c4a882]" : "text-muted-foreground"}`}>
            {pageDescription}
          </p>

          {/* Collection tabs */}
          <div className="flex items-center gap-3 mt-6">
            <Link
              href="/shop"
              className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                !collectionFilter
                  ? "bg-amber-950 text-card border-amber-950"
                  : collectionFilter === "ramadan"
                  ? "border-[#d4af37]/40 text-[#c4a882] hover:border-[#d4af37]"
                  : "border-border text-muted-foreground hover:border-foreground"
              }`}
            >
              All
            </Link>
            <Link
              href="/shop?collection=winter"
              className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                collectionFilter === "winter"
                  ? "bg-amber-950 text-card border-amber-950"
                  : collectionFilter === "ramadan"
                  ? "border-[#d4af37]/40 text-[#c4a882] hover:border-[#d4af37]"
                  : "border-border text-muted-foreground hover:border-foreground"
              }`}
            >
              Winter Collection
            </Link>
            <Link
              href="/shop?collection=ramadan"
              className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                collectionFilter === "ramadan"
                  ? "bg-[#d4af37] text-[#1a1a1a] border-[#d4af37]"
                  : "border-border text-muted-foreground hover:border-foreground"
              }`}
            >
              Ramadan Collection
            </Link>
          </div>
        </div>
      </section>

      {/* All Products + Sort */}
      <div className={`max-w-7xl mx-auto px-4 py-12 ${collectionFilter === "ramadan" ? "bg-[#1a1a1a]" : ""}`}>
        <div className="w-full">
          <div className={`flex items-center justify-between mb-8 pb-6 border-b ${collectionFilter === "ramadan" ? "border-[#d4af37]/20" : "border-border"}`}>
            <p className={collectionFilter === "ramadan" ? "text-[#c4a882]" : "text-muted-foreground"}>
              Showing {filteredProducts.length} results
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className={`text-sm ${collectionFilter === "ramadan" ? "text-[#c4a882]" : "text-muted-foreground"}`}>
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`border px-3 py-2 rounded cursor-pointer text-sm ${
                  collectionFilter === "ramadan"
                    ? "bg-[#2a2a2a] border-[#d4af37]/30 text-[#f0e6d3]"
                    : "bg-background border-border"
                }`}
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
                <div key={product.id} className="group">
                  <Link href={`/products/${product.id}`} className="cursor-pointer">
                    <div className={`relative overflow-hidden aspect-square mb-4 rounded-lg ${
                      collectionFilter === "ramadan" ? "bg-[#2a2a2a]" : "bg-muted"
                    }`}>
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-300"
                      />
                      {product.isNewArrival && (
                        <span className={`absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded ${
                          collectionFilter === "ramadan"
                            ? "bg-[#d4af37] text-[#1a1a1a]"
                            : "bg-accent text-accent-foreground"
                        }`}>
                          New
                        </span>
                      )}
                    </div>
                    <h3 className={`text-lg font-medium group-hover:text-accent transition ${
                      collectionFilter === "ramadan" ? "text-[#f0e6d3]" : ""
                    }`}>
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
                    <p className={`text-sm capitalize mb-2 ${
                      collectionFilter === "ramadan" ? "text-[#c4a882]" : "text-muted-foreground"
                    }`}>
                      {product.color}
                    </p>
                  )}

                  <p className={`font-semibold ${collectionFilter === "ramadan" ? "text-[#d4af37]" : ""}`}>
                    EGP {product.price}.00
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className={`text-lg ${collectionFilter === "ramadan" ? "text-[#c4a882]" : "text-muted-foreground"}`}>
                No products found. Try another search.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Arrivals */}
      {!collectionFilter && (
        <section className="py-16 md:py-24 px-4 border-t border-border">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-light mb-10 text-center text-pretty">New Arrivals</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <div key={product.id} className="group">
                  <Link href={`/products/${product.id}`} className="cursor-pointer">
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
                  </Link>

                  {product.colorVariants && product.colorVariants.length > 1 ? (
                    <div className="flex items-center gap-2 mb-1">
                      {product.colorVariants.map((variant) => (
                        <Link
                          key={variant.productId}
                          href={`/products/${variant.productId}`}
                          className={`w-5 h-5 rounded-full border-2 transition-all hover:scale-110 ${
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
                    <p className="text-muted-foreground text-sm capitalize mb-1">{product.color}</p>
                  )}

                  <p className="text-muted-foreground">EGP {product.price}.00</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
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

"use client"

import Link from "next/link"
import Image from "next/image"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { PRODUCTS } from "@/lib/product-data"
import { Suspense } from "react"

export default function HomePage() {
  const handleProductClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const newArrivals = PRODUCTS.filter((p) => p.isNewArrival)
    .concat(PRODUCTS.filter((p) => !p.isNewArrival).slice(0, 4 - PRODUCTS.filter((p) => p.isNewArrival).length))
    .slice(0, 4)

  const ramadanProducts = PRODUCTS.filter((p) => p.collection === "ramadan")

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="h-16 bg-background" />}>
        <Header />
      </Suspense>

      {/* Hero Banner */}
      <section className="relative h-screen bg-secondary">
        <div className="absolute inset-0">
          <Image
            src="/images/whatsapp-20image-202025-11-25-20at-206.jpeg"
            alt="Hero - Sisies Community Wearing Our Designs"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative h-full flex items-center justify-center text-center px-4 leading-6">
          <div className="max-w-2xl leading-7 text-foreground">
            <h1 className="text-5xl md:text-6xl mb-6 text-pretty text-center shadow-xl tracking-tighter text-background mt-96 font-extralight">
              Effortlessly Chic
            </h1>
            <p className="mb-8 text-3xl overline text-card font-extralight">Simply confident ,simply sisies</p>
            <Link
              href="/shop"
              onClick={handleProductClick}
              className="inline-block text-accent-foreground rounded hover:opacity-90 transition font-medium mx-0 leading-7 px-8 py-3 my-0 border-0 opacity-75 bg-primary"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Ramadan Collection Section */}
      <section className="py-16 md:py-24 px-4 bg-[#1a1a1a] bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light mb-4 text-center text-pretty text-[#d4af37]">
            Ramadan Collection
          </h2>
          <p className="text-center text-[#c4a882] mb-12 text-lg font-light">
            Elegance for the holiest nights
          </p>

          {/* Cover Photo */}
          <Link
            href="/shop?collection=ramadan"
            onClick={handleProductClick}
            className="block relative overflow-hidden rounded-lg mb-12 group"
          >
            <div className="relative aspect-[16/9] md:aspect-[21/9]">
              <Image
                src="/images/ramadan-cover.png"
                alt="Ramadan Collection - Sisies Boutique"
                fill
                className="object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
                <span className="inline-block bg-[#d4af37] text-[#1a1a1a] px-6 py-2 text-sm font-medium tracking-wider uppercase rounded">
                  Shop Ramadan Collection
                </span>
              </div>
            </div>
          </Link>

          {/* Ramadan Products */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ramadanProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group cursor-pointer"
                onClick={handleProductClick}
              >
                <div className="relative overflow-hidden bg-[#2a2a2a] aspect-[3/4] mb-4 rounded-lg">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-[#d4af37] text-[#1a1a1a] px-3 py-1 text-xs font-medium rounded">
                    New
                  </span>
                </div>
                <h3 className="text-xl font-medium mb-2 text-[#f0e6d3] text-primary">{product.name}</h3>
                <p className="text-[#d4af37] font-semibold">EGP {product.price}.00</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light mb-12 text-center text-pretty">New Arrivals</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group cursor-pointer"
                onClick={handleProductClick}
              >
                <div className="relative overflow-hidden bg-muted aspect-square mb-4">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                  {product.isNewArrival && (
                    <span className="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 text-xs font-medium">
                      New
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {product.name}{" "}
                  {product.color && `- ${product.color.charAt(0).toUpperCase() + product.color.slice(1)}`}
                </h3>
                <p className="text-muted-foreground">EGP {product.price}.00</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-16 md:py-24 px-4 bg-muted/40">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light mb-12 text-center text-pretty">Best Sellers</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[4, 2].map((productId) => {
              const product = PRODUCTS.find((p) => p.id === productId)
              return product ? (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group cursor-pointer"
                  onClick={handleProductClick}
                >
                  <div className="relative overflow-hidden bg-muted aspect-square mb-4">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <h3 className="text-lg font-medium mb-2">{product.name}</h3>
                  <p className="text-muted-foreground">EGP {product.price}.00</p>
                </Link>
              ) : null
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-8 text-pretty">Our Story</h2>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            Sisies is more than just a local fashion brand—we're a community celebrating modern elegance and
            high-quality style. Every piece is carefully curated to reflect the sophisticated taste of today's woman.
          </p>
          <Link href="/about" className="inline-block font-medium hover:underline transition text-foreground">
            Learn More About Us
          </Link>
        </div>
      </section>

      <Suspense fallback={<div className="h-20 bg-background" />}>
        <Footer />
      </Suspense>
    </div>
  )
}

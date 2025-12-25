"use client"

import Link from "next/link"
import Image from "next/image"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useWishlist } from "@/hooks/use-wishlist"
import { Heart, ArrowRight } from "lucide-react"

export default function WishlistPage() {
  const { wishlist, removeItem, isLoaded } = useWishlist()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="animate-pulse">Loading wishlist...</div>
        </div>
        <Footer />
      </div>
    )
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="flex justify-center mb-6">
            <Heart size={64} className="text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-light mb-4 text-pretty">Your Wishlist is Empty</h1>
          <p className="text-muted-foreground mb-8">Start adding items to your wishlist to save them for later!</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded hover:opacity-90 transition"
          >
            Continue Shopping
            <ArrowRight size={18} />
          </Link>
        </div>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-light mb-12 text-pretty">My Wishlist</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {wishlist.map((item) => (
            <div key={item.id} className="group">
              <div className="relative overflow-hidden bg-muted aspect-square mb-4 rounded">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-3 right-3 bg-background/90 hover:bg-background p-2 rounded transition"
                  aria-label="Remove from wishlist"
                >
                  <Heart size={20} className="text-accent fill-accent" />
                </button>
              </div>
              <h3 className="text-lg font-medium mb-2">{item.name}</h3>
              <p className="text-muted-foreground mb-4">EGP {item.price}.00</p>
              <Link
                href={`/products/${item.id}`}
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded text-sm hover:opacity-90 transition"
              >
                View Product
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center py-12 border-t border-border">
          <p className="text-muted-foreground mb-4">
            {wishlist.length} item{wishlist.length !== 1 ? "s" : ""} in your wishlist
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded hover:opacity-90 transition"
          >
            Continue Shopping
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}

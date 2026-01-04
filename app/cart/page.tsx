"use client"

import { useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useCart } from "@/hooks/use-cart"
import { Trash2, ShoppingBag } from "lucide-react"

export default function CartPage() {
  const router = useRouter()
  const { cart, removeItem, updateQuantity, getTotalPrice, isLoaded } = useCart()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
  }, [])

  const subtotal = getTotalPrice()
  const shippingThreshold = 2500
  const needsForFreeShipping = Math.max(0, shippingThreshold - subtotal)
  const isFreeShipping = subtotal >= shippingThreshold

  // Show loading state before hydration
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background">
        <Suspense fallback={<div className="h-20" />}>
          <Header />
        </Suspense>
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading cart...</div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Suspense fallback={<div className="h-20" />}>
          <Header />
        </Suspense>
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <ShoppingBag size={64} className="mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-4xl font-light mb-4 text-pretty">Your Cart is Empty</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-accent text-accent-foreground px-8 py-4 rounded-lg font-medium hover:opacity-90 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="h-20" />}>
        <Header />
      </Suspense>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-light mb-12 text-pretty">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex gap-6 bg-muted/50 p-4 rounded-lg">
                {/* Product Image */}
                <Link
                  href={`/products/${item.id}`}
                  className="relative w-32 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0"
                >
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                </Link>

                {/* Product Details */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Link href={`/products/${item.id}`}>
                        <h3 className="text-lg font-medium hover:text-accent transition">{item.name}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">{item.size}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id, item.size)}
                      className="text-muted-foreground hover:text-destructive transition p-2"
                      aria-label="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="mt-auto flex justify-between items-center">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-border rounded hover:bg-background transition"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-border rounded hover:bg-background transition"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <p className="text-lg font-semibold">EGP {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-muted/50 rounded-lg p-6 sticky top-24">
              <h2 className="text-2xl font-light mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">EGP {subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">{isFreeShipping ? "FREE" : "Calculated at checkout"}</span>
                </div>

                {!isFreeShipping && needsForFreeShipping > 0 && (
                  <div className="bg-background/80 rounded-lg p-4 text-sm">
                    <p className="text-muted-foreground">
                      Add <span className="font-semibold text-accent">EGP {needsForFreeShipping.toFixed(2)}</span> more
                      to get <span className="font-semibold">free shipping</span>!
                    </p>
                  </div>
                )}

                {isFreeShipping && (
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 text-sm">
                    <p className="text-green-700 dark:text-green-400 font-medium">✓ You qualify for free shipping!</p>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">EGP {subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/checkout")}
                className="w-full bg-accent py-4 rounded-lg font-medium hover:opacity-90 transition mb-4 text-popover-foreground"
              >
                Proceed to Checkout
              </button>

              <Link href="/shop" className="block text-center text-muted-foreground hover:text-foreground transition">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

"use client"

import { Suspense } from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { PRODUCTS } from "@/lib/product-data"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import { ChevronLeft, Heart, Share2, ChevronRight } from "lucide-react"

function HeaderSkeleton() {
  return <div className="h-20 bg-muted animate-pulse" />
}

function FooterSkeleton() {
  return <div className="h-32 bg-muted animate-pulse" />
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()

  const productId = useMemo(() => {
    if (!params?.id) return Number.NaN
    return Number.parseInt(String(params.id), 10)
  }, [params?.id])

  const baseProduct = useMemo(() => {
    return PRODUCTS.find((p) => p.id === productId)
  }, [productId])

  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariantId, setSelectedVariantId] = useState(productId)

  const colorVariants = useMemo(() => {
    if (!baseProduct) return []
    return baseProduct.name === "Royal Cape" || baseProduct.name === "Wrapet jacket"
      ? PRODUCTS.filter((p) => p.name === baseProduct.name)
      : []
  }, [baseProduct])

  const selectedProduct = useMemo(() => {
    return PRODUCTS.find((p) => p.id === selectedVariantId) || baseProduct
  }, [selectedVariantId, baseProduct])

  const allImages = useMemo(() => {
    if (!selectedProduct) return []
    const extra = (selectedProduct as any).additionalImages || []
    return [selectedProduct.image, ...extra].filter(Boolean)
  }, [selectedProduct])

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return []
    return PRODUCTS.filter((p) => p.category === selectedProduct.category && p.id !== selectedProduct.id).slice(0, 4)
  }, [selectedProduct])

  useEffect(() => {
    if (productId && !isNaN(productId)) {
      setSelectedVariantId(productId)
      setSelectedImageIndex(0)
      setQuantity(1)
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
    }
  }, [productId])

  if (!baseProduct || !selectedProduct || isNaN(productId)) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Suspense fallback={<HeaderSkeleton />}>
          <Header />
        </Suspense>
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="text-center">
            <h1 className="text-3xl font-light mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">Product ID: {productId}</p>
            <Link href="/shop" className="text-accent hover:underline font-medium">
              Back to Shop
            </Link>
          </div>
        </div>
        <Suspense fallback={<FooterSkeleton />}>
          <Footer />
        </Suspense>
      </div>
    )
  }

  const handleAddToCart = () => {
    const size = "One size up to 90 kg"

    addItem({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image: selectedProduct.image,
      size,
      quantity,
    })

    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1500)
  }

  const handleWishlistToggle = () => {
    if (isInWishlist(selectedProduct.id)) {
      removeFromWishlist(selectedProduct.id)
    } else {
      addToWishlist({
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        image: selectedProduct.image,
      })
    }
  }

  const handleVariantChange = (variantId: number) => {
    router.push(`/products/${variantId}`)
  }

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition mb-8"
        >
          <ChevronLeft size={20} />
          Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden group">
                <Image
                  src={(allImages[selectedImageIndex] as string) || "/placeholder.svg"}
                  alt={`${selectedProduct.name} - Image ${selectedImageIndex + 1}`}
                  fill
                  className="object-cover"
                  priority
                />

                {allImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 md:p-3 rounded-full shadow-lg transition md:opacity-0 md:group-hover:opacity-100"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={20} className="text-foreground md:w-6 md:h-6" />
                    </button>

                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 md:p-3 rounded-full shadow-lg transition md:opacity-0 md:group-hover:opacity-100"
                      aria-label="Next image"
                    >
                      <ChevronRight size={20} className="text-foreground md:w-6 md:h-6" />
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {allImages.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            selectedImageIndex === index ? "bg-white w-4" : "bg-white/50 hover:bg-white/75"
                          }`}
                          aria-label={`Go to image ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((img, index) => (
                  <button
                    type="button"
                    key={`${selectedProduct.id}-thumb-${index}`}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square bg-muted rounded-lg overflow-hidden border-2 transition ${
                      selectedImageIndex === index ? "border-accent" : "border-transparent hover:border-border"
                    }`}
                    aria-label={`Select image ${index + 1}`}
                  >
                    <Image
                      src={(img as string) || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="mb-8">
              <p className="text-muted-foreground text-sm uppercase tracking-wide mb-4">{selectedProduct.category}</p>
              <h1 className="text-4xl md:text-5xl font-light mb-4 text-pretty">{selectedProduct.name}</h1>

              <p className="text-3xl font-light mb-2">EGP {selectedProduct.price.toFixed(2)}</p>
              <p className="text-muted-foreground capitalize">{selectedProduct.color}</p>
            </div>

            {colorVariants.length > 1 && (
              <div className="mb-8">
                <label className="block font-medium mb-3">Available Colors</label>
                <div className="flex gap-3 flex-wrap">
                  {colorVariants.map((variant) => (
                    <button
                      type="button"
                      key={variant.id}
                      onClick={() => handleVariantChange(variant.id)}
                      className={`px-6 py-3 rounded-lg border-2 font-medium transition capitalize ${
                        selectedProduct.id === variant.id
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border hover:border-accent"
                      }`}
                    >
                      {variant.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{selectedProduct.description}</p>

            <div className="mb-8">
              <label className="block font-medium mb-2">Size</label>
              <p className="inline-block px-6 py-3 rounded-lg font-medium text-white bg-primary-foreground">
                One size up to 90 kg
              </p>
              <p className="text-muted-foreground text-sm mt-2">Fits body types up to 90 kg</p>
            </div>

            <div className="mb-8">
              <label className="block font-medium mb-4">Quantity</label>
              <div className="flex items-center gap-4 w-fit">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border border-border rounded hover:bg-muted transition"
                >
                  −
                </button>
                <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 border border-border rounded hover:bg-muted transition"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className={`py-4 px-8 rounded-lg font-medium text-lg transition mb-4 w-full ${
                isAdded ? "bg-green-600 text-white" : "bg-accent text-accent-foreground hover:opacity-90"
              }`}
            >
              {isAdded ? "✓ Added to Bag" : "Add to Bag"}
            </button>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleWishlistToggle}
                className={`flex-1 py-3 rounded-lg border-2 font-medium transition flex items-center justify-center gap-2 ${
                  isInWishlist(selectedProduct.id)
                    ? "border-accent text-accent"
                    : "border-border text-foreground hover:border-accent"
                }`}
              >
                <Heart size={20} fill={isInWishlist(selectedProduct.id) ? "currentColor" : "none"} />
                Wishlist
              </button>

              <button
                type="button"
                onClick={() =>
                  navigator.share?.({
                    title: selectedProduct.name,
                    text: selectedProduct.description,
                  })
                }
                className="flex-1 py-3 rounded-lg border-2 border-border font-medium transition hover:border-accent flex items-center justify-center gap-2"
              >
                <Share2 size={20} />
                Share
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-border space-y-4 text-sm text-muted-foreground">
              <p>✓ Free shipping on orders over EGP 2500</p>
              <p>✓ Local delivery available</p>
              <p>✓ Exchange only</p>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-light mb-8 text-pretty">Related Items</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((related) => (
                <Link key={related.id} href={`/products/${related.id}`} className="group cursor-pointer block">
                  <div className="relative overflow-hidden bg-muted aspect-square mb-4 rounded-lg">
                    <Image
                      src={related.image || "/placeholder.svg"}
                      alt={related.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300 opacity-100"
                    />
                  </div>
                  <h3 className="text-lg font-medium group-hover:text-accent transition">{related.name}</h3>
                  <p className="text-muted-foreground text-sm capitalize">{related.color}</p>
                  <p className="font-semibold mt-2">EGP {related.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Suspense fallback={<FooterSkeleton />}>
        <Footer />
      </Suspense>
    </div>
  )
}

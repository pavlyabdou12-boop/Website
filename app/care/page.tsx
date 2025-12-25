"use client"

import Image from "next/image"
import { Suspense } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function CarePage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="h-20" />}>
        <Header />
      </Suspense>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-light mb-8 text-center text-pretty">Care Instructions</h1>

        <p className="text-lg text-muted-foreground text-center mb-12 leading-relaxed">
          To preserve the beauty and quality of your Sisies pieces, follow these care guidelines:
        </p>

        <div className="rounded-lg p-8 mb-12 bg-background">
          <div className="relative w-full aspect-[4/5] mb-8">
            <Image
              src="/images/design-mode/IMG_5383.PNG.jpeg"
              alt="Sisies Care Instructions"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <div className="space-y-6 text-muted-foreground">
          <div className="flex gap-4 items-start">
            <span className="text-2xl">🧼</span>
            <div>
              <h3 className="font-medium text-foreground mb-2">Gently hand wash only</h3>
              <p>Use cold or normal water for best results</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="text-2xl">❌</span>
            <div>
              <h3 className="font-medium text-foreground mb-2">Do not bleach</h3>
              <p>Avoid harsh chemicals to maintain fabric quality</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="text-2xl">🌀</span>
            <div>
              <h3 className="font-medium text-foreground mb-2">Avoid wringing</h3>
              <p>Gently squeeze out excess water instead</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="text-2xl">👕</span>
            <div>
              <h3 className="font-medium text-foreground mb-2">Lay flat or hang to air dry</h3>
              <p>Preserve the shape and structure of your garment</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="text-2xl">🔥</span>
            <div>
              <h3 className="font-medium text-foreground mb-2">Iron on low heat if necessary</h3>
              <p>Use gentle heat settings to avoid damage</p>
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-center text-foreground">
            For any questions about caring for your Sisies pieces, contact us at{" "}
            <a href="mailto:sisies2025@gmail.com" className="text-accent hover:underline font-medium">
              sisies2025@gmail.com
            </a>{" "}
            or call{" "}
            <a href="tel:01065161086" className="text-accent hover:underline font-medium">
              01065161086
            </a>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}

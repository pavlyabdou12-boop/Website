"use client"

import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Heart, Zap, Users } from "lucide-react"

function HeaderWithSuspense() {
  return (
    <Suspense fallback={<div className="h-24 bg-background border-b border-border" />}>
      <Header />
    </Suspense>
  )
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderWithSuspense />

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-light mb-6 text-pretty">Our Story</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Sisies is a locally driven brand dedicated to bringing modern, elegant fashion to women who appreciate
            quality, style, and a touch of effortless sophistication.
          </p>
        </div>
      </section>

      {/* Brand Image */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        <Image src="/images/design-mode/IMG_4773.JPG.jpeg" alt="Sisies community" fill className="object-cover" />
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light mb-8 text-pretty">Our Mission</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-start">
              <Heart size={32} className="mb-4 text-black" />
              <h3 className="text-xl font-medium mb-3">Quality First</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every piece in our collection is hand-selected for its superior quality, timeless design, and lasting
                value.
              </p>
            </div>
            <div className="flex flex-col items-start">
              <Zap size={32} className="mb-4 text-foreground" />
              <h3 className="text-xl font-medium mb-3">Local Pride</h3>
              <p className="text-muted-foreground leading-relaxed">
                We celebrate the local fashion community and are committed to supporting our neighborhood with
                personalized service.
              </p>
            </div>
            <div className="flex flex-col items-start">
              <Users size={32} className="mb-4 text-foreground" />
              <h3 className="text-xl font-medium mb-3">Community</h3>
              <p className="text-muted-foreground leading-relaxed">
                Sisies isn&apos;t just a store—it&apos;s a community of women who celebrate confidence, style, and
                self-expression.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light mb-12 text-pretty">Why Choose Sisies?</h2>
          <div className="space-y-8">
            <div className="border-l-4 pl-6 border-foreground">
              <h3 className="text-2xl font-medium mb-2">Curated Collections</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our team carefully curates every piece to ensure we offer only the finest selection of modern, elegant
                fashion that transcends trends.
              </p>
            </div>
            <div className="border-l-4 pl-6 border-foreground">
              <h3 className="text-2xl font-medium mb-2">Personal Styling</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our team is always available to help you find the perfect piece that complements your unique style and
                personality.
              </p>
            </div>
            <div className="border-l-4 pl-6 border-foreground">
              <h3 className="text-2xl font-medium mb-2">Local Delivery</h3>
              <p className="text-muted-foreground leading-relaxed">
                We offer convenient local delivery to bring your favorites to your doorstep with a personal touch.
              </p>
            </div>
            <div className="border-l-4 pl-6 border-foreground">
              <h3 className="text-2xl font-medium mb-2">Exceptional Service</h3>
              <p className="text-muted-foreground leading-relaxed">
                From browsing to delivery, we&apos;re committed to providing an exceptional experience every step of the
                way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-light mb-6 text-pretty">Ready to Experience Sisies?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Explore our latest collection and discover your next favorite piece
          </p>

          {/* ✅ FIX: go to TOP of Shop page */}
          <Link
            href="/shop#top"
            scroll={true}
            className="inline-block text-accent-foreground px-8 py-3 rounded hover:opacity-90 transition font-medium bg-foreground"
          >
            Shop Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

"use client"

import { Suspense } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"

function PrivacyContent() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-light mb-8">SISIES POLICIES</h1>
      <p className="text-muted-foreground mb-8">Last updated: 17 Jan 2026</p>

      <div className="space-y-8 text-foreground">
        <section>
          <h2 className="text-2xl font-medium mb-4">1. PRODUCTS</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>All items are subject to availability.</li>
            <li>
              Colors, fabrics, and details may vary slightly due to lighting, screen display, or material availability.
            </li>
            <li>Measurements are approximate and provided for guidance.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-medium mb-4">2. PRICING & PAYMENTS</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Prices are listed in Egyptian Pound.</li>
            <li>Prices may change without notice.</li>
            <li>Accepted payment methods include Cash and Instapay.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-medium mb-4">3. ORDER PROCESSING</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>For Instapay: Orders are confirmed once payment is done and sent to WhatsApp.</li>
            <li>Estimated timelines will be communicated at checkout or after order confirmation.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-medium mb-4">4. SHIPPING & DELIVERY</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Shipping times depend on your location.</li>
            <li>Delays caused by courier services, customs, or unforeseen circumstances are outside our control.</li>
            <li>Customers are responsible for providing accurate delivery information.</li>
          </ul>
          <p className="mt-4 text-muted-foreground font-medium">
            We are not responsible for lost or delayed orders due to incorrect shipping details.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-medium mb-4">5. RETURNS & EXCHANGES</h2>
          <h3 className="text-lg font-medium mb-2">Ready-to-Wear Items</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Returns or exchanges may be accepted within 3 days of delivery.</li>
            <li>Items must be unworn, unwashed, and in original condition.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-medium mb-4">6. CARE & HANDLING</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>We are not responsible for damage caused by improper care or handling.</li>
            <li>Please follow garment care instructions provided.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="h-16 bg-muted animate-pulse" />}>
        <Header />
      </Suspense>
      <PrivacyContent />
      <Suspense fallback={<div className="h-32 bg-muted animate-pulse" />}>
        <Footer />
      </Suspense>
    </div>
  )
}

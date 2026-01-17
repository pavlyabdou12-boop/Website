"use client"

import { Suspense } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"

function TermsContent() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-light mb-8">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">Last updated: 17 Jan 2026</p>

      <p className="text-muted-foreground mb-8">
        By accessing or purchasing from Sisies, you agree to the following Terms of Service.
      </p>

      <div className="space-y-8 text-foreground">
        <section>
          <h2 className="text-2xl font-medium mb-4">1. USE OF OUR SERVICES</h2>
          <p className="text-muted-foreground">
            You agree to use our website, content, and services for lawful purposes only and not to violate any
            applicable laws or regulations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-medium mb-4">2. ACCURACY OF INFORMATION</h2>
          <p className="text-muted-foreground">
            We strive to provide accurate product descriptions and information but do not guarantee that all details are
            error-free.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-medium mb-4">3. INTELLECTUAL PROPERTY</h2>
          <p className="text-muted-foreground">
            All designs, images, logos, text, and content belong exclusively to Sisies. Unauthorized use, reproduction,
            or distribution is strictly prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-medium mb-4">4. LIMITATION OF LIABILITY</h2>
          <p className="text-muted-foreground mb-4">Sisies is not liable for:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Allergic reactions to fabrics</li>
            <li>Misuse of products</li>
            <li>Minor variations inherent to handmade or custom garments</li>
          </ul>
          <p className="mt-4 text-muted-foreground">
            Our liability is limited to the original purchase price of the product.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-medium mb-4">5. MODIFICATIONS TO SERVICES</h2>
          <p className="text-muted-foreground">
            We reserve the right to modify or discontinue any part of our services or products without notice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-medium mb-4">6. THIRD-PARTY SERVICES</h2>
          <p className="text-muted-foreground">
            We are not responsible for third-party platforms, payment providers, or delivery services used to complete
            your order.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-medium mb-4">7. PRIVACY</h2>
          <p className="text-muted-foreground">
            Your personal information is handled in accordance with our Privacy Policy and used only for order
            fulfillment and communication.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-medium mb-4">8. GOVERNING LAW</h2>
          <p className="text-muted-foreground">These terms are governed by the laws of Egypt.</p>
        </section>

        <section>
          <h2 className="text-2xl font-medium mb-4">9. CONTACT</h2>
          <p className="text-muted-foreground">For inquiries, please contact us at:</p>
          <div className="mt-2 text-muted-foreground">
            <p>Email: Sisies2025@gmail.com</p>
            <p>Phone: 01065161086</p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="h-16 bg-muted animate-pulse" />}>
        <Header />
      </Suspense>
      <TermsContent />
      <Suspense fallback={<div className="h-32 bg-muted animate-pulse" />}>
        <Footer />
      </Suspense>
    </div>
  )
}

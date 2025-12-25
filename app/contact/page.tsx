"use client"

export const dynamic = "force-dynamic"
import { Suspense } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ContactForm } from "@/components/contact-form"
import { FAQSection } from "@/components/faq-section"
import { Mail, Phone } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="h-20 bg-background" />}>
        <Header />
      </Suspense>

      {/* Hero Section */}
      <section className="py-12 md:py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-light text-pretty mb-4">Get in Touch</h1>
          <p className="text-lg text-muted-foreground">
            Have questions? We'd love to hear from you. Get in touch with our team.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Contact Info and Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <h3 className="text-xl font-light text-pretty mb-4">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Phone size={24} className="text-accent flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium mb-1">Phone</p>
                    <a href="tel:+1234567890" className="text-muted-foreground hover:text-accent transition">
                      01065161086
                    </a>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Mail size={24} className="text-accent flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium mb-1">Email</p>
                    <a href="mailto:hello@sisies.local" className="text-muted-foreground hover:text-accent transition">
                      sisies2025@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>

        {/* FAQs Section */}
        <FAQSection />

        {/* Return Policy Section */}
        <section className="bg-muted/50 rounded-lg p-8 md:p-12">
          <h2 id="exchange-policy" className="text-3xl font-light mb-6 text-pretty">
            Exchange Policy
          </h2>
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              At Sisies, we stand behind the quality of every piece. If you're not completely satisfied with your
              purchase, we make exchanges easy.
            </p>
            <div>
              <h3 className="font-medium text-foreground mb-2">3-day (from receiving the order) exchange policy</h3>
              <p>No return only exchange</p>
            </div>
            <div></div>
            <p className="text-sm">
              For more details on our return process, please contact us at sisies2025@gmail.com or call 01065161086
            </p>
          </div>
        </section>
      </div>

      <Suspense fallback={<div className="h-20 bg-background" />}>
        <Footer />
      </Suspense>
    </div>
  )
}

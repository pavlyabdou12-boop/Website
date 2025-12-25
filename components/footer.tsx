"use client"

import type React from "react"
import Link from "next/link"
import { Mail, Instagram, Facebook } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Footer() {
  const router = useRouter()

  const goTo = (href: string) => {
    router.push(href)
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }))
  }

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault()
    window.location.href = "mailto:sisies2025@gmail.com"
  }

  return (
    <footer className="bg-primary text-primary-foreground mt-24">
      <div className="max-w-7xl mx-auto px-4 py-16 bg-[rgba(207,193,176,1)] text-foreground">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-xl font-light mb-4">Sisies</h3>
            <p className="text-sm opacity-80">Local hands, Egyptian heart, women first — that’s Sisies.</p>
          </div>

          <div>
            <h4 className="font-medium mb-4">Shop</h4>
            <nav className="space-y-2 text-sm">
              <button type="button" onClick={() => goTo("/shop")} className="block hover:opacity-80 transition text-left">
                All Products
              </button>
              <button type="button" onClick={() => goTo("/sale")} className="block hover:opacity-80 transition text-left">
                Sale
              </button>
            </nav>
          </div>

          <div>
            <h4 className="font-medium mb-4">Support</h4>
            <nav className="space-y-2 text-sm">
              <button type="button" onClick={() => goTo("/contact")} className="block hover:opacity-80 transition text-left">
                Contact Us
              </button>
              <button type="button" onClick={() => goTo("/faq")} className="block hover:opacity-80 transition text-left">
                FAQ
              </button>
              <button
                type="button"
                onClick={() => goTo("/contact#exchange-policy")}
                className="block hover:opacity-80 transition text-left"
              >
                Exchange
              </button>
              <button type="button" onClick={() => goTo("/care")} className="block hover:opacity-80 transition text-left">
                Care Instructions
              </button>
            </nav>
          </div>

          <div>
            <h4 className="font-medium mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/sisies.boutique?igsh=bTFpdHJob3JwOG8="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:opacity-80 transition"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.facebook.com/share/1BrVP1QBBf/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="hover:opacity-80 transition"
              >
                <Facebook size={20} />
              </a>
              <button
                onClick={handleEmailClick}
                aria-label="Email"
                className="hover:opacity-80 transition bg-transparent border-none cursor-pointer p-0"
              >
                <Mail size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row items-center justify-between text-sm">
          <p className="opacity-80">© 2025 Sisies. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <button type="button" onClick={() => goTo("/privacy")} className="hover:opacity-80 transition">
              Privacy Policy
            </button>
            <button type="button" onClick={() => goTo("/terms")} className="hover:opacity-80 transition">
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Menu, X, ShoppingBag, Search, Instagram, Facebook, Heart } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const desktopSearchRef = useRef<HTMLInputElement | null>(null)
  const mobileSearchRef = useRef<HTMLInputElement | null>(null)

  const initialSearch = searchParams.get("search") ?? ""
  const [searchValue, setSearchValue] = useState(initialSearch)

  useEffect(() => {
    setSearchValue(initialSearch)
  }, [initialSearch])

  const { getTotalItems, isLoaded } = useCart()
  const { getTotalItems: getWishlistItems, isLoaded: wishlistLoaded } = useWishlist()

  const itemCount = isLoaded ? getTotalItems() : 0
  const wishlistCount = wishlistLoaded ? getWishlistItems() : 0

  // ✅ يضمن focus أول ما الـ search يفتح
  useEffect(() => {
    if (!isSearchOpen) return

    // شوية delay عشان input يترسم
    const t = setTimeout(() => {
      if (window.innerWidth >= 768) {
        desktopSearchRef.current?.focus()
      } else {
        mobileSearchRef.current?.focus()
      }
    }, 50)

    return () => clearTimeout(t)
  }, [isSearchOpen, pathname])

  const goToTopAfterNav = () => {
    // بعد الـ route change، ننزل للأعلى
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior })
    })
  }

  // ✅ استخدم دي لأي لينك في الهيدر عشان يروح لأول صفحة الوجهة
  const handleNav = (href: string) => {
    setIsMenuOpen(false)
    setIsSearchOpen(false)

    router.push(href)
    goToTopAfterNav()
  }

  const handleSearchChange = (value: string) => {
    setSearchValue(value)

    const params = new URLSearchParams()
    if (value.trim()) params.set("search", value)

    const url = params.toString() ? `/shop?${params.toString()}` : "/shop"
    router.push(url)
  }

  // ✅ دوسة واحدة: يودّيك shop ويفتح search
  const toggleSearch = () => {
    setIsMenuOpen(false)

    // لو مش في /shop: روح shop وافتح search مرة واحدة
    if (pathname !== "/shop") {
      router.push("/shop")
      setIsSearchOpen(true)
      return
    }

    // لو بالفعل في /shop: افتح/اقفل
    setIsSearchOpen((prev) => !prev)
  }

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl bg-[rgba(208,193,177,1)] leading-7 tracking-normal mx-px my-px px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Logo - Home */}
          <button
            type="button"
            onClick={() => handleNav("/")}
            className="flex items-center group gap-0 bg-[rgba(250,250,250,1)] tracking-normal"
            aria-label="Go to home"
          >
            <div className="relative h-16 w-16 flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 group-hover:shadow-lg group-hover:scale-105 transition-all duration-200 rounded-xl shadow-none">
              <img
                src="/images/design-mode/IMG_4754.PNG(2).png"
                alt="Sisies Logo"
                className="object-contain shadow-none rounded-none border-t-0 text-primary-foreground opacity-100 bg-[rgba(208,193,177,1)] leading-7 w-28 h-20"
              />
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button type="button" onClick={() => handleNav("/")} className="hover:text-accent transition text-amber-950">
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNav("/shop")}
              className="hover:text-accent transition text-amber-950"
            >
              Shop All
            </button>
            <button
              type="button"
              onClick={() => handleNav("/about")}
              className="hover:text-accent transition text-amber-950"
            >
              About
            </button>

            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/sisies.boutique?igsh=bTFpdHJob3JwOG8="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-foreground hover:text-accent transition"
              >
                <Instagram className="text-amber-950" size={20} />
              </a>
              <a
                href="https://www.facebook.com/share/1BrVP1QBBf/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-foreground hover:text-accent transition"
              >
                <Facebook className="text-amber-950" size={20} />
              </a>
              <a
                href="https://www.tiktok.com/@sisies85?_r=1&_t=ZS-91izWVleKA9"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="hover:opacity-80 transition"
              >
                <img
                  src="/images/design-mode/IMG_4771.PNG(2).png"
                  alt="TikTok"
                  className="h-5 w-5 text-amber-950"
                />
              </a>
            </div>
          </nav>

          {/* Right Side Icons + Search */}
          <div className="flex items-center gap-4">
            {/* Search input Desktop */}
            {isSearchOpen && (
              <input
                ref={desktopSearchRef}
                type="text"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search products..."
                className="hidden md:block bg-background border border-border px-3 py-1 rounded text-sm w-64"
              />
            )}

            <button
              type="button"
              aria-label="Search"
              className="text-foreground hover:text-accent transition"
              onClick={toggleSearch}
            >
              <Search className="text-amber-950" size={20} />
            </button>

            {/* Wishlist */}
            <button
              type="button"
              onClick={() => handleNav("/wishlist")}
              className="relative text-foreground hover:text-accent transition"
              aria-label="Wishlist"
            >
              <Heart className="text-amber-950" size={20} />
              <span className="absolute -top-2 -right-2 text-xs rounded-full w-5 h-5 flex items-center justify-center text-card bg-amber-950">
                {wishlistCount}
              </span>
            </button>

            {/* Cart */}
            <button
              type="button"
              onClick={() => handleNav("/cart")}
              className="relative text-foreground hover:text-accent transition"
              aria-label="Cart"
            >
              <ShoppingBag className="text-amber-950" size={20} />
              <span className="absolute -top-2 -right-2 text-xs rounded-full w-5 h-5 flex items-center justify-center text-card bg-amber-950">
                {itemCount}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden text-foreground hover:text-accent transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        {isSearchOpen && (
          <div className="mt-3 md:hidden">
            <input
              ref={mobileSearchRef}
              type="text"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-background border border-border px-3 py-2 rounded text-sm"
            />
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 space-y-3 pb-4 border-t border-border pt-4">
            <button type="button" onClick={() => handleNav("/")} className="block text-left w-full text-foreground hover:text-accent transition">
              Home
            </button>
            <button type="button" onClick={() => handleNav("/shop")} className="block text-left w-full text-foreground hover:text-accent transition">
              Shop All
            </button>
            <button type="button" onClick={() => handleNav("/about")} className="block text-left w-full text-foreground hover:text-accent transition">
              About
            </button>
            <button type="button" onClick={() => handleNav("/wishlist")} className="block text-left w-full text-foreground hover:text-accent transition">
              Wishlist
            </button>

            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://www.instagram.com/sisies.boutique?igsh=bTFpdHJob3JwOG8="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-foreground hover:text-accent transition"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.facebook.com/share/1BrVP1QBBf/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-foreground hover:text-accent transition"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://www.tiktok.com/@sisies85?_r=1&_t=ZS-91izWVleKA9"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="hover:opacity-80 transition"
              >
                <img src="/images/design-mode/IMG_4771%20%281%29.PNG.png" alt="TikTok" className="h-5 w-5" />
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

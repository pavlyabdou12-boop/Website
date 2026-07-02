"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function CollectionFilter() {
  const searchParams = useSearchParams()
  const collectionFilter = searchParams.get("collection") ?? ""

  const isRamadan = collectionFilter === "ramadan"
  const isWinter = collectionFilter === "winter"
  const isSummer = collectionFilter === "summer"
  const isAll = !collectionFilter

  const collections = [
    { href: "/shop", label: "All", active: isAll },
    { href: "/shop?collection=summer", label: "Summer", active: isSummer },
    { href: "/shop?collection=winter", label: "Winter", active: isWinter },
    { href: "/shop?collection=ramadan", label: "Kaftans", active: isRamadan },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {collections.map((collection) => (
        <Link
          key={collection.label}
          href={collection.href}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
            collection.active
              ? "bg-amber-950 text-card border-amber-950 shadow-md"
              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
          }`}
        >
          {collection.label}
        </Link>
      ))}
    </div>
  )
}

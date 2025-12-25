"use client"
import { Suspense } from "react"
import { HeaderContent } from "./header-client"

export default function Header() {
  return (
    <Suspense fallback={<div className="h-24 bg-background border-b border-border" />}>
      <HeaderContent />
    </Suspense>
  )
}

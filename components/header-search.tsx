"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"

interface HeaderSearchProps {
  onSearchChange: (value: string) => void
}

export function HeaderSearch({ onSearchChange }: HeaderSearchProps) {
  const searchParams = useSearchParams()
  const lastUrlSearchRef = useRef<string | null>(null)

  useEffect(() => {
    const urlSearch = searchParams.get("search") ?? ""

    // ✅ حدّث الـ state فقط لو الـ URL search اتغير فعلاً (navigation)
    if (lastUrlSearchRef.current !== urlSearch) {
      lastUrlSearchRef.current = urlSearch
      onSearchChange(urlSearch)
    }
  }, [searchParams, onSearchChange])

  return null
}

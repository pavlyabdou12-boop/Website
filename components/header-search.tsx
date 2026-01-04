"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

interface HeaderSearchProps {
  onSearchChange: (value: string) => void
  searchValue: string
}

export function HeaderSearch({ onSearchChange, searchValue }: HeaderSearchProps) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const initialSearch = searchParams.get("search") ?? ""
    onSearchChange(initialSearch)
  }, [searchParams, onSearchChange])

  return null
}

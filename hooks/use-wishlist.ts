"use client"

import { useState, useEffect } from "react"

export interface WishlistItem {
  id: number
  name: string
  price: number
  image: string
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sisies-wishlist")
    if (saved) {
      setWishlist(JSON.parse(saved))
    }
    setIsLoaded(true)
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("sisies-wishlist", JSON.stringify(wishlist))
    }
  }, [wishlist, isLoaded])

  const addItem = (item: WishlistItem) => {
    setWishlist((prev) => {
      const exists = prev.find((i) => i.id === item.id)
      if (exists) return prev
      return [...prev, item]
    })
  }

  const removeItem = (id: number) => {
    setWishlist((prev) => prev.filter((i) => i.id !== id))
  }

  const isInWishlist = (id: number) => {
    return wishlist.some((i) => i.id === id)
  }

  const getTotalItems = () => {
    return wishlist.length
  }

  return {
    wishlist,
    addItem,
    removeItem,
    isInWishlist,
    getTotalItems,
    isLoaded,
  }
}

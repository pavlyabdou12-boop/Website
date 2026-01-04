"use client"

import { useState, useEffect } from "react"

export interface CartItem {
  id: number
  name: string
  price: number
  size: string
  selectedSize?: string // renamed from size to selectedSize for clarity
  color?: string // added color field for variant support
  quantity: number
  image: string
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sisies-cart")
    if (saved) {
      setCart(JSON.parse(saved))
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("sisies-cart", JSON.stringify(cart))
    }
  }, [cart, isLoaded])

  const addItem = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) =>
          i.id === item.id && (i.selectedSize || i.size) === (item.selectedSize || item.size) && i.color === item.color,
      )
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && (i.selectedSize || i.size) === (item.selectedSize || item.size) && i.color === item.color
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        )
      }
      return [...prev, item]
    })
  }

  const removeItem = (id: number, size: string, color?: string) => {
    setCart((prev) => prev.filter((i) => !(i.id === id && (i.selectedSize || i.size) === size && i.color === color)))
  }

  const updateQuantity = (id: number, size: string, quantity: number, color?: string) => {
    if (quantity <= 0) {
      removeItem(id, size, color)
      return
    }
    setCart((prev) =>
      prev.map((i) =>
        i.id === id && (i.selectedSize || i.size) === size && i.color === color ? { ...i, quantity } : i,
      ),
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  return {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    isLoaded,
  }
}

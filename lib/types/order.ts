export interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
  variant?: {
    size?: string
    color?: string
  }
}

export interface OrderPayload {
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
    subscribeToOffers: boolean
  }
  address: {
    street: string
    building: string
    apartment?: string
    city: string
    postalCode?: string
    notes?: string
  }
  items: OrderItem[]
  pricing: {
    subtotal: number
    discount: number
    shippingFee: number
    total: number
  }
  paymentMethod: "instapay" | "cod"
  shippingRegion: "cairo-giza" | "other"
}

export interface OrderResponse {
  success: boolean
  orderId?: string
  orderNumber?: string
  message: string
  error?: string
}

export interface Order {
  id: string
  order_number: string
  customer_full_name: string
  customer_email: string
  customer_phone: string
  delivery_country: string
  delivery_city: string
  delivery_area?: string
  delivery_street: string
  delivery_building: string
  delivery_apartment?: string
  delivery_notes?: string
  subtotal: number
  shipping_fee: number
  discount: number
  total: number
  payment_method: "instapay" | "cod"
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  source: string
  user_id?: string
  subscribe_to_offers: boolean
  created_at: string
  updated_at: string
}

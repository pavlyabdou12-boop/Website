import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { OrderPayload, OrderResponse } from "@/lib/types/order"

// Validate environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("[v0] ❌ Missing Supabase environment variables")
}

export async function POST(req: Request): Promise<NextResponse<OrderResponse>> {
  try {
    // Parse request
    const payload: OrderPayload = await req.json()

    console.log("[v0] 📦 Order received:", {
      email: payload.customer.email,
      itemCount: payload.items.length,
      total: payload.pricing.total,
    })

    // Validate required fields
    if (!payload.customer?.email || !payload.items?.length || payload.pricing?.total === undefined) {
      console.error("[v0] ❌ Missing required fields in order payload")
      return NextResponse.json(
        { success: false, message: "Missing required order information", error: "Invalid payload" },
        { status: 400 },
      )
    }

    // Initialize Supabase client with service role (server-side only)
    const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
      auth: {
        persistSession: false,
      },
    })

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    console.log("[v0] 📝 Creating order:", orderNumber)

    // Insert order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          order_number: orderNumber,
          customer_full_name: `${payload.customer.firstName} ${payload.customer.lastName}`,
          customer_email: payload.customer.email,
          customer_phone: payload.customer.phone,
          delivery_country: "Egypt",
          delivery_city: payload.address.city,
          delivery_street: payload.address.street,
          delivery_building: payload.address.building,
          delivery_apartment: payload.address.apartment || null,
          delivery_notes: payload.address.notes || null,
          subtotal: payload.pricing.subtotal,
          shipping_fee: payload.pricing.shippingFee,
          discount: payload.pricing.discount,
          total: payload.pricing.total,
          payment_method: payload.paymentMethod,
          status: "pending",
          source: "checkout",
          subscribe_to_offers: payload.customer.subscribeToOffers,
          user_id: null,
        },
      ])
      .select()
      .single()

    if (orderError) {
      console.error("[v0] ❌ Failed to insert order:", orderError.message)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create order",
          error: `Database error: ${orderError.message}`,
        },
        { status: 500 },
      )
    }

    const orderId = orderData.id

    console.log("[v0] ✅ Order created with ID:", orderId)

    // Insert order items
    const orderItems = payload.items.map((item) => ({
      order_id: orderId,
      product_id: item.id,
      product_name: item.name,
      variant_size: item.variant?.size || null,
      variant_color: item.variant?.color || null,
      quantity: item.quantity,
      unit_price: item.price,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("[v0] ❌ Failed to insert order items:", itemsError.message)
      // Order was created but items failed - this is a partial failure
      return NextResponse.json(
        {
          success: false,
          message: "Order created but items failed to save",
          error: `Items error: ${itemsError.message}`,
          orderId,
          orderNumber,
        },
        { status: 500 },
      )
    }

    console.log("[v0] ✅ Order items saved successfully")

    return NextResponse.json(
      {
        success: true,
        orderId,
        orderNumber,
        message: "Order created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[v0] ❌ Checkout error:", errorMessage)

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { OrderPayload, OrderResponse } from "@/lib/types/order"

// ================= ENV =================
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// ================= HELPERS =================
// Generate 6-digit order number (e.g. 483921)
function generateOrderNumber(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

// ================= ROUTE =================
export async function POST(req: Request): Promise<NextResponse<OrderResponse>> {
  try {
    // -------- Parse request --------
    const payload: OrderPayload = await req.json()

    console.log("[v0] 📦 Order received:", {
      email: payload.customer?.email,
      itemCount: payload.items?.length,
      total: payload.pricing?.total,
    })

    // -------- Validation --------
    if (!payload.customer?.email || !payload.items?.length || payload.pricing?.total === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required order information",
          error: "Invalid payload",
        },
        { status: 400 },
      )
    }

    // -------- Supabase client (SERVER ONLY) --------
    const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    })

    // -------- Generate short order number --------
    const orderNumber = generateOrderNumber()
    console.log("[v0] 📝 Creating order:", orderNumber)

    // -------- Insert order --------
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
          error: orderError.message,
        },
        { status: 500 },
      )
    }

    const orderId = orderData.id
    console.log("[v0] ✅ Order created:", orderId)

    // -------- Insert order items --------
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
      console.error("[v0] ❌ Failed to insert items:", itemsError.message)
      return NextResponse.json(
        {
          success: false,
          message: "Order created but items failed",
          error: itemsError.message,
          orderId,
          orderNumber,
        },
        { status: 500 },
      )
    }

    console.log("[v0] ✅ Order items saved")

    // -------- Send confirmation email to customer (server-side, non-blocking) --------
    try {
      console.log(`[v0] 📧 Triggering confirmation email for order ${orderNumber}`)

      // Call the email API route with complete order details
      const emailResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/send-confirmation-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNumber, // ensure this is passed
            customerEmail: payload.customer.email, // match the email API expectations
            email: payload.customer.email, // backup field name
            customerFullName: `${payload.customer.firstName} ${payload.customer.lastName}`,
            customerPhone: payload.customer.phone,
            deliveryAddress: {
              street: payload.address.street,
              building: payload.address.building,
              apartment: payload.address.apartment || null,
              city: payload.address.city,
              postalCode: payload.address.postalCode || null,
              country: "Egypt",
              notes: payload.address.notes || null,
            },
            items: payload.items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              variant: item.variant || { size: null, color: null },
            })),
            subtotal: payload.pricing.subtotal,
            discount: payload.pricing.discount,
            shippingFee: payload.pricing.shippingFee,
            total: payload.pricing.total,
            paymentMethod: payload.paymentMethod,
          }),
        },
      )

      if (!emailResponse.ok) {
        const emailError = await emailResponse.json().catch(() => ({}))
        console.error("[v0] ⚠️ Email API returned non-OK status:", emailError)
        // Don't fail checkout - email is nice-to-have
      } else {
        const emailResult = await emailResponse.json()
        console.log("[v0] ✅ Email API call succeeded:", emailResult)
      }
    } catch (emailError) {
      // Log but don't fail - order is already saved
      console.error(
        "[v0] ⚠️ Email sending failed (non-blocking):",
        emailError instanceof Error ? emailError.message : "Unknown error",
      )
    }

    // -------- Success --------
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

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { OrderPayload, OrderResponse } from "@/lib/types/order"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function generateOrderNumber(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function parseMoney(v: any): number {
  if (v === null || v === undefined) return 0
  if (typeof v === "number") return Number.isFinite(v) ? v : 0
  const s = String(v).trim().replace(/[^\d.,-]/g, "")
  if (s.includes(",") && s.includes(".")) return Number(s.replace(/,/g, "")) || 0
  if (s.includes(",") && !s.includes(".")) return Number(s.replace(",", ".")) || 0
  return Number(s) || 0
}

export async function POST(req: Request): Promise<NextResponse<OrderResponse>> {
  try {
    const payload: OrderPayload = await req.json()

    console.log("[checkout] 📦 Order received:", {
      email: payload.customer?.email,
      itemCount: payload.items?.length,
      payloadTotal: payload.pricing?.total,
    })

    if (!payload.customer?.email || !payload.items?.length) {
      return NextResponse.json(
        { success: false, message: "Missing required order information", error: "Invalid payload" },
        { status: 400 },
      )
    }

    const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    })

    const orderNumber = generateOrderNumber()
    console.log("[checkout] 📝 Creating order:", orderNumber)

    // ✅ normalize items (numbers)
    const normalizedItems = payload.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      quantity: Math.max(1, Math.floor(parseMoney(item.quantity))),
      price: parseMoney(item.price),
      variant: item.variant || { size: null, color: null },
    }))

    // ✅ compute totals server-side (source of truth)
    const computedSubtotal = normalizedItems.reduce((sum, it) => sum + it.price * it.quantity, 0)
    const computedDiscount = parseMoney(payload.pricing?.discount)
    const computedShipping = parseMoney(payload.pricing?.shippingFee)
    const computedTotal = Math.max(0, computedSubtotal - computedDiscount) + computedShipping

    console.log("[checkout] ✅ computed totals:", {
      computedSubtotal,
      computedDiscount,
      computedShipping,
      computedTotal,
      firstItem: normalizedItems[0]?.name,
      firstItemPrice: normalizedItems[0]?.price,
    })

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
          subtotal: computedSubtotal,
          shipping_fee: computedShipping,
          discount: computedDiscount,
          total: computedTotal,
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
      console.error("[checkout] ❌ Failed to insert order:", orderError.message)
      return NextResponse.json(
        { success: false, message: "Failed to create order", error: orderError.message },
        { status: 500 },
      )
    }

    const orderId = orderData.id
    console.log("[checkout] ✅ Order created:", orderId)

    // -------- Insert order items --------
    const orderItems = normalizedItems.map((item: any) => ({
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
      console.error("[checkout] ❌ Failed to insert items:", itemsError.message)
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

    console.log("[checkout] ✅ Order items saved")

    // ✅ DB MODE: send only orderId to email route
    try {
      const baseUrl =
        process.env.APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

      console.log("[checkout] 📧 Triggering email (DB MODE):", { baseUrl, orderId, orderNumber })

      const emailResponse = await fetch(`${baseUrl}/api/send-confirmation-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })

      const text = await emailResponse.text()
      console.log("[checkout] 📧 email route response:", emailResponse.status, text)
    } catch (emailError) {
      console.error(
        "[checkout] ⚠️ Email trigger failed (non-blocking):",
        emailError instanceof Error ? emailError.message : "Unknown error",
      )
    }

    return NextResponse.json(
      { success: true, orderId, orderNumber, message: "Order created successfully" },
      { status: 201 },
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[checkout] ❌ Checkout error:", errorMessage)

    return NextResponse.json(
      { success: false, message: "Internal server error", error: errorMessage },
      { status: 500 },
    )
  }
}

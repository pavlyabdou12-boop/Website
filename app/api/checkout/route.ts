import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { OrderPayload, OrderResponse } from "@/lib/types/order"

// ✅ مهم جدًا على Vercel
export const runtime = "nodejs"

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

    if (!payload.customer?.email || !payload.items?.length) {
      return NextResponse.json(
        { success: false, message: "Invalid order payload" },
        { status: 400 },
      )
    }

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error("[checkout] ❌ Supabase env vars missing")
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 },
      )
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    const orderNumber = generateOrderNumber()

    // ✅ normalize items
    const normalizedItems = payload.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      quantity: Math.max(1, Math.floor(parseMoney(item.quantity))),
      price: parseMoney(item.price),
      variant: item.variant || { size: null, color: null },
    }))

    // ✅ compute totals server-side
    const subtotal = normalizedItems.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0,
    )
    const discount = parseMoney(payload.pricing?.discount)
    const shippingFee = parseMoney(payload.pricing?.shippingFee)
    const total = Math.max(0, subtotal - discount) + shippingFee

    // -------- Insert order --------
    const { data: order, error: orderError } = await supabase
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
          subtotal,
          shipping_fee: shippingFee,
          discount,
          total,
          payment_method: payload.paymentMethod,
          status: "pending",
          source: "checkout",
          subscribe_to_offers: payload.customer.subscribeToOffers,
          user_id: null,
        },
      ])
      .select()
      .single()

    if (orderError || !order) {
      console.error("[checkout] ❌ Order insert failed:", orderError?.message)
      return NextResponse.json(
        { success: false, message: "Failed to create order" },
        { status: 500 },
      )
    }

    const orderId = order.id

    // -------- Insert order items --------
    const orderItems = normalizedItems.map((item) => ({
      order_id: orderId,
      product_id: item.id,
      product_name: item.name,
      variant_size: item.variant?.size || null,
      variant_color: item.variant?.color || null,
      quantity: item.quantity,
      unit_price: item.price,
    }))

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems)

    if (itemsError) {
      console.error("[checkout] ❌ Order items insert failed:", itemsError.message)
      return NextResponse.json(
        {
          success: false,
          message: "Order created but items failed",
          orderId,
          orderNumber,
        },
        { status: 500 },
      )
    }

    // -------- Trigger confirmation email (non-blocking) --------
    try {
      const emailUrl = new URL("/api/send-confirmation-email", req.url)

      const emailRes = await fetch(emailUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })

      const text = await emailRes.text()
      console.log("[checkout] 📧 email response:", emailRes.status, text)
    } catch (e) {
      console.error("[checkout] ⚠️ Email trigger failed:", e)
    }

    return NextResponse.json(
      {
        success: true,
        orderId,
        orderNumber,
        message: "Order created successfully",
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("[checkout] ❌ Fatal error:", error?.message || error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    )
  }
}

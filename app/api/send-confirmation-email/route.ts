import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const RESEND_API_KEY = process.env.RESEND_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "sisies2025@gmail.com"

// ✅ validate "from" format
function normalizeFrom(raw?: string) {
  const v = (raw || "").trim()

  const ok =
    /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(v) ||
    /^.+\s<[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+>$/.test(v)

  return ok ? v : null
}

const RESEND_FROM =
  normalizeFrom(process.env.RESEND_FROM) || "Sisies <onboarding@resend.dev>"

function parseMoney(v: any): number {
  if (v === null || v === undefined) return 0
  if (typeof v === "number") return Number.isFinite(v) ? v : 0
  const s = String(v).trim().replace(/[^\d.,-]/g, "")
  if (s.includes(",") && s.includes(".")) return Number(s.replace(/,/g, "")) || 0
  if (s.includes(",") && !s.includes(".")) return Number(s.replace(",", ".")) || 0
  return Number(s) || 0
}

function formatCurrency(v: any) {
  return `EGP ${parseMoney(v).toFixed(2)}`
}

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json().catch(() => ({}))

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Missing orderId" }, { status: 400 })
    }

    if (!RESEND_API_KEY) {
      console.error("[send-confirmation-email] ❌ RESEND_API_KEY missing")
      return NextResponse.json({ success: false, error: "RESEND_API_KEY missing" }, { status: 500 })
    }

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error("[send-confirmation-email] ❌ Supabase env missing")
      return NextResponse.json({ success: false, error: "Supabase env missing" }, { status: 500 })
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    // ✅ Get order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select(
        "id, order_number, customer_full_name, customer_email, customer_phone, delivery_street, delivery_building, delivery_apartment, delivery_city, delivery_notes, subtotal, discount, shipping_fee, total, payment_method",
      )
      .eq("id", orderId)
      .single()

    if (orderErr || !order) {
      console.error("[send-confirmation-email] ❌ Order fetch failed:", orderErr?.message)
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    // ✅ Get items
    const { data: items, error: itemsErr } = await supabase
      .from("order_items")
      .select("product_name, variant_size, variant_color, quantity, unit_price")
      .eq("order_id", orderId)

    if (itemsErr) {
      console.error("[send-confirmation-email] ❌ Items fetch failed:", itemsErr.message)
      return NextResponse.json({ success: false, error: "Order items not found" }, { status: 500 })
    }

    const orderNumber = order.order_number
    const customerFullName = order.customer_full_name || "Valued Customer"
    const customerPhone = order.customer_phone || "N/A"
    const customerEmail = order.customer_email

    const subtotal = parseMoney(order.subtotal)
    const discount = parseMoney(order.discount)
    const shippingFee = parseMoney(order.shipping_fee)
    const total = parseMoney(order.total)
    const paymentMethod = order.payment_method || "Not specified"

    const deliveryAddress = {
      street: order.delivery_street,
      building: order.delivery_building,
      apartment: order.delivery_apartment,
      city: order.delivery_city,
      notes: order.delivery_notes,
    }

    // ✅ Build items table rows
    const itemsRows =
      (items?.length ?? 0) > 0
        ? items!
            .map((it: any) => {
              const qty = Math.max(1, Math.floor(parseMoney(it.quantity)))
              const unit = parseMoney(it.unit_price)
              const lineTotal = unit * qty
              const variant = [it.variant_size, it.variant_color].filter(Boolean).join(" ")

              return `
                <tr>
                  <td style="padding:10px;border-bottom:1px solid #eee;">${it.product_name}</td>
                  <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">${variant || "-"}</td>
                  <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">${qty}</td>
                  <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">${formatCurrency(unit)}</td>
                  <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">${formatCurrency(lineTotal)}</td>
                </tr>
              `
            })
            .join("")
        : `<tr><td colspan="5" style="padding:12px;text-align:center;color:#999;">No items in order</td></tr>`

    // ✅ Beautiful email template (like your screenshot)
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Order Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">

          <tr>
            <td style="background:#c8a882;padding:25px;text-align:center;color:#fff;">
              <h1 style="margin:0;font-size:26px;">✅ Order Confirmed!</h1>
              <p style="margin:8px 0 0;font-size:14px;">
                New Order Received - Order #${orderNumber}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:25px;color:#333;font-size:14px;line-height:1.6;">

              <p style="color:#999;margin:0;">Order Reference</p>
              <p style="font-size:22px;font-weight:bold;color:#c8a882;margin:4px 0 20px;">
                #${orderNumber}
              </p>

              <h3 style="border-bottom:2px solid #c8a882;padding-bottom:6px;margin:0;">Customer Information</h3>
              <p style="margin:10px 0 0;"><b>Name:</b> ${customerFullName}</p>
              <p style="margin:6px 0 0;"><b>Email:</b> ${customerEmail}</p>
              <p style="margin:6px 0 0;"><b>Phone:</b> ${customerPhone}</p>

              <h3 style="border-bottom:2px solid #c8a882;padding-bottom:6px;margin:25px 0 0;">Delivery Address</h3>
              <p style="margin:10px 0 0;">
                ${deliveryAddress.street || "N/A"}<br/>
                Building ${deliveryAddress.building || "N/A"}${deliveryAddress.apartment ? `, Apt ${deliveryAddress.apartment}` : ""}<br/>
                ${deliveryAddress.city || "N/A"}, Egypt
              </p>
              ${
                deliveryAddress.notes
                  ? `<p style="margin:10px 0 0;"><b>Notes:</b> ${deliveryAddress.notes}</p>`
                  : ""
              }

              <h3 style="border-bottom:2px solid #c8a882;padding-bottom:6px;margin:25px 0 0;">Payment Method</h3>
              <div style="margin-top:10px;">
                <span style="display:inline-block;background:#eef6ff;color:#1a73e8;padding:6px 12px;border-radius:6px;font-size:13px;">
                  ${paymentMethod === "instapay" ? "💳 Instapay Wallet" : "💵 Cash on Delivery"}
                </span>
              </div>

              <h3 style="border-bottom:2px solid #c8a882;padding-bottom:6px;margin:30px 0 0;">
                Order Items (${items?.length ?? 0})
              </h3>

              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:10px;">
                <thead>
                  <tr style="background:#f9f9f9;">
                    <th align="left" style="padding:10px;border-bottom:1px solid #ddd;">Product</th>
                    <th align="center" style="padding:10px;border-bottom:1px solid #ddd;">Variant</th>
                    <th align="center" style="padding:10px;border-bottom:1px solid #ddd;">Qty</th>
                    <th align="right" style="padding:10px;border-bottom:1px solid #ddd;">Unit</th>
                    <th align="right" style="padding:10px;border-bottom:1px solid #ddd;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>

              <div style="background:#fafafa;border-left:4px solid #c8a882;padding:15px;margin-top:25px;border-radius:6px;">
                <p style="margin:6px 0;"><b>Subtotal:</b> ${formatCurrency(subtotal)}</p>
                ${discount > 0 ? `<p style="margin:6px 0;color:#d9534f;"><b>Discount:</b> -${formatCurrency(discount)}</p>` : ""}
                <p style="margin:6px 0;"><b>Shipping:</b> ${formatCurrency(shippingFee)}</p>
                <p style="margin:10px 0 0;font-size:18px;font-weight:bold;color:#c8a882;">
                  Total Amount: ${formatCurrency(total)}
                </p>
              </div>

            </td>
          </tr>

          <tr>
            <td style="background:#f9f9f9;padding:18px;text-align:center;font-size:12px;color:#999;">
              <b>Sisies Admin Portal</b><br/>
              © 2025 Sisies Boutique. All rights reserved.<br/>
              Order #${orderNumber} processed from DB.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`

    const resend = new Resend(RESEND_API_KEY)

    console.log("[send-confirmation-email] 📧 sending:", {
      from: RESEND_FROM,
      to: ADMIN_EMAIL,
      orderNumber,
    })

    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: ADMIN_EMAIL,
      subject: `✅ Order Confirmed #${orderNumber} | ${customerFullName}`,
      html,
    })

    if (error) {
      console.error("[send-confirmation-email] ❌ Resend error:", error)
      return NextResponse.json({ success: false, error }, { status: 500 })
    }

    console.log("[send-confirmation-email] ✅ Sent:", data?.id)
    return NextResponse.json({ success: true, emailId: data?.id, orderNumber }, { status: 200 })
  } catch (e: any) {
    console.error("[send-confirmation-email] ❌ fatal:", e?.message || e)
    return NextResponse.json({ success: false, error: e?.message || "Internal error" }, { status: 500 })
  }
}

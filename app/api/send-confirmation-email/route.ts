import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@supabase/supabase-js"

const RESEND_API_KEY = process.env.RESEND_API_KEY
const SENDER_EMAIL = "Sisies <onboarding@resend.dev>"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

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
    const payload = await req.json()
    const orderId = payload.orderId

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Missing orderId" }, { status: 400 })
    }

    if (!RESEND_API_KEY) {
      console.error("[send-confirmation-email] ❌ RESEND_API_KEY not configured")
      return NextResponse.json({ success: false, error: "Email service not configured" }, { status: 500 })
    }

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error("[send-confirmation-email] ❌ Missing Supabase env vars")
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 })
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })

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

    console.log("[send-confirmation-email] HIT ✅ DB MODE", {
      orderId,
      orderNumber,
      customerEmail,
      subtotal,
      shippingFee,
      total,
      itemsCount: items?.length ?? 0,
    })

    const itemsTableHTML =
      (items?.length ?? 0) > 0
        ? items!
            .map((it: any) => {
              const qty = Math.max(1, Math.floor(parseMoney(it.quantity)))
              const unit = parseMoney(it.unit_price)
              const lineTotal = unit * qty
              const variant = [it.variant_size, it.variant_color].filter(Boolean).join(" ")

              return `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #eee;">${it.product_name}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${variant}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${qty}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(unit)}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(lineTotal)}</td>
                </tr>
              `
            })
            .join("")
        : `<tr><td colspan="5" style="padding: 12px; text-align: center; color: #999;">No items in order</td></tr>`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .wrapper { width: 100%; background-color: #f5f5f5; padding: 20px 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #c8a882 0%, #b89968 100%); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { font-size: 28px; margin: 0; }
            .content { padding: 30px 20px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 16px; font-weight: bold; color: #2c2c2c; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #c8a882; }
            table { width: 100%; border-collapse: collapse; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .info-label { font-weight: 600; color: #666; }
            .pricing-box { background-color: #fafafa; padding: 20px; border-left: 4px solid #c8a882; border-radius: 4px; margin: 20px 0; }
            .price-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 15px; }
            .price-row.total { font-size: 18px; font-weight: bold; color: #c8a882; border-top: 1px solid #ddd; padding-top: 12px; margin-top: 8px; }
            .badge { display: inline-block; background-color: #e8f4f8; color: #0066cc; padding: 6px 12px; border-radius: 4px; font-size: 13px; font-weight: 500; }
            .footer { background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <h1>✅ DB MODE ✅ Order Confirmed!</h1>
                <p>New Order Received - Order #${orderNumber}</p>
              </div>

              <div class="content">
                <div class="section">
                  <p style="font-size: 13px; color: #999; margin: 0 0 5px 0;">Order Reference:</p>
                  <p style="font-size: 22px; font-weight: bold; color: #c8a882; margin: 0;">#${orderNumber}</p>
                </div>

                <div class="section">
                  <div class="section-title">Customer Information</div>
                  <div class="info-row"><span class="info-label">Name:</span><span>${customerFullName}</span></div>
                  <div class="info-row"><span class="info-label">Email:</span><span>${customerEmail}</span></div>
                  <div class="info-row"><span class="info-label">Phone:</span><span>${customerPhone}</span></div>
                </div>

                <div class="section">
                  <div class="section-title">Delivery Address</div>
                  <p style="font-size: 14px; line-height: 1.8; margin: 0;">
                    ${deliveryAddress.street || "N/A"}<br/>
                    Building ${deliveryAddress.building || "N/A"}${deliveryAddress.apartment ? `, Apt ${deliveryAddress.apartment}` : ""}<br/>
                    ${deliveryAddress.city || "N/A"}, Egypt<br/>
                    ${deliveryAddress.notes ? `<br/><strong>Special Instructions:</strong> ${deliveryAddress.notes}` : "" }
                  </p>
                </div>

                <div class="section">
                  <div class="section-title">Payment Method</div>
                  <span class="badge">${paymentMethod === "instapay" ? "💳 Instapay Wallet" : "🏪 Cash on Delivery"}</span>
                </div>

                <div class="section">
                  <div class="section-title">Order Items (${items?.length ?? 0})</div>
                  <table>
                    <thead>
                      <tr>
                        <th style="text-align: left; padding: 12px; background-color: #f9f9f9; border-bottom: 2px solid #e0e0e0;">Product</th>
                        <th style="text-align: center; padding: 12px; background-color: #f9f9f9; border-bottom: 2px solid #e0e0e0;">Variant</th>
                        <th style="text-align: center; padding: 12px; background-color: #f9f9f9; border-bottom: 2px solid #e0e0e0;">Qty</th>
                        <th style="text-align: right; padding: 12px; background-color: #f9f9f9; border-bottom: 2px solid #e0e0e0;">Unit Price</th>
                        <th style="text-align: right; padding: 12px; background-color: #f9f9f9; border-bottom: 2px solid #e0e0e0;">Total</th>
                      </tr>
                    </thead>
                    <tbody>${itemsTableHTML}</tbody>
                  </table>
                </div>

                <div class="pricing-box">
                  <div class="price-row"><span>Subtotal:</span><span style="font-weight: 600;">${formatCurrency(subtotal)}</span></div>
                  ${discount > 0 ? `<div class="price-row"><span>Discount:</span><span style="color:#d9534f;">-${formatCurrency(discount)}</span></div>` : ""}
                  <div class="price-row"><span>Shipping:</span><span style="font-weight: 600;">${formatCurrency(shippingFee)}</span></div>
                  <div class="price-row total"><span>Total Amount:</span><span>${formatCurrency(total)}</span></div>
                </div>
              </div>

              <div class="footer">
                <p><strong>Sisies Admin Portal</strong> | Order Management System</p>
                <p>© 2025 Sisies Boutique. All rights reserved.</p>
                <p style="margin-top: 10px;">Order #${orderNumber} processed from DB.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const resend = new Resend(RESEND_API_KEY)

    const adminEmail = "sisies2025@gmail.com"

    const { error, id } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: adminEmail,
      subject: `✅ DB MODE ✅ Order Confirmed #${orderNumber} | ${customerFullName}`,
      html,
    })

    if (error) {
      console.error("[send-confirmation-email] ❌ send failed:", error)
      return NextResponse.json({ success: false, error }, { status: 500 })
    }

    return NextResponse.json({ success: true, orderId, orderNumber, emailId: id }, { status: 200 })
  } catch (error) {
    console.error("[send-confirmation-email] ❌ fatal:", error instanceof Error ? error.message : error)
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 })
  }
}

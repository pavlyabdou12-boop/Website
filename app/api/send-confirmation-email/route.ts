import { NextResponse } from "next/server"
import { Resend } from "resend"

const RESEND_API_KEY = process.env.RESEND_API_KEY
const SENDER_EMAIL = "Sisies <onboarding@resend.dev>"

function safeNumber(value: any): number {
  const num = Number(value)
  return isNaN(num) ? 0 : num
}

function formatCurrency(amount: any): string {
  const safeAmount = safeNumber(amount)
  return `EGP ${safeAmount.toFixed(2)}`
}

export async function POST(req: Request) {
  try {
    const payload = await req.json()

    const orderNumber = payload.orderNumber
    const customerEmail = payload.customerEmail || payload.email
    const customerFullName = payload.customerFullName || "Valued Customer"
    const customerPhone = payload.customerPhone || "N/A"
    const items = payload.items || []

    let subtotal = Number(payload.subtotal) || 0
    const discount = Number(payload.discount) || 0
    const shippingFee = Number(payload.shippingFee) || 0
    let total = Number(payload.total) || 0

    // If all totals are 0 but items exist, compute from items
    if ((subtotal === 0 || total === 0) && items.length > 0) {
      subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0)
      total = Math.max(0, subtotal - discount) + shippingFee
    }

    const paymentMethod = payload.paymentMethod || "Not specified"
    const deliveryAddress = payload.deliveryAddress || {}

    console.log("[send-confirmation-email] HIT ✅", {
      orderNumber,
      customerEmail,
      subtotal,
      total,
      firstItem: items[0]?.name,
    })

    if (!orderNumber || !customerEmail) {
      return NextResponse.json({ error: "Missing orderNumber or email" }, { status: 400 })
    }

    if (!RESEND_API_KEY) {
      console.error("[v0] ❌ RESEND_API_KEY not configured")
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    const resend = new Resend(RESEND_API_KEY)

    const itemsTableHTML =
      items.length > 0
        ? items
            .map((item: any) => {
              const itemPrice = Number(item.price) || 0
              const itemQuantity = Number(item.quantity) || 0
              const itemTotal = itemPrice * itemQuantity

              return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name || "Product"}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
            ${item.variant?.size || item.size ? item.variant?.size || item.size : ""}
            ${item.variant?.color || item.color ? item.variant?.color || item.color : ""}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${itemQuantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">EGP ${itemPrice.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">EGP ${itemTotal.toFixed(2)}</td>
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
            .admin-note { background-color: #fff3cd; border: 1px solid #ffc107; padding: 12px; border-radius: 4px; margin-bottom: 20px; font-size: 12px; color: #856404; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <h1>✅ NEW ROUTE - Order Confirmed!</h1>
                <p>New Order Received - Order #${orderNumber}</p>
              </div>

              <div class="content">
                <div class="admin-note">
                  <strong>Admin Notification:</strong> This is an order confirmation sent to admin. Customer email: <strong>${customerEmail}</strong>
                </div>

                <div class="section">
                  <p style="font-size: 13px; color: #999; margin: 0 0 5px 0;">Order Reference:</p>
                  <p style="font-size: 22px; font-weight: bold; color: #c8a882; margin: 0;">#${orderNumber}</p>
                </div>

                <div class="section">
                  <div class="section-title">Customer Information</div>
                  <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span>${customerFullName}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span>${customerEmail}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span>${customerPhone}</span>
                  </div>
                </div>

                <div class="section">
                  <div class="section-title">Delivery Address</div>
                  <p style="font-size: 14px; line-height: 1.8; margin: 0;">
                    ${deliveryAddress.street || "N/A"}<br/>
                    Building ${deliveryAddress.building || "N/A"}${deliveryAddress.apartment ? `, Apt ${deliveryAddress.apartment}` : ""}<br/>
                    ${deliveryAddress.city || "N/A"}, Egypt<br/>
                    ${deliveryAddress.notes ? `<br/><strong>Special Instructions:</strong> ${deliveryAddress.notes}` : ""}
                  </p>
                </div>

                <div class="section">
                  <div class="section-title">Payment Method</div>
                  <span class="badge">${paymentMethod === "instapay" ? "💳 Instapay Wallet" : "🏪 Cash on Delivery"}</span>
                </div>

                ${
                  items.length > 0
                    ? `
                <div class="section">
                  <div class="section-title">Order Items (${items.length})</div>
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
                `
                    : ""
                }

                <div class="pricing-box">
                  <div class="price-row">
                    <span>Subtotal:</span>
                    <span style="font-weight: 600;">EGP ${subtotal.toFixed(2)}</span>
                  </div>
                  ${
                    discount > 0
                      ? `<div class="price-row"><span>Discount:</span><span style="color: #d9534f;">-EGP ${discount.toFixed(2)}</span></div>`
                      : ""
                  }
                  <div class="price-row">
                    <span>Shipping:</span>
                    <span style="font-weight: 600;">EGP ${shippingFee.toFixed(2)}</span>
                  </div>
                  <div class="price-row total">
                    <span>Total Amount:</span>
                    <span>EGP ${total.toFixed(2)}</span>
                  </div>
                </div>

                <div style="background-color: #f0f0f0; padding: 15px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #666;">
                  <strong>Action Required:</strong><br/>
                  Review this order and prepare for fulfillment. Process payment confirmation and arrange shipment accordingly.
                </div>
              </div>

              <div class="footer">
                <p><strong>Sisies Admin Portal</strong> | Order Management System</p>
                <p>© 2025 Sisies Boutique. All rights reserved.</p>
                <p style="margin-top: 10px;">Order #${orderNumber} awaits your attention.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const adminEmail = "sisies2025@gmail.com"
    console.log(`[v0] 📧 Sending email to admin: ${adminEmail}`)

    const { error, id } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: adminEmail,
      subject: `✅ NEW ROUTE - Order Confirmed #${orderNumber} | ${customerFullName}`,
      html,
    })

    if (error) {
      console.error(`[v0] ❌ Email send failed:`, error)
      return NextResponse.json({ success: true, warning: "Order saved but email failed", orderNumber }, { status: 200 })
    }

    console.log(`[v0] ✅ Email sent successfully to admin (ID: ${id})`)

    return NextResponse.json({ success: true, orderNumber, emailId: id }, { status: 200 })
  } catch (error) {
    console.error(`[v0] ❌ Email API error:`, error instanceof Error ? error.message : error)
    return NextResponse.json({ success: true, warning: "Order saved but email service error" }, { status: 200 })
  }
}

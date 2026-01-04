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

    console.log("[v0] 📨 Email API received payload:", {
      orderNumber: payload.orderNumber,
      customerEmail: payload.customerEmail || payload.email,
      itemCount: payload.items?.length,
      subtotal: payload.subtotal,
      discount: payload.discount,
      shippingFee: payload.shippingFee,
      total: payload.total,
    })

    const {
      orderNumber,
      customerEmail,
      email,
      customerFullName,
      customerPhone,
      deliveryAddress,
      items,
      subtotal,
      discount,
      shippingFee,
      total,
      paymentMethod,
    } = payload

    const resolvedEmail = customerEmail || email

    if (!orderNumber || !resolvedEmail || !items?.length) {
      console.error("[v0] ❌ Email validation failed - missing required fields")
      console.error("[v0] Received payload keys:", Object.keys(payload))
      console.error("[v0] Items received:", items?.length ?? 0)
      return NextResponse.json({ error: "Missing email or orderNumber" }, { status: 400 })
    }

    if (!RESEND_API_KEY) {
      console.error("[v0] ❌ RESEND_API_KEY not configured")
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    const resend = new Resend(RESEND_API_KEY)

    const safeSubtotal = safeNumber(subtotal)
    const safeDiscount = safeNumber(discount)
    const safeShippingFee = safeNumber(shippingFee)
    const safeTotal = safeNumber(total)

    console.log("[v0] 💰 Converted pricing values:", {
      subtotal: safeSubtotal,
      discount: safeDiscount,
      shippingFee: safeShippingFee,
      total: safeTotal,
    })

    const itemsTableHTML = items
      .map((item: any) => {
        const itemPrice = safeNumber(item.price)
        const itemQuantity = safeNumber(item.quantity)
        const itemTotal = itemPrice * itemQuantity

        return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name || "Unknown Product"}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.variant?.size || item.variant?.color ? `${item.variant.size || ""} ${item.variant.color || ""}`.trim() : "No variant"}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${itemQuantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(itemPrice)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(itemTotal)}</td>
      </tr>
    `
      })
      .join("")

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
            .wrapper { width: 100%; background-color: #f5f5f5; padding: 20px 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #c8a882 0%, #b89968 100%); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { font-size: 28px; margin-bottom: 5px; font-weight: 600; }
            .header p { font-size: 14px; opacity: 0.95; }
            .content { padding: 30px 20px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 16px; font-weight: 600; color: #2c2c2c; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #c8a882; }
            table { width: 100%; border-collapse: collapse; }
            table th { background-color: #f9f9f9; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e0e0e0; font-size: 13px; color: #555; }
            table td { padding: 10px 12px; }
            .info-table td { padding: 8px 0; }
            .info-table td:first-child { font-weight: 600; color: #666; width: 40%; }
            .info-table td:last-child { color: #333; }
            .pricing-box { background-color: #fafafa; padding: 20px; border-left: 4px solid #c8a882; border-radius: 4px; margin: 20px 0; }
            .pricing-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
            .pricing-row.subtotal { color: #666; }
            .pricing-row.discount { color: #d9534f; }
            .pricing-row.shipping { color: #666; }
            .pricing-row.total { font-size: 16px; font-weight: 700; color: #c8a882; border-top: 1px solid #ddd; padding-top: 12px; margin-top: 8px; }
            .payment-badge { display: inline-block; background-color: #e8f4f8; color: #0066cc; padding: 6px 12px; border-radius: 4px; font-size: 13px; font-weight: 500; }
            .footer-note { background-color: #f0f0f0; padding: 15px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #666; line-height: 1.6; }
            .footer { background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999; }
            .footer p { margin: 4px 0; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <!-- Header -->
              <div class="header">
                <h1>✓ Order Confirmed!</h1>
                <p>Thank you for shopping with Sisies, ${customerFullName}!</p>
              </div>

              <div class="content">
                <!-- Order Number -->
                <div class="section">
                  <p style="font-size: 13px; color: #999; margin-bottom: 5px;">Order Reference:</p>
                  <p style="font-size: 22px; font-weight: bold; color: #c8a882;">#${orderNumber}</p>
                </div>

                <!-- Customer Details -->
                <div class="section">
                  <div class="section-title">Customer Information</div>
                  <table class="info-table">
                    <tr>
                      <td>Full Name:</td>
                      <td>${customerFullName || "N/A"}</td>
                    </tr>
                    <tr>
                      <td>Email:</td>
                      <td>${resolvedEmail}</td>
                    </tr>
                    <tr>
                      <td>Phone:</td>
                      <td>${customerPhone || "N/A"}</td>
                    </tr>
                  </table>
                </div>

                <!-- Delivery Address -->
                <div class="section">
                  <div class="section-title">Delivery Address</div>
                  <p style="font-size: 14px; line-height: 1.8; color: #333;">
                    ${deliveryAddress?.street || "N/A"}<br/>
                    Building ${deliveryAddress?.building || "N/A"}${deliveryAddress?.apartment ? `, Apartment ${deliveryAddress.apartment}` : ""}<br/>
                    ${deliveryAddress?.city || "N/A"}${deliveryAddress?.postalCode ? `, ${deliveryAddress.postalCode}` : ""}<br/>
                    ${deliveryAddress?.country || "Egypt"}<br/>
                    ${deliveryAddress?.notes ? `<br/><strong>Special Delivery Instructions:</strong><br/>${deliveryAddress.notes}` : ""}
                  </p>
                </div>

                <!-- Payment Method -->
                <div class="section">
                  <div class="section-title">Payment Method</div>
                  <span class="payment-badge">
                    ${paymentMethod === "instapay" ? "💳 Instapay Wallet" : "🏪 Cash on Delivery"}
                  </span>
                </div>

                <!-- Order Items -->
                <div class="section">
                  <div class="section-title">Order Items (${items.length})</div>
                  <table>
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Variant</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Unit Price</th>
                        <th style="text-align: right;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsTableHTML}
                    </tbody>
                  </table>
                </div>

                <!-- Pricing Summary -->
                <div class="pricing-box">
                  <div class="pricing-row subtotal">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(safeSubtotal)}</span>
                  </div>
                  ${safeDiscount > 0 ? `<div class="pricing-row discount"><span>Discount Applied:</span><span>-${formatCurrency(safeDiscount)}</span></div>` : ""}
                  <div class="pricing-row shipping">
                    <span>Shipping Fee:</span>
                    <span>${formatCurrency(safeShippingFee)}</span>
                  </div>
                  <div class="pricing-row total">
                    <span>Total Amount:</span>
                    <span>${formatCurrency(safeTotal)}</span>
                  </div>
                </div>

                <!-- Footer Note -->
                <div class="footer-note">
                  <strong>What's Next?</strong><br/>
                  Your order has been received and will be processed shortly. You'll receive a shipping confirmation email with tracking details. If you have any questions, reply to this email or contact our support team.
                </div>
              </div>

              <!-- Footer -->
              <div class="footer">
                <p><strong>Sisies</strong> | Modern Ladies Fashion</p>
                <p>© 2025 Sisies Boutique. All rights reserved.</p>
                <p style="margin-top: 10px;">Thank you for choosing us! 💝</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    console.log(`[v0] 📧 Sending confirmation email to: ${resolvedEmail}`)

    const { error, id } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: resolvedEmail,
      subject: `Order Confirmed - #${orderNumber} | Sisies`,
      html,
    })

    if (error) {
      console.error(`[v0] ❌ Email send failed for order ${orderNumber}:`, error)
      return NextResponse.json(
        {
          success: true,
          warning: "Order saved but email notification encountered an issue",
          orderNumber,
        },
        { status: 200 },
      )
    }

    console.log(`[v0] ✅ Confirmation email sent to ${resolvedEmail} (ID: ${id})`)

    return NextResponse.json(
      {
        success: true,
        message: "Order confirmed and email sent",
        orderNumber,
        resendId: id,
      },
      { status: 200 },
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error(`[v0] ❌ Email route error:`, errorMessage)

    return NextResponse.json(
      {
        success: true,
        warning: "Order saved but email notification failed",
      },
      { status: 200 },
    )
  }
}

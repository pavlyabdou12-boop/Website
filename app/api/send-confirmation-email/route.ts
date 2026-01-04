import { NextResponse } from "next/server"
import { Resend } from "resend"

const RESEND_API_KEY = process.env.RESEND_API_KEY
const SENDER_EMAIL = "Sisies <onboarding@resend.dev>"

function formatCurrency(amount: number): string {
  return `EGP ${Number(amount).toFixed(2)}`
}

export async function POST(req: Request) {
  try {
    const payload = await req.json()

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

    // -------- Validation --------
    const resolvedEmail = customerEmail || email

    if (!orderNumber || !resolvedEmail || !items?.length) {
      console.error("[v0] ❌ Email validation failed - missing required fields")
      console.error("[v0] Received payload:", { orderNumber, customerEmail, email, itemCount: items?.length })
      return NextResponse.json({ error: "Missing email or orderNumber" }, { status: 400 })
    }

    if (!RESEND_API_KEY) {
      console.error("[v0] ❌ RESEND_API_KEY not configured")
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    const resend = new Resend(RESEND_API_KEY)

    // -------- Build items table HTML --------
    const itemsTableHTML = items
      .map(
        (item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.variant?.size || item.variant?.color ? `${item.variant.size || ""} ${item.variant.color || ""}`.trim() : "N/A"}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `,
      )
      .join("")

    // -------- Build complete HTML email --------
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background-color: #c8a882; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background-color: white; padding: 20px; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 10px; border-bottom: 2px solid #c8a882; padding-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            table th { background-color: #f5f5f5; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #ddd; }
            .totals { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #c8a882; margin: 15px 0; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .total-row.grand { font-size: 18px; font-weight: bold; color: #c8a882; border-top: 2px solid #ddd; padding-top: 12px; }
            .footer { background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmed!</h1>
              <p style="margin: 5px 0;">Thank you for your purchase, ${customerFullName}!</p>
            </div>

            <div class="content">
              <!-- Order Number -->
              <div class="section">
                <div class="section-title">Order Number</div>
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #c8a882;">#${orderNumber}</p>
              </div>

              <!-- Customer Details -->
              <div class="section">
                <div class="section-title">Customer Details</div>
                <table>
                  <tr>
                    <td style="padding: 8px;"><strong>Name:</strong></td>
                    <td style="padding: 8px;">${customerFullName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px;"><strong>Email:</strong></td>
                    <td style="padding: 8px;">${resolvedEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px;"><strong>Phone:</strong></td>
                    <td style="padding: 8px;">${customerPhone}</td>
                  </tr>
                </table>
              </div>

              <!-- Delivery Address -->
              <div class="section">
                <div class="section-title">Delivery Address</div>
                <p style="margin: 0; line-height: 1.8;">
                  ${deliveryAddress.street}<br/>
                  Building ${deliveryAddress.building}${deliveryAddress.apartment ? `, Apartment ${deliveryAddress.apartment}` : ""}<br/>
                  ${deliveryAddress.city}${deliveryAddress.postalCode ? `, ${deliveryAddress.postalCode}` : ""}<br/>
                  ${deliveryAddress.country || "Egypt"}<br/>
                  ${deliveryAddress.notes ? `<br/><strong>Delivery Notes:</strong> ${deliveryAddress.notes}` : ""}
                </p>
              </div>

              <!-- Payment Method -->
              <div class="section">
                <div class="section-title">Payment Method</div>
                <p style="margin: 0;">
                  <strong>${paymentMethod === "instapay" ? "Instapay Wallet" : "Cash on Delivery"}</strong>
                </p>
              </div>

              <!-- Items -->
              <div class="section">
                <div class="section-title">Order Items</div>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Variant</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsTableHTML}
                  </tbody>
                </table>
              </div>

              <!-- Pricing Summary -->
              <div class="totals">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>${formatCurrency(subtotal)}</span>
                </div>
                ${discount > 0 ? `<div class="total-row"><span>Discount:</span><span>-${formatCurrency(discount)}</span></div>` : ""}
                <div class="total-row">
                  <span>Shipping Fee:</span>
                  <span>${formatCurrency(shippingFee)}</span>
                </div>
                <div class="total-row grand">
                  <span>Total Amount Due:</span>
                  <span>${formatCurrency(total)}</span>
                </div>
              </div>

              <!-- Footer Note -->
              <div style="background-color: #f0f0f0; padding: 12px; border-radius: 4px; margin-top: 15px;">
                <p style="margin: 0; font-size: 13px; color: #555;">
                  If you have any questions, please reply to this email or contact our customer support.
                </p>
              </div>
            </div>

            <div class="footer">
              <p style="margin: 0;">© 2025 Sisies | Modern Ladies Fashion</p>
              <p style="margin: 5px 0;">Thank you for shopping with us!</p>
            </div>
          </div>
        </body>
      </html>
    `

    // -------- Send email to customer --------
    console.log(`[v0] 📧 Sending confirmation email to: ${resolvedEmail}`)

    const { error, id } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: resolvedEmail,
      subject: `Order Confirmed - #${orderNumber}`,
      html,
    })

    if (error) {
      console.error(`[v0] ❌ Email send failed for order ${orderNumber}:`, error)
      // Return success anyway - order is already saved to database
      return NextResponse.json(
        {
          success: true,
          warning: "Order saved but email sending encountered an issue. We will contact you soon.",
          orderNumber,
        },
        { status: 200 },
      )
    }

    console.log(`[v0] ✅ Confirmation email sent successfully to ${resolvedEmail} (Resend ID: ${id})`)

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
    console.error(`[v0] ❌ Unexpected error in email route:`, errorMessage)

    // Return success anyway - the order is already saved
    return NextResponse.json(
      {
        success: true,
        warning: "Order saved but email notification failed. We will contact you.",
      },
      { status: 200 },
    )
  }
}

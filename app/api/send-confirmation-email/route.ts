import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  size?: string
}

interface OrderData {
  orderNumber: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  paymentMethod: "instapay" | "cod"
  items: OrderItem[]
  subtotal: number
  discount?: number
  shipping: number
  total: number
}

const generateEmailHTML = (data: OrderData): string => {
  const itemsHTML = data.items
    .map(
      (item) =>
        `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151; text-align: center;">${item.size ? item.size : "One Size"}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151; text-align: center;">x${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151; text-align: right;">EGP ${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `,
    )
    .join("")

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - Sisies Boutique</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #d4a574 0%, #c89968 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
    .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 30px 20px; }
    .order-number { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .order-number .label { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .order-number .number { color: #d4a574; font-size: 32px; font-weight: bold; margin-top: 8px; }
    .section { margin: 30px 0; }
    .section-title { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 12px; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; color: #4b5563; }
    .info-label { color: #6b7280; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .summary { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .summary-row { display: flex; justify-content: space-between; padding: 10px 0; color: #374151; }
    .summary-row.total { border-top: 2px solid #d4a574; padding-top: 12px; font-size: 18px; font-weight: bold; color: #d4a574; }
    .payment-method { background: #f3f4f6; padding: 12px; border-radius: 6px; color: #374151; font-size: 14px; }
    .button { display: inline-block; background: #d4a574; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 500; margin-top: 20px; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Confirmed! ✓</h1>
      <p>Thank you for your purchase from Sisies Boutique</p>
    </div>
    
    <div class="content">
      <div class="order-number">
        <div class="label">Order Number</div>
        <div class="number">${data.orderNumber}</div>
      </div>
      
      <p style="color: #4b5563;">Hi ${data.firstName},</p>
      <p style="color: #4b5563;">Your order has been confirmed and will be processed shortly. Below is a summary of your purchase.</p>
      
      <div class="section">
        <div class="section-title">Order Items</div>
        <table>
          <thead style="background: #f3f4f6;">
            <tr>
              <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 600; font-size: 12px;">Product</th>
              <th style="padding: 12px; text-align: center; color: #6b7280; font-weight: 600; font-size: 12px;">Size</th>
              <th style="padding: 12px; text-align: center; color: #6b7280; font-weight: 600; font-size: 12px;">Qty</th>
              <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 600; font-size: 12px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
      </div>
      
      <div class="summary">
        <div class="summary-row">
          <span>Subtotal</span>
          <span>EGP ${data.subtotal.toFixed(2)}</span>
        </div>
        ${data.discount ? `<div class="summary-row"><span>Discount</span><span>- EGP ${data.discount.toFixed(2)}</span></div>` : ""}
        <div class="summary-row">
          <span>Shipping</span>
          <span>EGP ${data.shipping.toFixed(2)}</span>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <span>EGP ${data.total.toFixed(2)}</span>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Delivery Information</div>
        <div class="info-row">
          <span class="info-label">Name:</span>
          <span>${data.firstName} ${data.lastName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phone:</span>
          <span>${data.phone}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Address:</span>
          <span>${data.address}</span>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Payment Method</div>
        <div class="payment-method">
          ${data.paymentMethod === "instapay" ? "💳 Instapay Wallet" : "🚚 Cash on Delivery"}
        </div>
      </div>
      
      <p style="color: #4b5563; margin-top: 30px;">If you have any questions, please don't hesitate to contact us.</p>
      <p style="color: #6b7280; font-size: 14px;">Best regards,<br><strong>Sisies Boutique Team</strong></p>
    </div>
    
    <div class="footer">
      <p>© 2025 Sisies Boutique. All rights reserved.</p>
      <p>This is an automated email. Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>
  `
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      firstName,
      orderNumber,
      orderData,
    }: { email: string; firstName: string; orderNumber: string; orderData: OrderData } = body

    if (!email || !firstName || !orderNumber || !orderData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Sending order confirmation email to:", email)
    console.log("[v0] Order Number:", orderNumber)
    console.log("[v0] Total: EGP", orderData.total.toFixed(2))

    const emailHTML = generateEmailHTML(orderData)

    const response = await resend.emails.send({
      from: "Sisies Boutique <orders@sisies.com>",
      to: email,
      cc: ["haneenosman60@gmail.com", "gannaosman2009@gmail.com", "sisies2025@gmail.com"],
      subject: `Order Confirmation - Order #${orderNumber}`,
      html: emailHTML,
    })

    if (response.error) {
      console.error("[v0] Resend API error:", response.error)
      return NextResponse.json({ error: "Failed to send email", details: response.error }, { status: 500 })
    }

    console.log("[v0] Email sent successfully. ID:", response.data?.id)

    return NextResponse.json({
      success: true,
      message: "Order confirmation email sent successfully",
      emailId: response.data?.id,
    })
  } catch (error) {
    console.error("[v0] Error sending confirmation email:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: "Failed to process email request", details: errorMessage }, { status: 500 })
  }
}

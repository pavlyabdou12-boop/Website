import { Resend } from "resend"
import { type NextRequest, NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

const ORDER_CONFIRMATION_EMAIL_TEMPLATE = (data: any) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #c4a382; padding: 20px; text-align: center; color: white; }
      .header h1 { margin: 0; font-size: 28px; }
      .section { padding: 20px; border-bottom: 1px solid #ddd; }
      .order-number { background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
      .order-number p { margin: 5px 0; }
      .order-number .number { font-size: 24px; font-weight: bold; color: #c4a382; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
      th { background-color: #f5f5f5; font-weight: bold; }
      .total-row { font-weight: bold; font-size: 18px; }
      .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      .address-box { background-color: #f9f9f9; padding: 15px; border-left: 3px solid #c4a382; margin: 20px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Order Confirmed!</h1>
      </div>

      <div class="section">
        <p>Hello ${data.firstName},</p>
        <p>Thank you for your purchase! Your order has been confirmed and is being prepared for shipment.</p>
      </div>

      <div class="order-number">
        <p>Order Number</p>
        <p class="number">${data.orderNumber}</p>
      </div>

      <div class="section">
        <h3>Order Details</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Size</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.items
              .map(
                (item: any) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.size}</td>
                <td>${item.quantity}</td>
                <td>EGP ${item.price.toFixed(2)}</td>
                <td>EGP ${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 20px;">
          <p>Subtotal: <strong>EGP ${data.subtotal.toFixed(2)}</strong></p>
          ${data.discount > 0 ? `<p>Discount: <strong>-EGP ${data.discount.toFixed(2)}</strong></p>` : ""}
          <p>Shipping: <strong>EGP ${data.shipping.toFixed(2)}</strong></p>
          <p class="total-row" style="font-size: 20px;">Total: EGP ${data.total.toFixed(2)}</p>
        </div>
      </div>

      <div class="section">
        <h3>Shipping Address</h3>
        <div class="address-box">
          <p><strong>${data.firstName} ${data.lastName}</strong></p>
          <p>${data.address}</p>
          <p>Phone: ${data.phone}</p>
        </div>
      </div>

      <div class="section">
        <h3>Payment Method</h3>
        <p>${data.paymentMethod === "instapay" ? "Instapay Wallet" : "Cash on Delivery"}</p>
      </div>

      <div class="section">
        <h3>Next Steps</h3>
        <p>Your order will be processed and shipped within 1-2 business days. You'll receive a tracking number via email once your package ships.</p>
        <p>If you have any questions, please don't hesitate to contact us at sisies2025@gmail.com or call 01065161086</p>
      </div>

      <div class="footer">
        <p>Sisies - Elegant Fashion for Modern Women</p>
        <p>Thank you for shopping with us!</p>
      </div>
    </div>
  </body>
</html>
`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, orderNumber, orderData } = body

    const customerEmailResult = await resend.emails.send({
      from: "Sisies <noreply@sisies.local>",
      to: email,
      cc: ["sisies2025@gmail.com"],
      subject: `Order Confirmed - Your Order Number: ${orderNumber}`,
      html: ORDER_CONFIRMATION_EMAIL_TEMPLATE({
        firstName,
        lastName: orderData.lastName,
        orderNumber,
        items: orderData.items,
        subtotal: orderData.subtotal,
        discount: orderData.discount,
        shipping: orderData.shipping,
        total: orderData.total,
        address: orderData.address,
        phone: orderData.phone,
        paymentMethod: orderData.paymentMethod,
      }),
    })

    if (customerEmailResult.error) {
      console.error("[v0] Failed to send customer email:", customerEmailResult.error)
      return NextResponse.json(
        { error: "Failed to send email", details: customerEmailResult.error.message },
        { status: 500 },
      )
    }

    console.log("[v0] Order confirmation email sent successfully to", email)

    return NextResponse.json({
      success: true,
      message: "Order confirmation email sent successfully",
      emailId: customerEmailResult.data?.id,
    })
  } catch (error) {
    console.error("[v0] Error processing email:", error)
    return NextResponse.json({ error: "Failed to send email", details: String(error) }, { status: 500 })
  }
}

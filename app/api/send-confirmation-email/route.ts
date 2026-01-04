import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(req: Request) {
  try {
    const { email, firstName, orderNumber, orderData } = await req.json()

    if (!email || !orderNumber) {
      return NextResponse.json({ error: "Missing email or orderNumber" }, { status: 400 })
    }

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 })
    }

    const resend = new Resend(resendKey)

    const itemsHtml = Array.isArray(orderData?.items)
      ? orderData.items
          .map((it: any) => `<li>${it.name} — Qty: ${it.quantity} — EGP ${(it.price * it.quantity).toFixed(2)}</li>`)
          .join("")
      : ""

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Thank you${firstName ? `, ${firstName}` : ""}!</h2>
        <p>Your order has been confirmed.</p>
        <p><b>Order Number:</b> ${orderNumber}</p>
        <p><b>Customer Email:</b> ${email}</p>

        <h3>Order details</h3>
        <ul>${itemsHtml}</ul>

        <p><b>Subtotal:</b> EGP ${Number(orderData?.subtotal ?? 0).toFixed(2)}</p>
        <p><b>Discount:</b> EGP ${Number(orderData?.discount ?? 0).toFixed(2)}</p>
        <p><b>Shipping:</b> EGP ${Number(orderData?.shipping ?? 0).toFixed(2)}</p>
        <p><b>Total:</b> EGP ${Number(orderData?.total ?? 0).toFixed(2)}</p>

        <hr/>
        <p>If you have any questions, reply to this email.</p>
        <p>— Sisies</p>
      </div>
    `

    const { error } = await resend.emails.send({
      from: "Sisies <onboarding@resend.dev>",
      to: ["sisies2025@gmail.com"], // Send to verified admin email
      subject: `Order Confirmed - ${orderNumber}`,
      html,
    })

    if (error) {
      console.log("[v0] Email send error:", error)
      return NextResponse.json({
        ok: true,
        warning: "Order saved but email notification had issues. We will contact you shortly.",
      })
    }

    console.log("[v0] ✅ Order confirmation email sent to admin for order:", orderNumber)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.log("[v0] Unexpected error in email route:", e?.message)
    return NextResponse.json({
      ok: true,
      warning: "Order saved but we had trouble sending confirmation. We will contact you soon.",
    })
  }
}

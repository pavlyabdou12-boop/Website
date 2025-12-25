import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, orderNumber, orderData } = body

    console.log("[v0] ===== ORDER CONFIRMATION EMAIL =====")
    console.log("[v0] To:", email)
    console.log("[v0] CC: sisies2025@gmail.com, haneenosman60@gmail.com, gannaosman2009@gmail.com")
    console.log("[v0] Order Number:", orderNumber)
    console.log("[v0] Customer:", firstName)
    console.log("[v0] Total:", `EGP ${orderData.total.toFixed(2)}`)
    console.log("[v0] Items:")
    orderData.items.forEach((item: any) => {
      console.log(
        `[v0]   - ${item.name} (Size: ${item.size}) x${item.quantity} = EGP ${(item.price * item.quantity).toFixed(2)}`,
      )
    })
    console.log("[v0] =====================================")

    // This works in v0 preview by logging the email details
    // When you deploy to production, you can add a proper email service like Resend, SendGrid, or AWS SES

    return NextResponse.json({
      success: true,
      message: "Email sent successfully (logged to console in v0 preview)",
    })
  } catch (error) {
    console.error("[v0] Error processing email:", error)
    return NextResponse.json({ error: "Failed to send email", details: String(error) }, { status: 500 })
  }
}

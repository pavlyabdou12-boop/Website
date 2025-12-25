import { Resend } from "resend"
import { type NextRequest, NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

const CONTACT_FORM_TEMPLATE = (data: any) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #c4a382; padding: 20px; text-align: center; color: white; }
      .header h1 { margin: 0; font-size: 24px; }
      .section { padding: 20px; border-bottom: 1px solid #ddd; }
      .message-box { background-color: #f9f9f9; padding: 15px; border-left: 3px solid #c4a382; margin: 20px 0; font-style: italic; }
      .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>New Contact Form Submission</h1>
      </div>

      <div class="section">
        <h3>Contact Information</h3>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
      </div>

      <div class="section">
        <h3>Message</h3>
        <div class="message-box">
          ${data.message
            .split("\n")
            .map((line: string) => `<p>${line || "&nbsp;"}</p>`)
            .join("")}
        </div>
      </div>

      <div class="footer">
        <p>This message was submitted through the Sisies contact form.</p>
      </div>
    </div>
  </body>
</html>
`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const adminEmailResult = await resend.emails.send({
      from: "Sisies Contact Form <noreply@sisies.local>",
      to: "sisies2025@gmail.com",
      cc: ["haneenosman60@gmail.com"],
      subject: `New Contact Form: ${subject}`,
      html: CONTACT_FORM_TEMPLATE({ name, email, subject, message }),
    })

    if (adminEmailResult.error) {
      console.error("[v0] Failed to send admin email:", adminEmailResult.error)
      return NextResponse.json(
        { error: "Failed to send email", details: adminEmailResult.error.message },
        { status: 500 },
      )
    }

    const userEmailResult = await resend.emails.send({
      from: "Sisies <noreply@sisies.local>",
      to: email,
      subject: "We received your message - Sisies",
      html: `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #c4a382; padding: 20px; text-align: center; color: white; }
      .header h1 { margin: 0; font-size: 24px; }
      .section { padding: 20px; }
      .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Thank You!</h1>
      </div>

      <div class="section">
        <p>Hello ${name},</p>
        <p>We received your message and appreciate you reaching out to us. Our team will review your inquiry and get back to you within 24-48 hours.</p>
        <p>If your matter is urgent, you can also call us at 01065161086.</p>
        <p>Thank you for your patience!</p>
      </div>

      <div class="footer">
        <p>Sisies - Elegant Fashion for Modern Women</p>
      </div>
    </div>
  </body>
</html>
      `,
    })

    if (userEmailResult.error) {
      console.error("[v0] Failed to send user confirmation email:", userEmailResult.error)
    }

    console.log("[v0] Contact form emails sent successfully")

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully! We'll be in touch soon.",
    })
  } catch (error) {
    console.error("[v0] Error processing contact email:", error)
    return NextResponse.json({ error: "Failed to send email", details: String(error) }, { status: 500 })
  }
}

// Health check endpoint to verify Supabase connection
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error("[v0] ❌ Missing Supabase environment variables")
      return NextResponse.json(
        {
          ok: false,
          error: "Missing environment variables",
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      )
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
      },
    })

    // Test connection by querying tables
    const { data, error } = await supabase.from("orders").select("count")

    if (error) {
      console.error("[v0] ❌ Supabase connection failed:", error.message)
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      )
    }

    console.log("[v0] ✅ Supabase connection healthy")

    return NextResponse.json({
      ok: true,
      message: "Supabase connection is healthy",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[v0] ❌ Health check error:", errorMessage)

    return NextResponse.json(
      {
        ok: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

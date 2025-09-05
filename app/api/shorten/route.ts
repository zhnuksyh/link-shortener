import { isValidUrl, normalizeUrl } from "@/lib/utils/url-validator"
import { createTinyURL } from "@/lib/services/tinyurl"
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ 
        error: "Please create an account to shorten links and track analytics" 
      }, { status: 401 })
    }

    const { originalUrl } = await request.json()

    if (!originalUrl) {
      return NextResponse.json({ error: "Original URL is required" }, { status: 400 })
    }

    // Validate and normalize URL
    if (!isValidUrl(originalUrl)) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    const normalizedUrl = normalizeUrl(originalUrl)

    try {
      const { shortUrl, alias } = await createTinyURL(normalizedUrl)

      return NextResponse.json({
        originalUrl: normalizedUrl,
        shortCode: alias,
        shortUrl: shortUrl,
        createdAt: new Date().toISOString(),
      })
    } catch (tinyUrlError) {
      console.error("TinyURL error:", tinyUrlError)
      return NextResponse.json(
        {
          error: "Failed to create shortened URL. Please try again.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

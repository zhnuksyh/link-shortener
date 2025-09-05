import { createClient } from "@/lib/supabase/server"
import { isValidUrl, normalizeUrl } from "@/lib/utils/url-validator"
import { createTinyURL } from "@/lib/services/tinyurl"
import { generateUniqueShortCode } from "@/lib/utils/short-code-generator"
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    // Check if user already has this URL shortened
    const { data: existingLink } = await supabase
      .from("links")
      .select("*")
      .eq("original_url", normalizedUrl)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single()

    if (existingLink) {
      return NextResponse.json({
        id: existingLink.id,
        originalUrl: existingLink.original_url,
        shortCode: existingLink.tinyurl_alias || existingLink.short_code,
        shortUrl: existingLink.external_short_url || `${request.nextUrl.origin}/s/${existingLink.short_code}`,
        createdAt: existingLink.created_at,
      })
    }

    try {
      const { shortUrl, alias } = await createTinyURL(normalizedUrl)

      // Create new shortened link with our own domain
      const { data: newLink, error: insertError } = await supabase
        .from("links")
        .insert({
          original_url: normalizedUrl,
          short_code: alias, // Use the generated short code
          tinyurl_alias: alias, // Keep for compatibility
          external_short_url: shortUrl,
          user_id: user.id,
        })
        .select()
        .single()

      if (insertError) {
        console.error("Database insert error:", insertError)
        return NextResponse.json({ error: "Failed to create shortened link" }, { status: 500 })
      }

      return NextResponse.json({
        id: newLink.id,
        originalUrl: newLink.original_url,
        shortCode: newLink.tinyurl_alias,
        shortUrl: newLink.external_short_url,
        createdAt: newLink.created_at,
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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Get user's links with pagination (all links, not just active ones)
    const { data: links, error: fetchError } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (fetchError) {
      console.error("Database fetch error:", fetchError)
      return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 })
    }

    // Get total count for pagination (all links, not just active ones)
    const { count } = await supabase
      .from("links")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    const formattedLinks = links.map((link) => ({
      id: link.id,
      originalUrl: link.original_url,
      shortCode: link.tinyurl_alias || link.short_code,
      shortUrl: link.external_short_url || `${request.nextUrl.origin}/s/${link.short_code}`,
      isActive: link.is_active,
      createdAt: link.created_at,
      updatedAt: link.updated_at,
    }))

    return NextResponse.json({
      links: formattedLinks,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { parseJWTFromCookies, createClientWithManualAuth } from "@/lib/supabase/jwt-parser"
import { isValidUrl, normalizeUrl } from "@/lib/utils/url-validator"
import { createTinyURLShortLink } from "@/lib/services/tinyurl"
import { type NextRequest, NextResponse } from "next/server"
import type { User } from "@supabase/supabase-js"

async function processGetLinksRequestManual(request: NextRequest, user: User, supabase: any) {
  try {
    console.log('Manual Auth: Getting links for user:', user.id)
    
    const { data: links, error } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error('Manual Auth: Error fetching links:', error)
      return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 })
    }

    console.log('Manual Auth: Successfully fetched links:', links?.length || 0)
    
    return NextResponse.json(links || [])
  } catch (error) {
    console.error('Manual Auth: Error in processGetLinksRequest:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Manual Auth API: Starting request')
    
    // Parse JWT manually
    const jwtPayload = await parseJWTFromCookies(request)
    
    if (!jwtPayload || !jwtPayload.user) {
      console.log('Manual Auth API: No valid JWT payload or user')
      return NextResponse.json({ 
        error: "Unauthorized - No valid session",
        details: "JWT parsing failed or user not found"
      }, { status: 401 })
    }
    
    console.log('Manual Auth API: Valid JWT found for user:', jwtPayload.user.email)
    
    // Create Supabase client
    const supabase = await createClientWithManualAuth()
    
    // Process the request with the authenticated user
    const result = await processGetLinksRequestManual(request, jwtPayload.user, supabase)
    
    // Add CORS headers
    if (result instanceof NextResponse) {
      result.headers.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*')
      result.headers.set('Access-Control-Allow-Credentials', 'true')
    }
    
    return result
  } catch (error) {
    console.error("Manual Auth API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Manual Auth API POST: Starting request')
    
    // Parse JWT manually
    const jwtPayload = await parseJWTFromCookies(request)
    
    if (!jwtPayload || !jwtPayload.user) {
      console.log('Manual Auth API POST: No valid JWT payload or user')
      return NextResponse.json({ 
        error: "Unauthorized - No valid session",
        details: "JWT parsing failed or user not found"
      }, { status: 401 })
    }
    
    console.log('Manual Auth API POST: Valid JWT found for user:', jwtPayload.user.email)
    
    // Create Supabase client
    const supabase = await createClientWithManualAuth()
    
    // Process the POST request
    const { originalUrl, title } = await request.json()

    if (!originalUrl) {
      return NextResponse.json({ error: "Original URL is required" }, { status: 400 })
    }

    if (!isValidUrl(originalUrl)) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    const normalizedUrl = normalizeUrl(originalUrl)

    // Check if user already has this URL shortened
    const { data: existingLink, error: existingLinkError } = await supabase
      .from("links")
      .select("*")
      .eq("original_url", normalizedUrl)
      .eq("user_id", jwtPayload.user.id)
      .eq("is_active", true)
      .maybeSingle()

    if (existingLinkError && existingLinkError.code !== 'PGRST116') {
      console.log('Manual Auth: Error checking for existing link:', existingLinkError)
    }

    if (existingLink) {
      return NextResponse.json({
        id: existingLink.id,
        originalUrl: existingLink.original_url,
        shortCode: existingLink.tinyurl_alias,
        shortUrl: existingLink.external_short_url,
        title: existingLink.title,
        createdAt: existingLink.created_at,
      })
    }

    try {
      const shortLink = await createTinyURLShortLink(normalizedUrl)
      
      const { data: newLink, error: insertError } = await supabase
        .from("links")
        .insert({
          user_id: jwtPayload.user.id,
          original_url: normalizedUrl,
          tinyurl_alias: shortLink.alias,
          external_short_url: shortLink.shortUrl,
          title: title || null,
          is_active: true,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Manual Auth: Error inserting link:', insertError)
        return NextResponse.json({ error: "Failed to create short link" }, { status: 500 })
      }

      return NextResponse.json({
        id: newLink.id,
        originalUrl: newLink.original_url,
        shortCode: newLink.tinyurl_alias,
        shortUrl: newLink.external_short_url,
        title: newLink.title,
        createdAt: newLink.created_at,
      })
    } catch (error) {
      console.error('Manual Auth: Error creating short link:', error)
      return NextResponse.json({ error: "Failed to create short link" }, { status: 500 })
    }
  } catch (error) {
    console.error("Manual Auth API POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

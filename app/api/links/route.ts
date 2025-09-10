import { createClient } from "@/lib/supabase/server"
import { isValidUrl, normalizeUrl } from "@/lib/utils/url-validator"
import { createTinyURLShortLink } from "@/lib/services/tinyurl"
import { type NextRequest, NextResponse } from "next/server"
import type { User } from "@supabase/supabase-js"

async function processLinksRequest(request: NextRequest, user: User, supabase: any) {
  const { originalUrl, title } = await request.json()

  if (!originalUrl) {
    return NextResponse.json({ error: "Original URL is required" }, { status: 400 })
  }

  // Validate and normalize URL
  if (!isValidUrl(originalUrl)) {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
  }

  const normalizedUrl = normalizeUrl(originalUrl)

  // Check if user already has this URL shortened
  console.log('Checking for existing link:', { normalizedUrl, userId: user.id })
  const { data: existingLink, error: existingLinkError } = await supabase
    .from("links")
    .select("*")
    .eq("original_url", normalizedUrl)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle()

  console.log('Existing link check result:', { existingLink, error: existingLinkError })

  // If there's an error (not just "no rows found"), log it but continue
  if (existingLinkError && existingLinkError.code !== 'PGRST116') {
    console.log('Error checking for existing link:', existingLinkError)
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
    console.log('Creating TinyURL for:', normalizedUrl, 'user:', user.id)
    const { shortUrl, alias, isExternal } = await createTinyURLShortLink(normalizedUrl, user.id)
    console.log('TinyURL created successfully:', { shortUrl, alias, isExternal })

    // Check if this TinyURL alias already exists for any user
    // This handles the case where TinyURL returns the same alias for the same URL
    const { data: existingAliasLink, error: aliasCheckError } = await supabase
      .from("links")
      .select("*")
      .eq("tinyurl_alias", alias)
      .maybeSingle()

    if (aliasCheckError && aliasCheckError.code !== 'PGRST116') {
      console.log('Error checking for existing alias:', aliasCheckError)
    }

    // If the alias already exists, check if it's for the same URL
    if (existingAliasLink) {
      if (existingAliasLink.original_url === normalizedUrl) {
        // Same URL, same alias - this is expected TinyURL behavior
        // Check if this user already has this link
        if (existingAliasLink.user_id === user.id) {
          // User already has this link, return the existing one
          return NextResponse.json({
            id: existingAliasLink.id,
            originalUrl: existingAliasLink.original_url,
            shortCode: existingAliasLink.tinyurl_alias,
            shortUrl: existingAliasLink.external_short_url,
            title: existingAliasLink.title,
            createdAt: existingAliasLink.created_at,
          })
        } else {
          // Different user, same URL - create a new record for this user
          // This allows multiple users to track the same shortened URL
          const insertData = {
            original_url: normalizedUrl,
            short_code: alias.length <= 10 ? alias : null,
            user_id: user.id,
            tinyurl_alias: alias,
            external_short_url: shortUrl,
            title: title?.trim() || null,
          }

          const { data: newLink, error: insertError } = await supabase
            .from("links")
            .insert(insertData)
            .select()
            .single()

          if (insertError) {
            console.error("Database insert error for existing alias:", insertError)
            return NextResponse.json({ 
              error: "Failed to save the shortened link to your account.",
              details: insertError.message 
            }, { status: 500 })
          }

          return NextResponse.json({
            id: newLink.id,
            originalUrl: newLink.original_url,
            shortCode: newLink.tinyurl_alias,
            shortUrl: newLink.external_short_url,
            title: newLink.title,
            createdAt: newLink.created_at,
          })
        }
      } else {
        // Same alias but different URL - this shouldn't happen with TinyURL
        // but we'll handle it gracefully by creating a new record
        console.warn('TinyURL alias collision detected:', { alias, existingUrl: existingAliasLink.original_url, newUrl: normalizedUrl })
      }
    }

    // Create new shortened link - only store TinyURL data
    const insertData = {
      original_url: normalizedUrl,
      short_code: alias.length <= 10 ? alias : null, // Only set if it fits the original constraint
      user_id: user.id,
      tinyurl_alias: alias,
      external_short_url: shortUrl,
      title: title?.trim() || null,
    }

    const { data: newLink, error: insertError } = await supabase
      .from("links")
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      console.error("Database insert error:", insertError)
      console.error("Insert data:", insertData)
      
      // Provide more specific database error messages
      let userErrorMessage = "Failed to save the shortened link to your account."
      let statusCode = 500
      
      if (insertError.message.includes('duplicate') || insertError.message.includes('unique')) {
        userErrorMessage = "This link already exists in your account. Please check your dashboard for the existing shortened link."
        statusCode = 409
      } else if (insertError.message.includes('foreign key') || insertError.message.includes('constraint')) {
        userErrorMessage = "There was an issue with your account data. Please try logging out and back in, then try again."
        statusCode = 400
      } else if (insertError.message.includes('timeout')) {
        userErrorMessage = "Database operation timed out. Please try again."
        statusCode = 504
      }
      
      return NextResponse.json({ 
        error: userErrorMessage,
        details: insertError.message 
      }, { status: statusCode })
    }

    return NextResponse.json({
      id: newLink.id,
      originalUrl: newLink.original_url,
      shortCode: newLink.tinyurl_alias,
      shortUrl: newLink.external_short_url,
      title: newLink.title,
      createdAt: newLink.created_at,
    })
  } catch (shortUrlError) {
    console.error("TinyURL creation error:", shortUrlError)
    const errorMessage = shortUrlError instanceof Error ? shortUrlError.message : "Unknown error"
    
    // Provide more specific error messages to the user
    let userErrorMessage = "Failed to create shortened URL. Please try again later."
    let statusCode = 500
    
    if (errorMessage.includes('rejected this URL') || errorMessage.includes('blocked')) {
      userErrorMessage = "This URL cannot be shortened. TinyURL may have blocked this domain or the URL may be invalid. Please try a different URL."
      statusCode = 400
    } else if (errorMessage.includes('Network error') || errorMessage.includes('fetch')) {
      userErrorMessage = "Network error: Unable to connect to the shortening service. Please check your internet connection and try again."
      statusCode = 503
    } else if (errorMessage.includes('timeout')) {
      userErrorMessage = "Request timeout: The shortening service is taking too long to respond. Please try again."
      statusCode = 504
    } else if (errorMessage.includes('Invalid response') || errorMessage.includes('Empty response')) {
      userErrorMessage = "Invalid response from the shortening service. Please try again."
      statusCode = 502
    } else if (errorMessage.includes('Invalid URL format')) {
      userErrorMessage = "The provided URL format is invalid. Please check the URL and try again."
      statusCode = 400
    }
    
    return NextResponse.json(
      {
        error: userErrorMessage,
        details: errorMessage, // Include technical details for debugging
      },
      { status: statusCode },
    )
  }
}

async function processGetLinksRequest(request: NextRequest, user: User, supabase: any) {
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
    shortCode: link.tinyurl_alias,
    shortUrl: link.external_short_url,
    title: link.title,
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
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: "Unauthorized",
        details: authError?.message || "No user found in session"
      }, { status: 401 })
    }
    
    // Process the links request with the authenticated user
    return await processLinksRequest(request, user, supabase)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: "Unauthorized",
        details: authError?.message || "No user found in session"
      }, { status: 401 })
    }
    
    // Process the get links request with the authenticated user
    return await processGetLinksRequest(request, user, supabase)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}

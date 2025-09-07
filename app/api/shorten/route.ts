import { isValidUrl, normalizeUrl } from "@/lib/utils/url-validator"
import { createTinyURLShortLink } from "@/lib/services/tinyurl"
import { createApiClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import type { User } from "@supabase/supabase-js"

async function processShortenRequest(request: NextRequest, user: User, supabase: any) {
  const { originalUrl, title } = await request.json()

  if (!originalUrl) {
    return NextResponse.json({ error: "Original URL is required" }, { status: 400 })
  }

  // Validate and normalize URL
  if (!isValidUrl(originalUrl)) {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
  }

  const normalizedUrl = normalizeUrl(originalUrl)

  try {
    console.log('Creating TinyURL for:', normalizedUrl, 'user:', user.id)
    const { shortUrl, alias, isExternal } = await createTinyURLShortLink(normalizedUrl, user.id)
    console.log('TinyURL created successfully:', { shortUrl, alias, isExternal })

    return NextResponse.json({
      originalUrl: normalizedUrl,
      shortCode: alias,
      shortUrl: shortUrl,
      title: title?.trim() || undefined,
      createdAt: new Date().toISOString(),
      isExternal: isExternal,
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

export async function POST(request: NextRequest) {
  try {
    // Enhanced debugging
    console.log('=== API SHORTEN DEBUG START ===')
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
    })
    
    // Log all cookies
    const cookies = request.cookies.getAll()
    console.log('Request cookies:', cookies.map(c => ({ 
      name: c.name, 
      hasValue: !!c.value,
      valueLength: c.value?.length || 0
    })))
    
    const supabase = await createApiClient()

    // Get the authenticated user - this is the most secure method
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    
    console.log('Auth result:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      error: authError?.message,
      errorCode: authError?.status,
    })
    
    if (authError || !user) {
      console.log('Authentication failed:', authError)
      console.log('=== API SHORTEN DEBUG END ===')
      return NextResponse.json({ 
        error: "Please create an account to shorten links and track analytics" 
      }, { status: 401 })
    }

    console.log('=== API SHORTEN DEBUG END ===')
    // Process the shorten request with the authenticated user
    return await processShortenRequest(request, user, supabase)
  } catch (error) {
    console.error("API error:", error)
    console.log('=== API SHORTEN DEBUG END ===')
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

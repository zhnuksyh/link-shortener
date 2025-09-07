import { isValidUrl, normalizeUrl } from "@/lib/utils/url-validator"
import { createTinyURLShortLink } from "@/lib/services/tinyurl"
import { createApiClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createApiClient()

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
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

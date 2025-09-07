import { isValidUrl, normalizeUrl } from "@/lib/utils/url-validator"
import { createTinyURLShortLink } from "@/lib/services/tinyurl"
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
      console.log('Creating TinyURL for:', normalizedUrl, 'user:', user.id)
      const { shortUrl, alias, isExternal } = await createTinyURLShortLink(normalizedUrl, user.id)
      console.log('TinyURL created successfully:', { shortUrl, alias, isExternal })

      return NextResponse.json({
        originalUrl: normalizedUrl,
        shortCode: alias,
        shortUrl: shortUrl,
        createdAt: new Date().toISOString(),
        isExternal: isExternal,
      })
    } catch (shortUrlError) {
      console.error("TinyURL creation error:", shortUrlError)
      const errorMessage = shortUrlError instanceof Error ? shortUrlError.message : "Unknown error"
      
      // Provide more specific error messages to the user
      let userErrorMessage = "Failed to create shortened URL. Please try again later."
      
      if (errorMessage.includes('rejected this URL')) {
        userErrorMessage = "This URL cannot be shortened. TinyURL may have blocked this domain or the URL may be invalid. Please try a different URL."
      } else if (errorMessage.includes('Network error')) {
        userErrorMessage = "Network error: Unable to connect to the shortening service. Please check your internet connection and try again."
      } else if (errorMessage.includes('timeout')) {
        userErrorMessage = "Request timeout: The shortening service is taking too long to respond. Please try again."
      }
      
      return NextResponse.json(
        {
          error: userErrorMessage,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

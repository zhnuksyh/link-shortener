export async function createTinyURL(originalUrl: string): Promise<{ shortUrl: string; alias: string }> {
  try {
    // Generate a random short code for our own domain
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let shortCode = ''
    for (let i = 0; i < 7; i++) {
      shortCode += characters.charAt(Math.floor(Math.random() * characters.length))
    }

    // Use our own domain for click tracking
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const shortUrl = `${baseUrl}/s/${shortCode}`

    return {
      shortUrl: shortUrl,
      alias: shortCode,
    }
  } catch (error) {
    console.error("Short URL generation error:", error)
    throw new Error("Failed to create shortened URL")
  }
}

export async function getTinyURLAnalytics(alias: string) {
  // Simple TinyURL API doesn't provide analytics
  // Return null to indicate analytics are not available
  return null
}

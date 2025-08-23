export async function createTinyURL(originalUrl: string, alias?: string): Promise<{ shortUrl: string; alias: string }> {
  try {
    // Using the simple TinyURL API that doesn't require authentication
    // Use HTTPS for better security and compatibility
    const apiUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(originalUrl)}`

    console.log('TinyURL API request:', apiUrl)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        'User-Agent': 'LinkShortener/1.0',
      },
    })

    console.log('TinyURL API response status:', response.status)

    if (!response.ok) {
      throw new Error(`TinyURL API error: ${response.status} ${response.statusText}`)
    }

    const shortUrl = await response.text()
    console.log('TinyURL API response:', shortUrl)

    if (!shortUrl || shortUrl.includes('error')) {
      throw new Error('TinyURL API returned an error response')
    }

    // Extract the alias from the shortened URL (everything after the last /)
    const urlParts = shortUrl.split("/")
    const generatedAlias = urlParts[urlParts.length - 1]

    return {
      shortUrl: shortUrl.trim(),
      alias: alias || generatedAlias,
    }
  } catch (error) {
    console.error("TinyURL API error:", error)
    throw new Error("Failed to create shortened URL with TinyURL")
  }
}

export async function getTinyURLAnalytics(alias: string) {
  // Simple TinyURL API doesn't provide analytics
  // Return null to indicate analytics are not available
  return null
}

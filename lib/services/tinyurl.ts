export async function createTinyURL(originalUrl: string): Promise<{ shortUrl: string; alias: string }> {
  try {
    // Try the public TinyURL API first (no authentication required)
    const publicApiUrl = 'https://tinyurl.com/api-create.php'
    const encodedUrl = encodeURIComponent(originalUrl)
    const fullUrl = `${publicApiUrl}?url=${encodedUrl}`
    
    console.log('Attempting to create TinyURL for:', originalUrl)
    console.log('Full API URL:', fullUrl)
    
    // Create a more robust fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        signal: controller.signal,
        // Add redirect handling
        redirect: 'follow',
      })

      clearTimeout(timeoutId)

      console.log('TinyURL API response status:', response.status)
      console.log('TinyURL API response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('TinyURL API error response:', errorText)
        
        // Handle specific error cases with more detailed messages
        if (response.status === 400) {
          if (errorText.toLowerCase().includes('error') || errorText.toLowerCase().includes('invalid')) {
            throw new Error(`TinyURL rejected this URL. The URL may be blocked, invalid, or contain prohibited content. Please try a different URL.`)
          } else if (errorText.toLowerCase().includes('spam') || errorText.toLowerCase().includes('abuse')) {
            throw new Error(`TinyURL blocked this URL due to spam or abuse detection. Please try a different URL.`)
          } else {
            throw new Error(`TinyURL rejected this URL (${response.status}): ${errorText}`)
          }
        } else if (response.status === 403) {
          throw new Error(`TinyURL access forbidden. The URL may be blocked or restricted. Please try a different URL.`)
        } else if (response.status === 429) {
          throw new Error(`TinyURL rate limit exceeded. Please wait a moment and try again.`)
        } else if (response.status >= 500) {
          throw new Error(`TinyURL service is temporarily unavailable (${response.status}). Please try again later.`)
        } else {
          throw new Error(`TinyURL API error: ${response.status} ${response.statusText} - ${errorText}`)
        }
      }

      const tinyUrl = await response.text()
      console.log('TinyURL API raw response:', tinyUrl)
      
      // Check if we got a valid TinyURL response
      if (!tinyUrl || typeof tinyUrl !== 'string' || tinyUrl.trim().length === 0) {
        console.error('Empty or invalid TinyURL response:', tinyUrl)
        throw new Error('Empty response from TinyURL API')
      }

      const trimmedUrl = tinyUrl.trim()
      console.log('Trimmed TinyURL response:', trimmedUrl)
      
      // Check if the response looks like a valid URL
      if (!trimmedUrl.startsWith('http')) {
        console.error('Invalid TinyURL response format:', trimmedUrl)
        throw new Error(`Invalid response format from TinyURL API: ${trimmedUrl}`)
      }

      // Extract the alias from the tiny_url
      const alias = trimmedUrl.split('/').pop() || ''
      console.log('Extracted alias:', alias)

      return {
        shortUrl: trimmedUrl,
        alias: alias,
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }
  } catch (error) {
    console.error("TinyURL API error:", error)
    
    // Fallback: try the authenticated API if token is available
    const apiToken = process.env.TINYURL_API_TOKEN
    if (apiToken && apiToken.trim() !== '') {
      try {
        console.log('Trying authenticated TinyURL API...')
        const apiUrl = 'https://api.tinyurl.com/create'
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000)
        
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiToken.trim()}`,
            },
            body: JSON.stringify({
              url: originalUrl,
              domain: 'tinyurl.com'
            }),
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          if (!response.ok) {
            const errorText = await response.text()
            console.error(`TinyURL authenticated API error: ${response.status} ${response.statusText}`, errorText)
            // Don't throw here, let it fall through to the main error
            console.log('Authenticated API failed, continuing with main error...')
          } else {
            const data = await response.json()
            console.log('TinyURL authenticated API response:', data)
            
            if (data.data && data.data.tiny_url) {
              const tinyUrl = data.data.tiny_url
              const alias = tinyUrl.split('/').pop() || ''

              return {
                shortUrl: tinyUrl,
                alias: alias,
              }
            }
          }
        } catch (authFetchError) {
          clearTimeout(timeoutId)
          console.error("TinyURL authenticated API fetch error:", authFetchError)
        }
      } catch (authError) {
        console.error("TinyURL authenticated API error:", authError)
      }
    } else {
      console.log('No TINYURL_API_TOKEN provided, skipping authenticated API')
    }
    
    // If all TinyURL methods fail, throw a more descriptive error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('All TinyURL methods failed:', errorMessage)
    throw new Error(`Failed to create shortened URL via TinyURL. ${errorMessage}`)
  }
}

export async function getTinyURLAnalytics(alias: string) {
  // Simple TinyURL API doesn't provide analytics
  // Return null to indicate analytics are not available
  return null
}

/**
 * Create a shortened URL using TinyURL only
 */
export async function createTinyURLShortLink(originalUrl: string, userId: string): Promise<{ shortUrl: string; alias: string; isExternal: boolean }> {
  try {
    // Use TinyURL only
    console.log('Creating TinyURL for:', originalUrl, 'user:', userId)
    const result = await createTinyURL(originalUrl)
    console.log('TinyURL created successfully:', result)
    return {
      ...result,
      isExternal: true
    }
  } catch (tinyUrlError) {
    console.error('TinyURL failed:', tinyUrlError)
    const errorMessage = tinyUrlError instanceof Error ? tinyUrlError.message : 'Unknown error'
    
    // Provide more specific error messages based on the error type
    if (errorMessage.includes('fetch') || errorMessage.includes('Network error')) {
      throw new Error('Network error: Unable to connect to TinyURL service. Please check your internet connection and try again.')
    } else if (errorMessage.includes('timeout') || errorMessage.includes('abort')) {
      throw new Error('Request timeout: TinyURL service is taking too long to respond. Please try again.')
    } else if (errorMessage.includes('Invalid response') || errorMessage.includes('Empty response')) {
      throw new Error('Invalid response from TinyURL service. Please try again.')
    } else if (errorMessage.includes('rejected this URL') || errorMessage.includes('blocked') || errorMessage.includes('forbidden')) {
      throw new Error('TinyURL rejected this URL. The URL may be blocked, invalid, or contain prohibited content. Please try a different URL.')
    } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      throw new Error('TinyURL rate limit exceeded. Please wait a moment and try again.')
    } else if (errorMessage.includes('spam') || errorMessage.includes('abuse')) {
      throw new Error('TinyURL blocked this URL due to spam or abuse detection. Please try a different URL.')
    } else if (errorMessage.includes('temporarily unavailable') || errorMessage.includes('500')) {
      throw new Error('TinyURL service is temporarily unavailable. Please try again later.')
    } else {
      // Pass through the original error message if it's already user-friendly
      throw new Error(errorMessage)
    }
  }
}

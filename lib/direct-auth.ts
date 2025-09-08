import { NextRequest } from "next/server"
import type { User } from "@supabase/supabase-js"

export interface DirectAuthResult {
  user: User | null
  error: string | null
  session: any | null
  debug: {
    hasCookies: boolean
    cookieNames: string[]
    authTokenFound: boolean
    authTokenLength?: number
    directApiSuccess: boolean
  }
}

// Direct authentication using Supabase REST API
export async function authenticateUserDirect(request: NextRequest): Promise<DirectAuthResult> {
  const cookies = request.cookies.getAll()
  
  const debug = {
    hasCookies: cookies.length > 0,
    cookieNames: cookies.map(c => c.name),
    authTokenFound: false,
    authTokenLength: 0,
    directApiSuccess: false,
  }

  try {
    // Find the auth token cookie
    const authTokenCookie = cookies.find(c => c.name.includes('auth-token'))
    debug.authTokenFound = !!authTokenCookie
    debug.authTokenLength = authTokenCookie?.value?.length || 0

    if (!authTokenCookie || !authTokenCookie.value) {
      return {
        user: null,
        error: "No authentication token found in cookies",
        session: null,
        debug,
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      return {
        user: null,
        error: "Supabase URL not configured",
        session: null,
        debug,
      }
    }

    // Make direct API call to Supabase to verify the token
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authTokenCookie.value}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Content-Type': 'application/json',
      },
    })

    debug.directApiSuccess = response.ok

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        user: null,
        error: `Direct API authentication failed: ${response.status} ${response.statusText}`,
        session: null,
        debug,
      }
    }

    const userData = await response.json()
    
    // Parse the JWT token to get session info
    const tokenParts = authTokenCookie.value.split('.')
    let session = null
    
    if (tokenParts.length === 3) {
      try {
        const payload = JSON.parse(atob(tokenParts[1]))
        session = {
          access_token: authTokenCookie.value,
          token_type: 'bearer',
          expires_at: payload.exp,
          expires_in: payload.exp - Math.floor(Date.now() / 1000),
          refresh_token: null,
          user: userData,
        }
      } catch (error) {
        console.error('Error parsing JWT payload:', error)
      }
    }

    return {
      user: userData as User,
      error: null,
      session,
      debug,
    }
  } catch (error) {
    console.error('Direct authentication error:', error)
    return {
      user: null,
      error: error instanceof Error ? error.message : "Unknown direct authentication error",
      session: null,
      debug,
    }
  }
}

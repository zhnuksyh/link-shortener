import { createApiClient } from "@/lib/supabase/server"
import { authenticateUserDirect } from "@/lib/direct-auth"
import { NextRequest } from "next/server"
import type { User } from "@supabase/supabase-js"

export interface AuthResult {
  user: User | null
  error: string | null
  session: any | null
  debug: {
    hasCookies: boolean
    cookieNames: string[]
    hasSession: boolean
    sessionExpiry?: string
    authTokenFound: boolean
    authTokenLength?: number
    directApiSuccess?: boolean
    fallbackUsed?: boolean
  }
}

// Helper function to manually parse session from cookies
function parseSessionFromCookies(cookies: any[]): any {
  try {
    const authTokenCookie = cookies.find(c => c.name.includes('auth-token'))
    if (!authTokenCookie || !authTokenCookie.value) {
      return null
    }

    // Parse the JWT token to extract session info
    const tokenParts = authTokenCookie.value.split('.')
    if (tokenParts.length !== 3) {
      return null
    }

    const payload = JSON.parse(atob(tokenParts[1]))
    return {
      access_token: authTokenCookie.value,
      token_type: 'bearer',
      expires_at: payload.exp,
      expires_in: payload.exp - Math.floor(Date.now() / 1000),
      refresh_token: null,
      user: {
        id: payload.sub,
        email: payload.email,
        // Add other user fields as needed
      }
    }
  } catch (error) {
    console.error('Error parsing session from cookies:', error)
    return null
  }
}

export async function authenticateUser(request: NextRequest): Promise<AuthResult> {
  const cookies = request.cookies.getAll()
  
  const debug = {
    hasCookies: cookies.length > 0,
    cookieNames: cookies.map(c => c.name),
    hasSession: false,
    authTokenFound: false,
    authTokenLength: 0,
    directApiSuccess: false,
    fallbackUsed: false,
  }

  try {
    console.log('=== AUTHENTICATE USER START ===')
    console.log('Request method:', request.method)
    console.log('Cookies received:', cookies.map(c => ({ name: c.name, hasValue: !!c.value })))
    
    // Check for auth token cookie
    const authTokenCookie = cookies.find(c => c.name.includes('auth-token'))
    debug.authTokenFound = !!authTokenCookie
    debug.authTokenLength = authTokenCookie?.value?.length || 0

    if (!authTokenCookie) {
      console.log('No auth token cookie found')
      return {
        user: null,
        error: "No authentication token found in cookies",
        session: null,
        debug,
      }
    }

    console.log('Auth token cookie found:', { name: authTokenCookie.name, length: authTokenCookie.value?.length })

    const supabase = await createApiClient()

    // Try to get the user directly
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log('Supabase auth result:', { hasUser: !!user, error: authError?.message })

    if (authError) {
      console.log('Auth error:', authError)
      return {
        user: null,
        error: authError.message,
        session: null,
        debug,
      }
    }

    if (!user) {
      console.log('No user found')
      return {
        user: null,
        error: "No user found in session",
        session: null,
        debug,
      }
    }

    console.log('Authentication successful:', { userId: user.id, email: user.email })
    console.log('=== AUTHENTICATE USER END ===')

    return {
      user,
      error: null,
      session: null,
      debug,
    }
  } catch (error) {
    console.error('Authentication helper error:', error)
    return {
      user: null,
      error: error instanceof Error ? error.message : "Unknown authentication error",
      session: null,
      debug,
    }
  }
}

export function createAuthErrorResponse(authResult: AuthResult) {
  return {
    error: "Unauthorized",
    details: authResult.error || "Authentication failed",
    debug: authResult.debug,
  }
}

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
    // Check for auth token cookie
    const authTokenCookie = cookies.find(c => c.name.includes('auth-token'))
    debug.authTokenFound = !!authTokenCookie
    debug.authTokenLength = authTokenCookie?.value?.length || 0

    if (!authTokenCookie) {
      return {
        user: null,
        error: "No authentication token found in cookies",
        session: null,
        debug,
      }
    }

    const supabase = await createApiClient()

    // Try to manually parse session from cookies first
    const manualSession = parseSessionFromCookies(cookies)
    if (manualSession) {
      debug.hasSession = true
      debug.sessionExpiry = new Date(manualSession.expires_at * 1000).toISOString()
      
      // Try to get user with the parsed session
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (user && !userError) {
          return {
            user,
            error: null,
            session: manualSession,
            debug,
          }
        }
      } catch (error) {
        console.log('Error getting user with manual session:', error)
      }
    }

    // Fallback: try standard Supabase methods
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    debug.hasSession = !!session
    debug.sessionExpiry = session?.expires_at

    if (sessionError) {
      console.log('Session error:', sessionError)
    }

    // Try to get the user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.log('Auth error:', authError)
      
      // If we have a manual session but Supabase auth fails, try to use the manual session
      if (manualSession && manualSession.user) {
        return {
          user: manualSession.user as User,
          error: null,
          session: manualSession,
          debug,
        }
      }
      
      // Try direct API authentication as fallback
      console.log('Trying direct API authentication as fallback...')
      const directResult = await authenticateUserDirect(request)
      debug.directApiSuccess = directResult.debug.directApiSuccess
      debug.fallbackUsed = true
      
      if (directResult.user && !directResult.error) {
        console.log('Direct API authentication successful!')
        return {
          user: directResult.user,
          error: null,
          session: directResult.session,
          debug,
        }
      }
      
      return {
        user: null,
        error: authError.message,
        session: session || manualSession,
        debug,
      }
    }

    if (!user) {
      // If we have a manual session but no user from Supabase, use the manual session
      if (manualSession && manualSession.user) {
        return {
          user: manualSession.user as User,
          error: null,
          session: manualSession,
          debug,
        }
      }
      
      // Try direct API authentication as fallback
      console.log('No user found, trying direct API authentication as fallback...')
      const directResult = await authenticateUserDirect(request)
      debug.directApiSuccess = directResult.debug.directApiSuccess
      debug.fallbackUsed = true
      
      if (directResult.user && !directResult.error) {
        console.log('Direct API authentication successful!')
        return {
          user: directResult.user,
          error: null,
          session: directResult.session,
          debug,
        }
      }
      
      return {
        user: null,
        error: "No user found in session",
        session: session || manualSession,
        debug,
      }
    }

    return {
      user,
      error: null,
      session: session || manualSession,
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

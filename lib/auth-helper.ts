import { createApiClient } from "@/lib/supabase/server"
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
  }
}

export async function authenticateUser(request: NextRequest): Promise<AuthResult> {
  const cookies = request.cookies.getAll()
  
  const debug = {
    hasCookies: cookies.length > 0,
    cookieNames: cookies.map(c => c.name),
    hasSession: false,
  }

  try {
    const supabase = await createApiClient()

    // First try to get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    debug.hasSession = !!session
    debug.sessionExpiry = session?.expires_at

    if (sessionError) {
      console.log('Session error:', sessionError)
    }

    // Then try to get the user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.log('Auth error:', authError)
      return {
        user: null,
        error: authError.message,
        session,
        debug,
      }
    }

    if (!user) {
      return {
        user: null,
        error: "No user found in session",
        session,
        debug,
      }
    }

    return {
      user,
      error: null,
      session,
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

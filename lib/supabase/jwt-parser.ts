import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest } from "next/server"

export interface ParsedJWT {
  user: any
  access_token: string
  refresh_token: string
  expires_at: number
  expires_in: number
}

export async function parseJWTFromCookies(request?: NextRequest): Promise<ParsedJWT | null> {
  try {
    const cookieStore = await cookies()
    
    // Get the auth token cookie
    const authTokenCookie = cookieStore.get('sb-foddnmiritvmozknnwsg-auth-token')
    
    if (!authTokenCookie?.value) {
      console.log('JWT Parser: No auth token cookie found')
      return null
    }
    
    // Remove base64 prefix if present
    const cleanToken = authTokenCookie.value.startsWith('base64-') 
      ? authTokenCookie.value.substring(7) 
      : authTokenCookie.value
    
    // Decode the JWT
    const decoded = Buffer.from(cleanToken, 'base64').toString('utf-8')
    const jwtPayload = JSON.parse(decoded)
    
    console.log('JWT Parser: Successfully parsed JWT:', {
      hasAccessToken: !!jwtPayload.access_token,
      hasRefreshToken: !!jwtPayload.refresh_token,
      hasUser: !!jwtPayload.user,
      userEmail: jwtPayload.user?.email,
      expiresAt: jwtPayload.expires_at,
      expiresIn: jwtPayload.expires_in
    })
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000)
    if (jwtPayload.expires_at && jwtPayload.expires_at < now) {
      console.log('JWT Parser: Token is expired')
      return null
    }
    
    return jwtPayload
  } catch (error) {
    console.error('JWT Parser: Error parsing JWT:', error)
    return null
  }
}

export async function createClientWithManualAuth() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      flowType: 'pkce'
    },
    cookies: {
      get(name: string) {
        const cookie = cookieStore.get(name)
        return cookie?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set(name, value, {
            ...options,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            httpOnly: false,
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? undefined : undefined
          })
        } catch {
          // Ignore if called from middleware
        }
      },
      remove(name: string, options: any) {
        // Don't remove cookies automatically
        console.log(`Manual Auth: Preserving cookie ${name}`)
        return
      },
    },
  })
}

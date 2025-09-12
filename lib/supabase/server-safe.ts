import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createSafeClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
  }

  // Extract project ID from Supabase URL for proper cookie naming
  const projectId = supabaseUrl.split('//')[1]?.split('.')[0] || 'default'
  const expectedCookieName = `sb-${projectId}-auth-token`

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Disable session persistence in server
      autoRefreshToken: false, // Disable auto refresh in server
      detectSessionInUrl: false,
      flowType: 'pkce'
    },
    cookies: {
      get(name: string) {
        const cookie = cookieStore.get(name)
        console.log(`Safe Server get cookie ${name}:`, { hasValue: !!cookie?.value, value: cookie?.value?.substring(0, 20) + '...' })
        
        // If the specific cookie is not found, try to find any Supabase cookie
        if (!cookie?.value && name.includes('sb-')) {
          const allCookies = cookieStore.getAll()
          const supabaseCookies = allCookies.filter(c => c.name.includes('sb-'))
          console.log(`Safe Server looking for Supabase cookies, found:`, supabaseCookies.map(c => ({ name: c.name, hasValue: !!c.value })))
          
          // Try to find a cookie that might match
          const matchingCookie = supabaseCookies.find(c => c.name.includes('auth-token'))
          if (matchingCookie) {
            console.log(`Safe Server found matching auth token cookie: ${matchingCookie.name}`)
            return matchingCookie.value
          }
        }
        
        return cookie?.value
      },
      set(name: string, value: string, options: any) {
        try {
          console.log(`Safe Server set cookie ${name}:`, { hasValue: !!value, value: value?.substring(0, 20) + '...' })
          cookieStore.set(name, value, {
            ...options,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            httpOnly: false,
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? undefined : undefined // Let browser handle domain
          })
        } catch {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: any) {
        // SAFE MODE: Don't remove cookies automatically
        console.log(`Safe Server SKIPPING remove cookie ${name} - preserving cookies`)
        // Don't actually remove the cookie - just log it
        return
      },
    },
  })
}

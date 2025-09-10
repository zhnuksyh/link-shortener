import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        const cookie = cookieStore.get(name)
        console.log(`Server get cookie ${name}:`, { hasValue: !!cookie?.value, value: cookie?.value?.substring(0, 20) + '...' })
        
        // If the specific cookie is not found, try to find any Supabase cookie
        if (!cookie?.value && name.includes('sb-')) {
          const allCookies = cookieStore.getAll()
          const supabaseCookies = allCookies.filter(c => c.name.includes('sb-'))
          console.log(`Looking for Supabase cookies, found:`, supabaseCookies.map(c => ({ name: c.name, hasValue: !!c.value })))
          
          // Try to find a cookie that might match
          const matchingCookie = supabaseCookies.find(c => c.name.includes('auth-token'))
          if (matchingCookie) {
            console.log(`Found matching auth token cookie: ${matchingCookie.name}`)
            return matchingCookie.value
          }
        }
        
        return cookie?.value
      },
      set(name: string, value: string, options: any) {
        try {
          console.log(`Server set cookie ${name}:`, { hasValue: !!value, value: value?.substring(0, 20) + '...' })
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
        try {
          console.log(`Server remove cookie ${name}`)
          cookieStore.set(name, '', { 
            ...options, 
            maxAge: 0,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            httpOnly: false,
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? undefined : undefined // Let browser handle domain
          })
        } catch {
          // The `remove` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

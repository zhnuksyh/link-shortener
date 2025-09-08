import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
    cookies: {
      getAll() {
        if (typeof window === 'undefined') return []
        return document.cookie.split(';').map(cookie => {
          const [name, value] = cookie.trim().split('=')
          return { name: name || '', value: value || '' }
        }).filter(cookie => cookie.name)
      },
      setAll(cookiesToSet) {
        if (typeof window === 'undefined') return
        cookiesToSet.forEach(({ name, value, options }) => {
          const cookieOptions = {
            ...options,
            secure: window.location.protocol === 'https:',
            sameSite: 'lax' as const,
            path: '/',
            domain: window.location.hostname.includes('vercel.app') ? '.vercel.app' : undefined,
          }
          
          let cookieString = `${name}=${value}`
          if (cookieOptions.maxAge) cookieString += `; max-age=${cookieOptions.maxAge}`
          if (cookieOptions.expires) cookieString += `; expires=${cookieOptions.expires}`
          if (cookieOptions.path) cookieString += `; path=${cookieOptions.path}`
          if (cookieOptions.domain) cookieString += `; domain=${cookieOptions.domain}`
          if (cookieOptions.secure) cookieString += `; secure`
          if (cookieOptions.sameSite) cookieString += `; samesite=${cookieOptions.sameSite}`
          
          document.cookie = cookieString
        })
      },
    },
  })
}

import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true, // Enable session persistence on client-side
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce', // Use PKCE flow for better security
    },
    cookies: {
      get(name: string) {
        return document.cookie
          .split('; ')
          .find(row => row.startsWith(`${name}=`))
          ?.split('=')[1]
      },
      set(name: string, value: string, options: any) {
        document.cookie = `${name}=${value}; ${Object.entries(options)
          .map(([key, val]) => `${key}=${val}`)
          .join('; ')}`
      },
      remove(name: string, options: any) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${Object.entries(options)
          .map(([key, val]) => `${key}=${val}`)
          .join('; ')}`
      },
    },
  })
}

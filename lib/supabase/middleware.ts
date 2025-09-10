import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { cookies } from "next/headers"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Try to use the same approach as the server client
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // First try the request cookies
          const requestCookie = request.cookies.get(name)
          if (requestCookie?.value) {
            console.log(`Middleware get cookie ${name} from request:`, { hasValue: !!requestCookie.value })
            return requestCookie.value
          }
          
          // Fallback to cookie store
          const cookie = cookieStore.get(name)
          console.log(`Middleware get cookie ${name} from store:`, { hasValue: !!cookie?.value })
          return cookie?.value
        },
        set(name: string, value: string, options: any) {
          console.log(`Middleware set cookie ${name}:`, { hasValue: !!value })
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
          console.log(`Middleware remove cookie ${name}`)
          try {
            cookieStore.set(name, '', { 
              ...options, 
              maxAge: 0,
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
      },
      auth: {
        persistSession: false, // Disable session persistence in middleware
        autoRefreshToken: false, // Disable auto refresh in middleware
        detectSessionInUrl: false,
        flowType: 'pkce'
      }
    },
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()
  
  // Debug logging for dashboard requests
  if (request.nextUrl.pathname === "/dashboard") {
    console.log('Dashboard request - Middleware debug:', {
      path: request.nextUrl.pathname,
      hasUser: !!user,
      userEmail: user?.email,
      userError: userError?.message,
      cookies: request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value })),
      cookieHeader: request.headers.get('cookie')
    })
    
    // Try to get session as well
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('Dashboard request - Session debug:', {
      hasSession: !!session,
      sessionError: sessionError?.message,
      sessionUser: session?.user?.email
    })
  }

  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    request.nextUrl.pathname !== "/" &&
    !request.nextUrl.pathname.startsWith("/s/") && // Allow access to shortened links
    !request.nextUrl.pathname.startsWith("/api/") && // Allow access to API routes
    !request.nextUrl.pathname.startsWith("/cookie-inspector") && // Allow access to cookie inspector for testing
    !request.nextUrl.pathname.startsWith("/test-auth") && // Allow access to test auth for testing
    !request.nextUrl.pathname.includes("site.webmanifest") && // Allow access to manifest
    !request.nextUrl.pathname.includes("favicon") && // Allow access to favicon
    !request.nextUrl.pathname.includes("_next") // Allow access to Next.js assets
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object

  return supabaseResponse
}

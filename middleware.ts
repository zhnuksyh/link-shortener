import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  // Simple middleware that just checks for auth cookies
  // This avoids the Edge Runtime compatibility issues with Supabase
  
  const authCookie = request.cookies.get('sb-access-token') || 
                    request.cookies.get('supabase-auth-token') ||
                    request.cookies.get('sb-refresh-token')
  
  const isAuthenticated = !!authCookie
  
  // Allow access to public routes
  if (
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/s/") ||
    request.nextUrl.pathname.startsWith("/api/") ||
    request.nextUrl.pathname.startsWith("/cookie-inspector") ||
    request.nextUrl.pathname.startsWith("/test-auth")
  ) {
    return NextResponse.next()
  }
  
  // Redirect to login if not authenticated and trying to access protected routes
  if (!isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

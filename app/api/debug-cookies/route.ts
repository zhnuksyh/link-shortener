import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log('=== COOKIE DEBUG START ===')
    
    // Get all cookies from the request
    const cookies = request.cookies.getAll()
    
    // Get raw cookie header
    const cookieHeader = request.headers.get('cookie')
    
    // Get all headers for debugging
    const headers = Object.fromEntries(request.headers.entries())
    
    console.log('Raw cookie header:', cookieHeader)
    console.log('Parsed cookies:', cookies)
    console.log('All headers:', headers)
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      url: request.url,
      method: request.method,
      headers: {
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
        userAgent: request.headers.get('user-agent')?.substring(0, 100),
        cookie: cookieHeader,
        host: request.headers.get('host'),
        'x-forwarded-for': request.headers.get('x-forwarded-for'),
        'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
      },
      cookies: {
        raw: cookieHeader,
        parsed: cookies.map(c => ({
          name: c.name,
          value: c.value?.substring(0, 50) + '...',
          valueLength: c.value?.length || 0,
          hasValue: !!c.value,
        })),
        count: cookies.length,
        supabaseCookies: cookies.filter(c => c.name.includes('sb-')),
      },
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
    }
    
    console.log('Debug info:', JSON.stringify(debugInfo, null, 2))
    console.log('=== COOKIE DEBUG END ===')
    
    return NextResponse.json(debugInfo)
  } catch (error) {
    console.error("Cookie debug error:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}

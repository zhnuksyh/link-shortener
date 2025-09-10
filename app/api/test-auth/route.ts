import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get all cookies
    const allCookies = request.cookies.getAll()
    const cookieHeader = request.headers.get('cookie')
    
    // Try to get user
    const { data: { user }, error } = await supabase.auth.getUser()
    
    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      cookies: {
        all: allCookies.map(c => ({ name: c.name, hasValue: !!c.value, value: c.value?.substring(0, 50) + '...' })),
        raw: cookieHeader,
        supabaseCookies: allCookies.filter(c => c.name.includes('sb-')).map(c => ({ name: c.name, hasValue: !!c.value }))
      },
      auth: {
        hasUser: !!user,
        userEmail: user?.email,
        authError: error?.message,
        hasSession: !!session,
        sessionError: sessionError?.message
      },
      headers: {
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
        host: request.headers.get('host'),
        userAgent: request.headers.get('user-agent')?.substring(0, 100)
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}

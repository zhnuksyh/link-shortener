import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log('=== AUTH TEST DEBUG START ===')
    
    // Log all request details
    const cookies = request.cookies.getAll()
    console.log('Request cookies:', cookies.map(c => ({ 
      name: c.name, 
      hasValue: !!c.value,
      valueLength: c.value?.length || 0,
      valuePreview: c.value?.substring(0, 50) + '...'
    })))
    
    console.log('Request headers:', {
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
      userAgent: request.headers.get('user-agent')?.substring(0, 50) + '...',
      cookie: request.headers.get('cookie')?.substring(0, 200) + '...',
    })
    
    // Test authentication using direct Supabase client
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    
    console.log('Auth test result:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      error: authError?.message,
    })
    
    console.log('=== AUTH TEST DEBUG END ===')
    
    return NextResponse.json({
      success: !!user,
      user: user ? {
        id: user.id,
        email: user.email,
      } : null,
      error: authError?.message || null,
      debug: {
        hasCookies: cookies.length > 0,
        cookieNames: cookies.map(c => c.name),
        cookieCount: cookies.length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Auth test error:", error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}

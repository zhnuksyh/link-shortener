import { authenticateUser } from "@/lib/auth-helper"
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
    
    // Test authentication
    const authResult = await authenticateUser(request)
    
    console.log('Auth test result:', {
      hasUser: !!authResult.user,
      userId: authResult.user?.id,
      userEmail: authResult.user?.email,
      error: authResult.error,
      debug: authResult.debug,
    })
    
    console.log('=== AUTH TEST DEBUG END ===')
    
    return NextResponse.json({
      success: !!authResult.user,
      user: authResult.user ? {
        id: authResult.user.id,
        email: authResult.user.email,
      } : null,
      error: authResult.error,
      debug: authResult.debug,
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

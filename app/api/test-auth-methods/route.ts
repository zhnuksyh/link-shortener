import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  return testAuthMethod(request, "GET")
}

export async function POST(request: NextRequest) {
  return testAuthMethod(request, "POST")
}

async function testAuthMethod(request: NextRequest, method: string) {
  try {
    console.log(`=== ${method} AUTH TEST START ===`)
    
    // Get all cookies from the request
    const cookies = request.cookies.getAll()
    
    // Get raw cookie header
    const cookieHeader = request.headers.get('cookie')
    
    console.log(`${method} Request cookies:`, cookies.map(c => ({ 
      name: c.name, 
      hasValue: !!c.value,
      valueLength: c.value?.length || 0
    })))
    
    console.log(`${method} Cookie header:`, cookieHeader?.substring(0, 100) + '...')
    
    const debugInfo = {
      method,
      timestamp: new Date().toISOString(),
      cookies: {
        count: cookies.length,
        names: cookies.map(c => c.name),
        supabaseCookies: cookies.filter(c => c.name.includes('sb-')),
      },
      headers: {
        cookie: cookieHeader,
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
      }
    }
    
    console.log(`${method} Debug info:`, debugInfo)
    console.log(`=== ${method} AUTH TEST END ===`)
    
    return NextResponse.json(debugInfo)
  } catch (error) {
    console.error(`${method} Auth test error:`, error)
    return NextResponse.json({ 
      method,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}

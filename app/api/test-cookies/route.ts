import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const cookies = request.cookies.getAll()
  const cookieHeader = request.headers.get('cookie')
  
  return NextResponse.json({
    cookies: cookies.map(c => ({ name: c.name, value: c.value?.substring(0, 50) + '...', hasValue: !!c.value })),
    rawCookieHeader: cookieHeader,
    supabaseCookies: cookies.filter(c => c.name.includes('sb-')),
    timestamp: new Date().toISOString()
  })
}

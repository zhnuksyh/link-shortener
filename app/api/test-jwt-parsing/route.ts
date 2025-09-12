import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get cookies
    const cookies = request.cookies.getAll()
    const cookieHeader = request.headers.get('cookie')
    
    console.log('JWT Parsing Test:')
    console.log('- Cookies:', cookies.map(c => ({ name: c.name, hasValue: !!c.value, value: c.value?.substring(0, 50) + '...' })))
    console.log('- Cookie header:', cookieHeader)
    
    // Try to get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // Try to get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // Try to get the raw JWT token
    const authToken = cookies.find(c => c.name.includes('auth-token'))?.value
    let jwtPayload = null
    if (authToken) {
      try {
        // Remove base64 prefix if present
        const cleanToken = authToken.startsWith('base64-') ? authToken.substring(7) : authToken
        const decoded = Buffer.from(cleanToken, 'base64').toString('utf-8')
        jwtPayload = JSON.parse(decoded)
        console.log('- JWT payload:', { 
          hasAccessToken: !!jwtPayload.access_token,
          hasRefreshToken: !!jwtPayload.refresh_token,
          hasUser: !!jwtPayload.user,
          expiresAt: jwtPayload.expires_at,
          expiresIn: jwtPayload.expires_in
        })
      } catch (e) {
        console.log('- JWT parsing error:', e)
      }
    }
    
    console.log('JWT Parsing Test Results:')
    console.log('- User:', user?.email, 'Error:', userError?.message)
    console.log('- Session:', session?.user?.email, 'Error:', sessionError?.message)
    
    return NextResponse.json({
      cookies: cookies.map(c => ({ name: c.name, hasValue: !!c.value })),
      cookieHeader,
      user: user ? { email: user.email, id: user.id } : null,
      userError: userError?.message,
      session: session ? { user: { email: session.user.email, id: session.user.id } } : null,
      sessionError: sessionError?.message,
      jwtPayload: jwtPayload ? {
        hasAccessToken: !!jwtPayload.access_token,
        hasRefreshToken: !!jwtPayload.refresh_token,
        hasUser: !!jwtPayload.user,
        expiresAt: jwtPayload.expires_at,
        expiresIn: jwtPayload.expires_in
      } : null
    });
  } catch (e) {
    console.error('JWT Parsing Test Error:', e);
    return NextResponse.json({ 
      error: e instanceof Error ? e.message : String(e) 
    }, { status: 500 });
  }
}

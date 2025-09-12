import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const projectId = supabaseUrl.split('//')[1]?.split('.')[0] || 'default'
    const expectedCookieName = `sb-${projectId}-auth-token`
    
    const cookies = request.cookies.getAll()
    const cookieHeader = request.headers.get('cookie')
    
    console.log('Cookie Names Test:')
    console.log('- Supabase URL:', supabaseUrl)
    console.log('- Project ID:', projectId)
    console.log('- Expected cookie name:', expectedCookieName)
    console.log('- All cookies:', cookies.map(c => ({ name: c.name, hasValue: !!c.value })))
    console.log('- Cookie header:', cookieHeader)
    
    return NextResponse.json({
      supabaseUrl,
      projectId,
      expectedCookieName,
      cookies: cookies.map(c => ({ name: c.name, hasValue: !!c.value })),
      cookieHeader,
      hasExpectedCookie: !!cookies.find(c => c.name === expectedCookieName),
      hasGenericCookie: !!cookies.find(c => c.name === 'sb-auth-token')
    });
  } catch (e) {
    console.error('Cookie Names Test Error:', e);
    return NextResponse.json({ 
      error: e instanceof Error ? e.message : String(e) 
    }, { status: 500 });
  }
}

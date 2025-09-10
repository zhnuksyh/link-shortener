import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  try {
    // Test the same Supabase client setup as middleware
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Don't actually set cookies in this test
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          flowType: 'pkce'
        }
      },
    )

    // Get cookies
    const cookies = request.cookies.getAll();
    const cookieHeader = request.headers.get('cookie');
    
    // Try to get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Try to get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    console.log('Test Middleware Cookies API - Raw cookie header:', cookieHeader);
    console.log('Test Middleware Cookies API - Parsed cookies:', cookies);
    console.log('Test Middleware Cookies API - User:', user?.email, 'Error:', userError?.message);
    console.log('Test Middleware Cookies API - Session:', session?.user?.email, 'Error:', sessionError?.message);

    return NextResponse.json({
      cookies: cookies.map(c => ({ name: c.name, hasValue: !!c.value, value: c.value?.substring(0, 50) + '...' })),
      cookieHeader,
      user: user ? { email: user.email, id: user.id } : null,
      userError: userError?.message,
      session: session ? { user: { email: session.user.email, id: session.user.id } } : null,
      sessionError: sessionError?.message
    });
  } catch (e) {
    console.error('Test Middleware Cookies API - Error:', e);
    return NextResponse.json({ 
      error: e instanceof Error ? e.message : String(e) 
    }, { status: 500 });
  }
}

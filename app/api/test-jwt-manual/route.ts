import { NextRequest, NextResponse } from "next/server";
import { parseJWTFromCookies } from "@/lib/supabase/jwt-parser";

export async function GET(request: NextRequest) {
  try {
    console.log('Test JWT Manual: Starting test')
    
    const jwtPayload = await parseJWTFromCookies(request)
    
    console.log('Test JWT Manual: JWT payload result:', {
      hasPayload: !!jwtPayload,
      hasUser: !!jwtPayload?.user,
      userEmail: jwtPayload?.user?.email,
      hasAccessToken: !!jwtPayload?.access_token,
      hasRefreshToken: !!jwtPayload?.refresh_token,
      expiresAt: jwtPayload?.expires_at,
      expiresIn: jwtPayload?.expires_in
    })
    
    return NextResponse.json({
      success: true,
      hasPayload: !!jwtPayload,
      hasUser: !!jwtPayload?.user,
      userEmail: jwtPayload?.user?.email,
      hasAccessToken: !!jwtPayload?.access_token,
      hasRefreshToken: !!jwtPayload?.refresh_token,
      expiresAt: jwtPayload?.expires_at,
      expiresIn: jwtPayload?.expires_in,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error('Test JWT Manual Error:', e);
    return NextResponse.json({ 
      success: false,
      error: e instanceof Error ? e.message : String(e),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

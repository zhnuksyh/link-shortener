import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const nodeEnv = process.env.NODE_ENV
    
    // Get request info
    const host = request.headers.get('host')
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    
    // Check if we're in Vercel
    const vercelUrl = process.env.VERCEL_URL
    const vercelEnv = process.env.VERCEL_ENV
    
    console.log('Configuration Check:')
    console.log('- Supabase URL:', supabaseUrl)
    console.log('- Supabase Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING')
    console.log('- Node Env:', nodeEnv)
    console.log('- Host:', host)
    console.log('- Origin:', origin)
    console.log('- Referer:', referer)
    console.log('- Vercel URL:', vercelUrl)
    console.log('- Vercel Env:', vercelEnv)
    
    // Validate Supabase URL format
    let supabaseUrlValid = false
    let supabaseProjectId = null
    if (supabaseUrl) {
      try {
        const url = new URL(supabaseUrl)
        supabaseUrlValid = url.hostname.includes('supabase.co')
        supabaseProjectId = url.hostname.split('.')[0]
      } catch (e) {
        console.log('- Supabase URL parsing error:', e)
      }
    }
    
    return NextResponse.json({
      environment: {
        nodeEnv,
        vercelEnv,
        vercelUrl
      },
      supabase: {
        url: supabaseUrl,
        urlValid: supabaseUrlValid,
        projectId: supabaseProjectId,
        hasAnonKey: !!supabaseAnonKey,
        anonKeyLength: supabaseAnonKey?.length || 0
      },
      request: {
        host,
        origin,
        referer
      },
      issues: {
        missingSupabaseUrl: !supabaseUrl,
        missingSupabaseKey: !supabaseAnonKey,
        invalidSupabaseUrl: supabaseUrl && !supabaseUrlValid,
        environmentMismatch: nodeEnv !== 'production' && vercelEnv === 'production'
      }
    });
  } catch (e) {
    console.error('Configuration Check Error:', e);
    return NextResponse.json({ 
      error: e instanceof Error ? e.message : String(e) 
    }, { status: 500 });
  }
}

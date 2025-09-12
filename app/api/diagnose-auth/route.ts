import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // Get request info
    const host = request.headers.get('host')
    const origin = request.headers.get('origin')
    const userAgent = request.headers.get('user-agent')
    
    // Check Vercel environment
    const vercelUrl = process.env.VERCEL_URL
    const vercelEnv = process.env.VERCEL_ENV
    const vercelRegion = process.env.VERCEL_REGION
    
    // Extract project info
    let supabaseProjectId = null
    let supabaseRegion = null
    if (supabaseUrl) {
      try {
        const url = new URL(supabaseUrl)
        supabaseProjectId = url.hostname.split('.')[0]
        supabaseRegion = url.hostname.split('.')[1]
      } catch (e) {
        console.log('Supabase URL parsing error:', e)
      }
    }
    
    // Test Supabase connection
    let supabaseConnectionTest = null
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getSession()
      supabaseConnectionTest = {
        success: !error,
        error: error?.message,
        hasSession: !!data.session,
        hasUser: !!data.session?.user
      }
    } catch (e) {
      supabaseConnectionTest = {
        success: false,
        error: e instanceof Error ? e.message : String(e)
      }
    }
    
    console.log('Auth Diagnosis:')
    console.log('- Supabase URL:', supabaseUrl)
    console.log('- Supabase Project ID:', supabaseProjectId)
    console.log('- Supabase Region:', supabaseRegion)
    console.log('- Host:', host)
    console.log('- Origin:', origin)
    console.log('- Vercel URL:', vercelUrl)
    console.log('- Vercel Env:', vercelEnv)
    console.log('- Supabase Connection:', supabaseConnectionTest)
    
    return NextResponse.json({
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv,
        vercelUrl,
        vercelRegion
      },
      supabase: {
        url: supabaseUrl,
        projectId: supabaseProjectId,
        region: supabaseRegion,
        hasAnonKey: !!supabaseAnonKey,
        anonKeyLength: supabaseAnonKey?.length || 0
      },
      request: {
        host,
        origin,
        userAgent: userAgent?.substring(0, 100) + '...'
      },
      connectionTest: supabaseConnectionTest,
      recommendations: {
        checkSiteUrl: `Verify Supabase Dashboard → Authentication → URL Configuration → Site URL matches: ${host}`,
        checkRedirectUrls: `Add to Redirect URLs: https://${host}/auth/callback, https://${host}/auth/login`,
        checkEnvironmentVars: 'Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel',
        checkCookieDomain: 'Supabase cookies might be set on wrong domain - check browser dev tools'
      }
    });
  } catch (e) {
    console.error('Auth Diagnosis Error:', e);
    return NextResponse.json({ 
      error: e instanceof Error ? e.message : String(e) 
    }, { status: 500 });
  }
}

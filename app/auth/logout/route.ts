import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  // Use the current request's origin instead of hardcoded localhost
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : "http://localhost:3000")
  
  return NextResponse.redirect(new URL("/", baseUrl))
}

export async function GET() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  // Use the current request's origin instead of hardcoded localhost
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : "http://localhost:3000")
  
  return NextResponse.redirect(new URL("/", baseUrl))
}

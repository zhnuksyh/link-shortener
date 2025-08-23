import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params
    const supabase = await createClient()

    // Find the link by short code or TinyURL alias
    const { data: link, error: fetchError } = await supabase
      .from("links")
      .select("*")
      .or(`short_code.eq.${code},tinyurl_alias.eq.${code}`)
      .eq("is_active", true)
      .single()

    if (fetchError || !link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    // Increment click count
    const { error: updateError } = await supabase
      .from("links")
      .update({ clicks: link.clicks + 1 })
      .eq("id", link.id)

    if (updateError) {
      console.error("Failed to update click count:", updateError)
      // Don't fail the redirect if click tracking fails
    }

    // Redirect to the original URL
    return NextResponse.redirect(link.original_url, { status: 302 })
  } catch (error) {
    console.error("Redirect error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

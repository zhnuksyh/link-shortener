import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Hard delete the link (remove from database)
    const { error: deleteError } = await supabase
      .from("links")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (deleteError) {
      console.error("Database delete error:", deleteError)
      return NextResponse.json({ error: "Failed to delete link" }, { status: 500 })
    }

    return NextResponse.json({ message: "Link permanently deleted" })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { isActive } = await request.json()

    // Update the link status
    const { data: updatedLink, error: updateError } = await supabase
      .from("links")
      .update({ is_active: isActive })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Database update error:", updateError)
      return NextResponse.json({ error: "Failed to update link" }, { status: 500 })
    }

    return NextResponse.json({
      id: updatedLink.id,
      originalUrl: updatedLink.original_url,
      shortCode: updatedLink.short_code,
      shortUrl: `${request.nextUrl.origin}/s/${updatedLink.short_code}`,
      isActive: updatedLink.is_active,
      createdAt: updatedLink.created_at,
      updatedAt: updatedLink.updated_at,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

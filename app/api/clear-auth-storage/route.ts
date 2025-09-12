import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // This endpoint will be called from the client to clear old auth storage
    return NextResponse.json({ 
      message: "Auth storage clear instruction sent to client",
      instructions: [
        "Clear localStorage",
        "Clear cookies", 
        "Clear sessionStorage",
        "Reload page"
      ]
    });
  } catch (e) {
    console.error('Clear Auth Storage Error:', e);
    return NextResponse.json({ 
      error: e instanceof Error ? e.message : String(e) 
    }, { status: 500 });
  }
}

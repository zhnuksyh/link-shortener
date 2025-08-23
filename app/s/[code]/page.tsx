import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface LinkPageProps {
  params: Promise<{ code: string }>;
}

export default async function LinkPage({ params }: LinkPageProps) {
  const { code } = await params;
  const supabase = await createClient();

  // Find the link by short code or TinyURL alias
  const { data: link, error } = await supabase
    .from("links")
    .select("*")
    .or(`short_code.eq.${code},tinyurl_alias.eq.${code}`)
    .eq("is_active", true)
    .single();

  if (error || !link) {
    notFound();
  }

  // This page should redirect, but if it's reached, show a loading state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p className="text-muted-foreground">
          You will be redirected to the original URL shortly.
        </p>
      </div>
    </div>
  );
}

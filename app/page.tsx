import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { UrlShortenerForm } from "@/components/url-shortener-form";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader isAuthenticated={!!user} userEmail={user?.email} />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-6xl">
          {/* Hero Section - Full width centered */}
          <div className="w-full text-center space-y-8 mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight text-center">
              Shorten your links, <br />
              <span className="text-primary">Amplify your reach</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-center">
              Transform long, unwieldy URLs into clean, shareable links. <br />
              Track clicks, manage your links, and make every share count.
            </p>
          </div>

          <div className="max-w-5xl mx-auto text-center space-y-12">
            {/* URL Shortener Form */}
            <div className="py-8">
              <UrlShortenerForm isAuthenticated={!!user} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

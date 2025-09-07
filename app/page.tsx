import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { UrlShortenerForm } from "@/components/url-shortener-form";
import { SiteFooter } from "@/components/site-footer";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader isAuthenticated={!!user} userEmail={user?.email} />

      <main className="flex-1 px-4 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-6xl mx-auto">
          {/* Hero Section - Perfectly centered */}
          <div className="w-full text-center space-y-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground tracking-tight">
              Shorten your links, <br />
              <span className="text-primary">Amplify your reach</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform long, unwieldy URLs into clean, shareable links. <br />
              Manage your links and make every share count.
            </p>
          </div>

          <div className="max-w-5xl mx-auto text-center space-y-4 mt-12">
            {/* URL Shortener Form */}
            <div className="py-4">
              <UrlShortenerForm isAuthenticated={!!user} />
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

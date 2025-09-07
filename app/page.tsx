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

      <main className="flex-1 px-4 py-12">
        <div className="w-full max-w-6xl mx-auto">
          {/* Hero Section - Fixed position */}
          <div className="w-full text-center space-y-8 mb-16">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground tracking-tight animate-slide-up animate-stagger-1">
              Shorten your links, <br />
              <span className="text-primary animate-fade-in animate-stagger-2">
                Amplify your reach
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-slide-up animate-stagger-3">
              Transform long, unwieldy URLs into clean, shareable links. <br />
              Manage your links and make every share count.
            </p>
          </div>

          <div className="max-w-5xl mx-auto text-center space-y-4">
            {/* URL Shortener Form */}
            <div className="py-3 animate-scale-in animate-stagger-4">
              <UrlShortenerForm isAuthenticated={!!user} />
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

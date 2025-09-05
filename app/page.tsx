import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { UrlShortenerForm } from "@/components/url-shortener-form";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader isAuthenticated={!!user} userEmail={user?.email} />

      <main className="w-full flex justify-center px-4 py-16">
        <div className="w-full max-w-6xl">
          {/* Hero Section - Full width centered */}
          <div className="w-full text-center space-y-6 mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight text-center">
              Shorten your links, <br />
              <span className="text-primary">amplify your reach</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-center">
              Transform long, unwieldy URLs into clean, shareable links. Track
              clicks, manage your links, and make every share count.
            </p>
          </div>

          <div className="max-w-4xl mx-auto text-center space-y-12">
            {/* URL Shortener Form */}
            <div className="py-8">
              <UrlShortenerForm isAuthenticated={!!user} />
            </div>

            {/* Features Section */}
            <div className="grid md:grid-cols-3 gap-8 pt-16">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Instant Shortening
                </h3>
                <p className="text-muted-foreground text-sm">
                  Convert long URLs into short, memorable links in seconds
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Click Analytics
                </h3>
                <p className="text-muted-foreground text-sm">
                  Track how many times your links are clicked and shared
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Secure & Reliable
                </h3>
                <p className="text-muted-foreground text-sm">
                  Your links are protected and will always redirect properly
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-16">
        <div className="w-full flex justify-center px-4">
          <div className="w-full max-w-6xl text-center">
            <p className="text-sm text-muted-foreground">
              Built with Next.js and Supabase. Simple, fast, and reliable.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

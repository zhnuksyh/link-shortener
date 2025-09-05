"use client";

import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThinScrollArea } from "@/components/ui/thin-scroll-area";
import { ThinScroller } from "@/components/ui/thin-scroller";

export default function TestPage() {
  const sampleContent = Array.from({ length: 50 }, (_, i) => (
    <div key={i} className="p-4 border-b border-border/50">
      <h3 className="font-semibold">Item {i + 1}</h3>
      <p className="text-sm text-muted-foreground">
        This is sample content to demonstrate the thin scroller. Lorem ipsum
        dolor sit amet, consectetur adipiscing elit.
      </p>
    </div>
  ));

  const wideContent = Array.from({ length: 20 }, (_, i) => (
    <div
      key={i}
      className="inline-block w-64 p-4 border border-border/50 rounded mr-4"
    >
      <h3 className="font-semibold">Wide Item {i + 1}</h3>
      <p className="text-sm text-muted-foreground">
        Horizontal scrolling content
      </p>
    </div>
  ));

  return (
    <div className="min-h-screen bg-background thin-scrollbar">
      <SiteHeader isAuthenticated={false} />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Thin Scroller Demo
          </h1>
          <p className="text-muted-foreground mt-1">
            Different variants of the custom thin scroller
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Default Thin Scroller */}
          <Card>
            <CardHeader>
              <CardTitle>Default Thin Scroller</CardTitle>
            </CardHeader>
            <CardContent>
              <ThinScroller
                variant="default"
                className="h-64 border border-border/50 rounded"
              >
                {sampleContent}
              </ThinScroller>
            </CardContent>
          </Card>

          {/* Ultra Thin Scroller */}
          <Card>
            <CardHeader>
              <CardTitle>Ultra Thin Scroller</CardTitle>
            </CardHeader>
            <CardContent>
              <ThinScroller
                variant="ultra-thin"
                className="h-64 border border-border/50 rounded"
              >
                {sampleContent}
              </ThinScroller>
            </CardContent>
          </Card>

          {/* Auto Hide Scroller */}
          <Card>
            <CardHeader>
              <CardTitle>Auto Hide Scroller</CardTitle>
            </CardHeader>
            <CardContent>
              <ThinScroller
                variant="auto-hide"
                className="h-64 border border-border/50 rounded"
              >
                {sampleContent}
              </ThinScroller>
            </CardContent>
          </Card>

          {/* Accent Scroller */}
          <Card>
            <CardHeader>
              <CardTitle>Accent Scroller</CardTitle>
            </CardHeader>
            <CardContent>
              <ThinScroller
                variant="accent"
                className="h-64 border border-border/50 rounded"
              >
                {sampleContent}
              </ThinScroller>
            </CardContent>
          </Card>
        </div>

        {/* Horizontal Scrolling Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Horizontal Scrolling</CardTitle>
          </CardHeader>
          <CardContent>
            <ThinScroller
              variant="default"
              className="h-32 border border-border/50 rounded overflow-x-auto"
            >
              <div className="flex">{wideContent}</div>
            </ThinScroller>
          </CardContent>
        </Card>

        {/* Radix ScrollArea Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Radix ScrollArea with Thin Scrollbar</CardTitle>
          </CardHeader>
          <CardContent>
            <ThinScrollArea
              variant="default"
              className="h-64 border border-border/50 rounded"
            >
              {sampleContent}
            </ThinScrollArea>
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">CSS Classes:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  <code className="bg-muted px-1 rounded">thin-scrollbar</code>{" "}
                  - Default thin scrollbar (6px)
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">
                    ultra-thin-scrollbar
                  </code>{" "}
                  - Ultra thin scrollbar (4px)
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">
                    auto-hide-scrollbar
                  </code>{" "}
                  - Hidden scrollbar
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">
                    accent-scrollbar
                  </code>{" "}
                  - Primary color scrollbar
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">smooth-scroll</code> -
                  Smooth scrolling behavior
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">React Components:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  <code className="bg-muted px-1 rounded">ThinScroller</code> -
                  Simple div with thin scrollbar
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">ThinScrollArea</code>{" "}
                  - Radix-based scroll area with thin scrollbar
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

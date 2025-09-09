"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, ExternalLink, Loader2, Share2, Clipboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CreateLinkResponse } from "@/types/link";

interface UrlShortenerFormProps {
  isAuthenticated?: boolean;
}

export function UrlShortenerForm({
  isAuthenticated = false,
}: UrlShortenerFormProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CreateLinkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Use different endpoints based on authentication status
      const endpoint = isAuthenticated ? "/api/links" : "/api/shorten";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent with the request
        body: JSON.stringify({
          originalUrl: url.trim(),
          title: title.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to shorten URL");
      }

      setResult(data);
      setUrl("");
      setTitle("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually",
        variant: "destructive",
      });
    }
  };

  const shareLink = async (url: string, title?: string) => {
    try {
      // Check if Web Share API is supported
      if (navigator.share) {
        await navigator.share({
          title: title || "Check out this link",
          text: title || "Here's a shortened link for you",
          url: url,
        });
        toast({
          title: "Shared!",
          description: "Link shared successfully",
        });
      } else {
        // Fallback to clipboard copy
        await copyToClipboard(url);
        toast({
          title: "Copied!",
          description: "Link copied to clipboard (sharing not supported)",
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // User cancelled the share dialog
        return;
      }
      // Fallback to clipboard copy on error
      await copyToClipboard(url);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        toast({
          title: "Pasted!",
          description: "URL pasted from clipboard",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to paste",
        description: "Please paste the URL manually",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
                type="url"
                placeholder="Enter your long URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full h-14 text-lg bg-input border-border/50 focus:border-primary/50 transition-all duration-200 focus:scale-[1.02] focus:shadow-lg pr-12"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={pasteFromClipboard}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 animate-hover-scale border border-border/30 bg-background/50 hover:bg-background/80 rounded-md"
                disabled={isLoading}
                title="Paste from clipboard"
              >
                <Clipboard className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
            <Button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="h-14 px-10 font-medium text-lg animate-hover-glow"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Shortening...
                </>
              ) : (
                "Shorten"
              )}
            </Button>
          </div>

          {isAuthenticated && (
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Give your link a title (optional)..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-12 text-base bg-input border-border/50 focus:border-primary/50 transition-all duration-200 focus:scale-[1.02] focus:shadow-lg"
                disabled={isLoading}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Add a custom title to make it easier to find your links later
              </p>
            </div>
          )}
        </div>
      </form>

      {error && (
        <Card className="border-destructive/20 bg-destructive/5 animate-bounce-in">
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-destructive font-medium">{error}</p>

              {/* Show additional context for specific error types */}
              {error.includes("blocked") || error.includes("rejected") ? (
                <div className="mt-2 p-2 bg-destructive/10 rounded text-xs text-destructive/80">
                  <p>
                    💡 <strong>Tip:</strong> Try using a different URL or check
                    if the website is accessible.
                  </p>
                </div>
              ) : error.includes("Network error") ? (
                <div className="mt-2 p-2 bg-destructive/10 rounded text-xs text-destructive/80">
                  <p>
                    💡 <strong>Tip:</strong> Check your internet connection and
                    try again.
                  </p>
                </div>
              ) : error.includes("timeout") ? (
                <div className="mt-2 p-2 bg-destructive/10 rounded text-xs text-destructive/80">
                  <p>
                    💡 <strong>Tip:</strong> The service is slow right now.
                    Please try again in a moment.
                  </p>
                </div>
              ) : error.includes("rate limit") ? (
                <div className="mt-2 p-2 bg-destructive/10 rounded text-xs text-destructive/80">
                  <p>
                    💡 <strong>Tip:</strong> Please wait a few seconds before
                    trying again.
                  </p>
                </div>
              ) : error.includes("Invalid URL") ? (
                <div className="mt-2 p-2 bg-destructive/10 rounded text-xs text-destructive/80">
                  <p>
                    💡 <strong>Tip:</strong> Make sure the URL starts with
                    http:// or https://
                  </p>
                </div>
              ) : null}
            </div>

            {error.includes("create an account") && (
              <div className="mt-3 pt-3 border-t border-destructive/20">
                <p className="text-sm text-muted-foreground">
                  <a
                    href="/auth/sign-up"
                    className="font-medium text-primary hover:underline transition-all duration-200 hover:scale-105"
                  >
                    Create an account
                  </a>{" "}
                  to shorten links and track analytics
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="border-border/50 shadow-sm animate-bounce-in animate-hover-lift">
          <CardContent className="p-6 space-y-4">
            {result.title && (
              <div className="space-y-2 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Title
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {result.title}
                </p>
              </div>
            )}
            <div className="space-y-2 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Original URL
              </p>
              <p className="text-sm text-foreground break-all">
                {result.originalUrl}
              </p>
            </div>
            <div className="space-y-3 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Shortened URL
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-muted/30 rounded-md transition-all duration-200 hover:bg-muted/50">
                  <span className="text-sm text-primary break-all">
                    {result.shortUrl}
                  </span>
                </div>
                <div className="flex justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.shortUrl)}
                    className="h-9 px-4 cursor-pointer relative animate-hover-scale"
                    disabled={false}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                    {showCopySuccess && (
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-success text-success-foreground text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap animate-success-bounce">
                        Link copied to clipboard!
                      </div>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 cursor-pointer animate-hover-scale"
                    onClick={() => shareLink(result.shortUrl, result.title)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isAuthenticated && !error && (
        <Card className="border-border/50 bg-muted/20 animate-fade-in animate-hover-lift">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              <a
                href="/auth/sign-up"
                className="font-medium text-primary hover:underline transition-all duration-200 hover:scale-105"
              >
                Create an account
              </a>{" "}
              to track your links and view analytics
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

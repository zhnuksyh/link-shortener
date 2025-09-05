"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, ExternalLink, Loader2, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CreateLinkResponse } from "@/types/link";

interface UrlShortenerFormProps {
  isAuthenticated?: boolean;
}

export function UrlShortenerForm({
  isAuthenticated = false,
}: UrlShortenerFormProps) {
  const [url, setUrl] = useState("");
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
        body: JSON.stringify({
          originalUrl: url.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to shorten URL");
      }

      setResult(data);
      setUrl("");
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

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            type="url"
            placeholder="Enter your long URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 h-14 text-lg bg-input border-border/50 focus:border-primary/50"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="h-14 px-10 font-medium text-lg"
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
      </form>

      {error && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
            {error.includes("create an account") && (
              <div className="mt-3 pt-3 border-t border-destructive/20">
                <p className="text-sm text-muted-foreground">
                  <a
                    href="/auth/sign-up"
                    className="font-medium text-primary hover:underline"
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
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6 space-y-4">
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
                <div className="p-3 bg-muted/30 rounded-md">
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
                    className="h-9 px-4 cursor-pointer relative"
                    disabled={false}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                    {showCopySuccess && (
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                        Link copied to clipboard!
                      </div>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(result.shortUrl);
                      toast({
                        title: "Copied!",
                        description: "Link copied to clipboard",
                      });
                    }}
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
        <Card className="border-border/50 bg-muted/20">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              <a
                href="/auth/sign-up"
                className="font-medium text-primary hover:underline"
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

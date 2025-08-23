"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, ExternalLink, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CreateLinkResponse } from "@/types/link";

interface UrlShortenerFormProps {
  isAuthenticated?: boolean;
}

export function UrlShortenerForm({
  isAuthenticated = false,
}: UrlShortenerFormProps) {
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CreateLinkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
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
          customAlias: customAlias.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to shorten URL");
      }

      setResult(data);
      setUrl("");
      setCustomAlias("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Short URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="url"
            placeholder="Enter your long URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 h-12 text-base bg-input border-border/50 focus:border-primary/50"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="h-12 px-8 font-medium"
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
          <div className="flex flex-col gap-2">
            <Input
              type="text"
              placeholder="Custom alias (optional)"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              className="h-10 text-sm bg-input border-border/50 focus:border-primary/50"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Create a custom short link (e.g., "my-link" → tinyurl.com/my-link)
            </p>
          </div>
        )}
      </form>

      {error && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Original URL
              </p>
              <p className="text-sm text-foreground break-all">
                {result.originalUrl}
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Shortened URL
              </p>
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
                <code className="flex-1 text-sm font-mono text-primary break-all">
                  {result.shortUrl}
                </code>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(result.shortUrl)}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(result.shortUrl, "_blank")}
                    className="h-8 w-8 p-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isAuthenticated && (
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

"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Copy,
  ExternalLink,
  Loader2,
  Share2,
  MessageCircle,
  Mail,
  Twitter,
} from "lucide-react";
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
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
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

  const shareToWhatsApp = (url: string) => {
    const message = `Check out this link: ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const shareToEmail = (url: string) => {
    const subject = "Check out this link";
    const body = `I thought you might be interested in this link: ${url}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const shareToTwitter = (url: string) => {
    const text = `Check out this link: ${url}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}`;
    window.open(twitterUrl, "_blank");
  };

  const shareViaWebAPI = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this link",
          text: "I thought you might be interested in this link",
          url: url,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
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

                  <Dialog
                    open={showShareDialog}
                    onOpenChange={setShowShareDialog}
                  >
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 px-4 cursor-pointer"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Share Link</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <span className="text-sm text-primary break-all">
                            {result.shortUrl}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              shareToWhatsApp(result.shortUrl);
                              setShowShareDialog(false);
                            }}
                            className="h-20 flex flex-col items-center justify-center gap-3 py-6 px-4 hover:bg-green-50 hover:border-green-200 transition-colors"
                          >
                            <MessageCircle className="h-6 w-6 text-green-600" />
                            <span className="text-sm font-medium">
                              WhatsApp
                            </span>
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              shareToEmail(result.shortUrl);
                              setShowShareDialog(false);
                            }}
                            className="h-20 flex flex-col items-center justify-center gap-3 py-6 px-4 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                          >
                            <Mail className="h-6 w-6 text-blue-600" />
                            <span className="text-sm font-medium">Email</span>
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              shareToTwitter(result.shortUrl);
                              setShowShareDialog(false);
                            }}
                            className="h-20 flex flex-col items-center justify-center gap-3 py-6 px-4 hover:bg-sky-50 hover:border-sky-200 transition-colors"
                          >
                            <Twitter className="h-6 w-6 text-sky-600" />
                            <span className="text-sm font-medium">X</span>
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              shareViaWebAPI(result.shortUrl);
                              setShowShareDialog(false);
                            }}
                            className="h-20 flex flex-col items-center justify-center gap-3 py-6 px-4 hover:bg-purple-50 hover:border-purple-200 transition-colors"
                          >
                            <Share2 className="h-6 w-6 text-purple-600" />
                            <span className="text-sm font-medium">More</span>
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
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

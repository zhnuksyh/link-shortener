"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function TestPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testTinyURL = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/shorten", {
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
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>

      <Card className="max-w-md">
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Test URL:</label>
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1"
            />
          </div>

          <Button
            onClick={testTinyURL}
            disabled={isLoading || !url.trim()}
            className="w-full"
          >
            {isLoading ? "Testing..." : "Test TinyURL API"}
          </Button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm font-medium text-green-800">Success!</p>
              <p className="text-sm text-green-700 mt-1">
                Short URL: {result.shortUrl}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

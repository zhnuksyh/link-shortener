"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestAuthPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAuth = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/auth-test", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const testLinksAPI = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/links", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const testCookieDebug = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/debug-cookies", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const testAuthMethods = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Test GET
      const getResponse = await fetch("/api/test-auth-methods", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const getData = await getResponse.json();

      // Test POST
      const postResponse = await fetch("/api/test-auth-methods", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const postData = await postResponse.json();

      setResult({
        get: getData,
        post: postData,
        comparison: {
          getCookies: getData.cookies?.count || 0,
          postCookies: postData.cookies?.count || 0,
          cookiesMatch:
            JSON.stringify(getData.cookies) ===
            JSON.stringify(postData.cookies),
        },
      });
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Button onClick={testAuth} disabled={loading} variant="default">
              {loading ? "Testing..." : "Test Auth Endpoint"}
            </Button>
            <Button
              onClick={testLinksAPI}
              disabled={loading}
              variant="secondary"
            >
              {loading ? "Testing..." : "Test Links API"}
            </Button>
            <Button
              onClick={testCookieDebug}
              disabled={loading}
              variant="outline"
            >
              {loading ? "Testing..." : "Debug Cookies"}
            </Button>
            <Button
              onClick={testAuthMethods}
              disabled={loading}
              variant="destructive"
            >
              {loading ? "Testing..." : "Compare GET vs POST"}
            </Button>
          </div>

          {result && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Result:</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

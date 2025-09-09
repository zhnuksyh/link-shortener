"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CookieInspectorPage() {
  const [cookies, setCookies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const inspectCookies = () => {
    if (typeof window === "undefined") return;

    setLoading(true);

    // Get all cookies from document.cookie
    const cookieString = document.cookie;
    const cookieArray = cookieString
      .split(";")
      .map((cookie) => {
        const [name, value] = cookie.trim().split("=");
        return {
          name: name || "",
          value: value || "",
          hasValue: !!value,
          valueLength: value?.length || 0,
        };
      })
      .filter((cookie) => cookie.name);

    setCookies(cookieArray);
    setLoading(false);
  };

  const clearCookies = () => {
    if (typeof window === "undefined") return;

    // Clear all cookies by setting them to expire in the past
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    setCookies([]);
  };

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      inspectCookies();
    }
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto p-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Cookie Inspector</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Cookie Inspector</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={inspectCookies} disabled={loading}>
              {loading ? "Inspecting..." : "Refresh Cookies"}
            </Button>
            <Button onClick={clearCookies} variant="destructive">
              Clear All Cookies
            </Button>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Current Cookies:</h3>
            {cookies.length === 0 ? (
              <p className="text-gray-500">No cookies found</p>
            ) : (
              <div className="space-y-2">
                {cookies.map((cookie, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg"
                  >
                    <div className="font-mono text-sm">
                      <div>
                        <strong>Name:</strong> {cookie.name}
                      </div>
                      <div>
                        <strong>Value:</strong> {cookie.value.substring(0, 100)}
                        {cookie.value.length > 100 ? "..." : ""}
                      </div>
                      <div>
                        <strong>Length:</strong> {cookie.valueLength}
                      </div>
                      <div>
                        <strong>Has Value:</strong>{" "}
                        {cookie.hasValue ? "Yes" : "No"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Raw Cookie String:</h3>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-sm">
              {typeof window !== "undefined"
                ? document.cookie || "No cookies found"
                : "Loading..."}
            </pre>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Environment Info:</h3>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <div>
                <strong>Domain:</strong>{" "}
                {typeof window !== "undefined"
                  ? window.location.hostname
                  : "Loading..."}
              </div>
              <div>
                <strong>Protocol:</strong>{" "}
                {typeof window !== "undefined"
                  ? window.location.protocol
                  : "Loading..."}
              </div>
              <div>
                <strong>User Agent:</strong>{" "}
                {typeof window !== "undefined"
                  ? navigator.userAgent.substring(0, 100) + "..."
                  : "Loading..."}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

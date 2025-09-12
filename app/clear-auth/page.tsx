"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClearAuthPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear all auth-related storage
    if (typeof window !== "undefined") {
      // Clear localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes("sb-")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      // Clear sessionStorage
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.includes("sb-")) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach((key) => sessionStorage.removeItem(key));

      console.log("Cleared auth storage:", {
        localStorage: keysToRemove,
        sessionStorage: sessionKeysToRemove,
      });

      // Redirect to login after clearing
      setTimeout(() => {
        router.push("/auth/login");
      }, 1000);
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          Clearing Authentication Storage
        </h1>
        <p className="text-gray-600">
          Please wait while we clear old authentication data...
        </p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

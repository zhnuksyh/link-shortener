"use client";

import type React from "react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader isAuthenticated={false} />

      <div className="flex-1 flex w-full items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex justify-center animate-bounce-in">
            <Image
              src="/knucklelink-logo.png"
              alt="KnuckleLink Logo"
              width={100}
              height={100}
              className="h-16 w-16 transition-transform duration-200 hover:rotate-12"
            />
          </div>
          <Card className="border-border/50 shadow-sm animate-scale-in animate-hover-lift">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl font-semibold text-foreground animate-fade-in animate-stagger-1">
                Welcome back
              </CardTitle>
              <CardDescription className="text-muted-foreground animate-fade-in animate-stagger-2">
                Sign in to your account to manage your links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2 animate-slide-up animate-stagger-3">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-input border-border/50 transition-all duration-200 focus:scale-[1.02] focus:shadow-lg"
                  />
                </div>
                <div className="space-y-2 animate-slide-up animate-stagger-4">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-input border-border/50 transition-all duration-200 focus:scale-[1.02] focus:shadow-lg"
                  />
                </div>
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 animate-bounce-in">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full animate-hover-glow"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
              <div className="mt-6 text-center animate-fade-in">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    href="/auth/sign-up"
                    className="font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-all duration-200 hover:scale-105"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

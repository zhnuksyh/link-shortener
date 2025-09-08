"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

interface SiteHeaderProps {
  isAuthenticated?: boolean;
  userEmail?: string;
}

export function SiteHeader({
  isAuthenticated = false,
  userEmail,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-slide-up">
      <div className="w-full flex h-16 items-center justify-center px-4">
        <div className="flex items-center justify-between w-full max-w-6xl">
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/knucklelink-logo.png"
              alt="KnuckleLink"
              className="h-8 w-8"
            />
            <span className="font-semibold text-xl text-foreground">
              KnuckleLink
            </span>
          </Link>

          <nav className="flex items-center space-x-4">
            <div className="animate-fade-in animate-stagger-1">
              <ThemeToggle />
            </div>
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="animate-slide-in-right animate-stagger-2"
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="animate-slide-in-right animate-stagger-3"
                >
                  <Link href="/auth/logout">Sign out</Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="animate-slide-in-right animate-stagger-2"
                >
                  <Link href="/auth/login">Sign in</Link>
                </Button>
                <Button
                  asChild
                  className="animate-slide-in-right animate-stagger-3"
                >
                  <Link href="/auth/sign-up">Sign up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

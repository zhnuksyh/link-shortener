"use client";

import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import Link from "next/link";

interface SiteHeaderProps {
  isAuthenticated?: boolean;
  userEmail?: string;
}

export function SiteHeader({
  isAuthenticated = false,
  userEmail,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Link2 className="h-6 w-6 text-primary" />
          <span className="font-semibold text-xl text-foreground">
            KnuckleLink
          </span>
        </Link>

        <nav className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/logout">Sign out</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

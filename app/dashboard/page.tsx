"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { LinkStatsCard } from "@/components/link-stats-card";
import { LinksTable } from "@/components/links-table";
import { UrlShortenerForm } from "@/components/url-shortener-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Link2, BarChart3 } from "lucide-react";
import type { Link, GetLinksResponse } from "@/types/link";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLinks: 0,
    activeLinks: 0,
  });
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/auth/login");
        return;
      }

      setUser(user);
      await fetchLinks();
    };

    checkUser();
  }, []);

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/links");

      if (!response.ok) {
        throw new Error("Failed to fetch links");
      }

      const data: GetLinksResponse = await response.json();
      setLinks(data.links);

      // Calculate stats
      const activeLinks = data.links.filter(
        (link) => link.isActive === true
      ).length;

      setStats({
        totalLinks: data.links.length,
        activeLinks,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your links",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      const response = await fetch(`/api/links/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete link");
      }

      toast({
        title: "Success",
        description: "Link deleted successfully",
      });

      await fetchLinks();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/links/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update link");
      }

      toast({
        title: "Success",
        description: `Link ${
          isActive ? "activated" : "deactivated"
        } successfully`,
      });

      await fetchLinks();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update link",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background thin-scrollbar">
        <SiteHeader isAuthenticated={true} userEmail={user?.email} />
        <main className="w-full flex justify-center px-4 py-8">
          <div className="w-full max-w-6xl">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">
                  Loading your dashboard...
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background thin-scrollbar">
      <SiteHeader isAuthenticated={true} userEmail={user?.email} />

      <main className="w-full flex justify-center px-4 py-8">
        <div className="w-full max-w-6xl space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage your shortened links and view analytics
              </p>
            </div>
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LinkStatsCard
              title="Total Links"
              value={stats.totalLinks}
              description="Links you've created"
              icon={<Link2 className="h-4 w-4" />}
            />
            <LinkStatsCard
              title="Active Links"
              value={stats.activeLinks}
              description="Currently working links"
              icon={<BarChart3 className="h-4 w-4" />}
            />
          </div>

          {/* Quick Shorten */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground text-center">
              Create New Link
            </h2>
            <UrlShortenerForm isAuthenticated={true} />
          </div>

          {/* Links Table */}
          <LinksTable
            links={links}
            onDelete={handleDeleteLink}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </main>
    </div>
  );
}

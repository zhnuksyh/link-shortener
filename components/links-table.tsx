"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  ExternalLink,
  MoreHorizontal,
  Power,
  Search,
  Share2,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Link } from "@/types/link";

interface LinksTableProps {
  links: Link[];
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

export function LinksTable({
  links,
  onDelete,
  onToggleStatus,
}: LinksTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredLinks = links.filter(
    (link) =>
      link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (link.title &&
        link.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  const shareLink = async (url: string, title?: string) => {
    try {
      // Check if Web Share API is supported
      if (navigator.share) {
        await navigator.share({
          title: title || "Check out this link",
          text: title || "Here's a shortened link for you",
          url: url,
        });
        toast({
          title: "Shared!",
          description: "Link shared successfully",
        });
      } else {
        // Fallback to clipboard copy
        await copyToClipboard(url);
        toast({
          title: "Copied!",
          description: "Link copied to clipboard (sharing not supported)",
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // User cancelled the share dialog
        return;
      }
      // Fallback to clipboard copy on error
      await copyToClipboard(url);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateUrl = (url: string, maxLength = 50) => {
    return url.length > maxLength ? `${url.substring(0, maxLength)}...` : url;
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-semibold">Your Links</CardTitle>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 transition-colors duration-200 z-10 pointer-events-none" />
            <Input
              placeholder="Search by title, URL, or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border/50 transition-all duration-200 focus:scale-[1.02] focus:shadow-lg"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredLinks.length === 0 ? (
          <div className="text-center py-8 animate-fade-in">
            <p className="text-muted-foreground">
              {searchTerm
                ? "No links found matching your search."
                : "No links created yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto thin-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title / Original URL</TableHead>
                  <TableHead className="text-center">Short Code</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinks.map((link, index) => (
                  <TableRow
                    key={link.id}
                    className="animate-slide-up transition-colors duration-200 hover:bg-muted/30"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <TableCell>
                      <div className="space-y-1">
                        {link.title && (
                          <p className="font-semibold text-sm text-foreground">
                            {link.title}
                          </p>
                        )}
                        <p
                          className={`text-sm ${
                            link.title
                              ? "text-muted-foreground"
                              : "font-medium text-foreground"
                          }`}
                        >
                          {truncateUrl(link.originalUrl)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {link.shortUrl}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          link.shortCode.includes("Invalid request")
                            ? "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                            : "bg-muted/50"
                        }`}
                      >
                        {link.shortCode}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          link.isActive !== false ? "default" : "secondary"
                        }
                        className={
                          link.isActive !== false
                            ? "bg-success/10 text-success border-success/20 hover:bg-success/20"
                            : "bg-red-100 text-red-800 border-red-200 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30"
                        }
                      >
                        {link.isActive !== false ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {formatDate(link.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 animate-hover-scale"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => copyToClipboard(link.shortUrl)}
                            className="cursor-pointer"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => shareLink(link.shortUrl, link.title)}
                            className="cursor-pointer"
                          >
                            <Share2 className="mr-2 h-4 w-4" />
                            Share Link
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => window.open(link.shortUrl, "_blank")}
                            className="cursor-pointer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open Link
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              onToggleStatus(link.id, link.isActive === false)
                            }
                            className="cursor-pointer"
                          >
                            <Power className="mr-2 h-4 w-4" />
                            {link.isActive !== false
                              ? "Deactivate"
                              : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(link.id)}
                            variant="destructive"
                            className="cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

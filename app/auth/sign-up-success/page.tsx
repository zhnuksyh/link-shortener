import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader isAuthenticated={false} />

      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-2xl font-semibold text-foreground">
                Check your email
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                We've sent you a confirmation link to complete your registration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  Please check your email and click the confirmation link to
                  activate your account. You may need to check your spam folder.
                </p>
              </div>
              <Button
                asChild
                className="w-full bg-transparent"
                variant="outline"
              >
                <Link href="/auth/login">Return to sign in</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

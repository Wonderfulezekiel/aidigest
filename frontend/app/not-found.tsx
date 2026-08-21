import React from "react";
import Link from "next/link";
import { Bot, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-6 shadow-xs">
        <Bot className="h-8 w-8" />
      </div>
      <h1 className="text-6xl font-extrabold tracking-tight text-foreground">404</h1>
      <h2 className="mt-3 text-xl font-semibold text-foreground">Page Not Found</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        The page or document section you are looking for doesn&apos;t exist or may have been moved.
      </p>

      <div className="mt-8 flex gap-4">
        <Link href="/dashboard">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

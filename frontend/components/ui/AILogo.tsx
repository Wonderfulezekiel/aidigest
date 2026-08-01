"use client";

import React from "react";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface AILogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function AILogo({ className, size = "md", showText = true }: AILogoProps) {
  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-4.5 w-4.5",
    lg: "h-5 w-5",
  };

  const boxSizes = {
    sm: "h-7 w-7 rounded-lg",
    md: "h-8.5 w-8.5 rounded-xl",
    lg: "h-10 w-10 rounded-xl",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* Modern Solid Single-Color Robot AI Icon Badge */}
      <div
        className={cn(
          "flex items-center justify-center bg-primary text-primary-foreground font-bold shadow-xs transition-transform hover:scale-105",
          boxSizes[size]
        )}
      >
        <Bot className={cn("shrink-0", iconSizes[size])} />
      </div>

      {showText && (
        <span className={cn("font-bold tracking-tight text-foreground flex items-center gap-1", textSizes[size])}>
          <span>PDF</span>
          <span className="font-extrabold text-primary">AIDigest</span>
        </span>
      )}
    </div>
  );
}

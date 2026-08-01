"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  FileText,
  MessageSquare,
  User,
  Settings,
  Plus,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { AILogo } from "@/components/ui/AILogo";

interface AppSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function AppSidebar({ className, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Upload PDF", href: "/upload", icon: Upload },
    { name: "My Documents", href: "/documents", icon: FileText },
    { name: "Chat History", href: "/chat/history", icon: MessageSquare },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-border/80">
        <Link href="/dashboard">
          <AILogo size="md" />
        </Link>
      </div>

      {/* Quick Action Button */}
      <div className="p-4">
        <Link href="/upload" onClick={onNavigate}>
          <Button className="w-full justify-center gap-2 shadow-xs" size="md">
            <Plus className="h-4 w-4" />
            <span>Upload Document</span>
          </Button>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Clean Footer Info */}
      <div className="p-4 border-t border-border/80 text-xs text-muted-foreground flex items-center gap-2.5">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-medium text-foreground flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI Intelligence Active
        </span>
      </div>
    </aside>
  );
}

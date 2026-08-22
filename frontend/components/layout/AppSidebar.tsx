"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  FileText,
  MessageSquare,
  Award,
  Layers,
  User,
  Settings,
  Plus,
  Bot,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { AILogo } from "@/components/ui/AILogo";
import { useMockData } from "@/context/MockDataContext";

interface AppSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function AppSidebar({ className, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const { logout } = useMockData();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Upload PDF", href: "/upload", icon: Upload },
    { name: "My Documents", href: "/documents", icon: FileText },
    { name: "Chat History", href: "/chat/history", icon: MessageSquare },
    { name: "Quizzes", href: "/quiz", icon: Award },
    { name: "Flashcards", href: "/flashcards", icon: Layers },
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
      <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
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

      {/* Clean Footer Info & Logout */}
      <div className="p-4 border-t border-border/80 space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium text-foreground flex items-center gap-1.5">
            <Bot className="h-3.5 w-3.5 text-primary" />
            Assistant Active
          </span>
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

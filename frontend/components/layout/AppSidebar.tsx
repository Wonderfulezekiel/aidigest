"use client";

import React, { useState, useEffect } from "react";
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
  PanelLeftClose,
  PanelLeftOpen,
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load persistence from localStorage on mount (desktop only)
  useEffect(() => {
    if (!onNavigate && typeof window !== "undefined") {
      const saved = localStorage.getItem("aidigest_sidebar_collapsed");
      if (saved === "true") {
        setIsCollapsed(true);
      }
    }
  }, [onNavigate]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("aidigest_sidebar_collapsed", String(next));
      }
      return next;
    });
  };

  // If in mobile drawer (onNavigate is set), always show expanded full view
  const collapsed = onNavigate ? false : isCollapsed;

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
        "flex h-full flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out select-none relative",
        collapsed ? "w-[72px]" : "w-64",
        className
      )}
    >
      {/* Brand Header & Collapse Toggle */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-border/80 transition-all",
          collapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        {!collapsed ? (
          <>
            <Link href="/dashboard" className="transition-opacity hover:opacity-90">
              <AILogo size="md" showText={true} />
            </Link>
            <button
              onClick={toggleCollapse}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors cursor-pointer"
              title="Collapse sidebar for wide view"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-4.5 w-4.5" />
            </button>
          </>
        ) : (
          <div className="flex items-center justify-center w-full relative">
            <Link href="/dashboard" title="Dashboard" className="transition-opacity hover:opacity-90">
              <AILogo size="sm" showText={false} />
            </Link>
            <button
              onClick={toggleCollapse}
              className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 h-6 w-6 rounded-full border border-border bg-card shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all cursor-pointer"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="h-3.5 w-3.5 text-primary" />
            </button>
          </div>
        )}
      </div>

      {/* Quick Action Button */}
      <div className={cn("transition-all", collapsed ? "p-2 flex justify-center" : "p-4")}>
        <Link href="/upload" onClick={onNavigate} className="w-full">
          {!collapsed ? (
            <Button className="w-full justify-center gap-2 shadow-xs" size="md">
              <Plus className="h-4 w-4 shrink-0" />
              <span>Upload Document</span>
            </Button>
          ) : (
            <Button
              className="h-10 w-10 p-0 mx-auto flex items-center justify-center rounded-xl shadow-xs"
              size="sm"
              title="Upload Document"
            >
              <Plus className="h-4 w-4 shrink-0" />
            </Button>
          )}
        </Link>
      </div>

      {/* Navigation List */}
      <nav className={cn("flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden", collapsed ? "px-2 py-2" : "px-3 py-2")}>
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          if (collapsed) {
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                title={item.name}
                className={cn(
                  "flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all relative group",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {/* Tooltip on hover */}
                <span className="absolute left-full ml-3 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-border">
                  {item.name}
                </span>
              </Link>
            );
          }

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
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Clean Footer Info & Logout */}
      <div className={cn("border-t border-border/80 transition-all", collapsed ? "p-2 space-y-2 flex flex-col items-center" : "p-4 space-y-3")}>
        {!collapsed ? (
          <>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium text-foreground flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5 text-primary" />
                Assistant Active
              </span>
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <>
            <div
              className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse my-1"
              title="Assistant Active"
            />
            <button
              onClick={logout}
              className="h-10 w-10 rounded-xl flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors cursor-pointer relative group"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
              <span className="absolute left-full ml-3 px-2 py-1 bg-popover text-destructive text-xs rounded-md shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 font-medium border border-border">
                Sign Out
              </span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

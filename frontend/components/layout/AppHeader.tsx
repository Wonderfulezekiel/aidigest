"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Moon, Sun, Menu, X, User, LogOut, FileText } from "lucide-react";
import { useTheme } from "@/context/ThemeProvider";
import { useMockData } from "@/context/MockDataContext";
import { Button } from "@/components/ui/Button";
import { AppSidebar } from "./AppSidebar";

export function AppHeader() {
  const { theme, setTheme } = useTheme();
  const { userProfile, documents } = useMockData();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredDocs = searchQuery.trim()
    ? documents.filter(
        (d) =>
          d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.fileName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Determine current page title based on path
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/upload") return "Upload PDF";
    if (pathname === "/documents") return "My Documents";
    if (pathname === "/chat/history") return "Chat History";
    if (pathname === "/profile") return "User Profile";
    if (pathname === "/settings") return "Settings";
    if (pathname.includes("/summary")) return "AI Document Summary";
    if (pathname.includes("/chat")) return "Conversational AI Chat";
    if (pathname.startsWith("/documents/")) return "Document Details";
    return "PDF AIDigest";
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-4 sm:px-6 backdrop-blur-md">
        {/* Left: Mobile Menu Toggle & Title */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileDrawerOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
            {getPageTitle()}
          </h1>
        </div>

        {/* Center: Quick Search Bar */}
        <div className="relative hidden md:block w-72 lg:w-96">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search uploaded documents..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-4 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && searchQuery.trim() !== "" && (
            <div className="absolute left-0 right-0 top-11 z-50 rounded-lg border border-border bg-card p-2 shadow-lg animate-in fade-in-50">
              <div className="flex items-center justify-between px-2 py-1 border-b border-border mb-1 text-xs text-muted-foreground">
                <span>Matching Documents ({filteredDocs.length})</span>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {filteredDocs.length > 0 ? (
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {filteredDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery("");
                        router.push(`/documents/${doc.id}`);
                      }}
                      className="w-full text-left flex items-center gap-2.5 rounded-md px-2 py-2 text-xs hover:bg-accent text-foreground transition-colors"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate font-medium">{doc.title}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-muted-foreground">
                  No documents found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle Theme"
            className="rounded-full"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* User Profile Menu */}
          <Link href="/profile" className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs uppercase shadow-xs">
              {userProfile.fullName.charAt(0)}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-foreground">
              {userProfile.fullName}
            </span>
          </Link>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative z-50 w-64 bg-sidebar animate-in slide-in-from-left duration-200">
            <AppSidebar onNavigate={() => setMobileDrawerOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

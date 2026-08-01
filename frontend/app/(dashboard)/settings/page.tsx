"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun, Monitor, Trash2, AlertTriangle, Check } from "lucide-react";
import { useTheme } from "@/context/ThemeProvider";
import { useMockData } from "@/context/MockDataContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { clearAllConversations } = useMockData();
  const router = useRouter();

  const [isClearChatsModalOpen, setIsClearChatsModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);

  const handleClearChats = () => {
    clearAllConversations();
    setIsClearChatsModalOpen(false);
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 2000);
  };

  const handleDeleteAccount = () => {
    setIsDeleteAccountModalOpen(false);
    router.push("/");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in-50">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings & Preferences</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize your application theme, data retention, and account security
        </p>
      </div>

      {/* Theme Preference Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Appearance & Theme</CardTitle>
          <CardDescription className="text-xs">
            Select your preferred visual style powered by Tweakcn UI OKLCH colors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                theme === "dark"
                  ? "border-primary bg-primary/10 ring-2 ring-ring"
                  : "border-border bg-card hover:bg-accent"
              }`}
            >
              <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center">
                <Moon className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-foreground">Dark Mode</span>
            </button>

            <button
              onClick={() => setTheme("light")}
              className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                theme === "light"
                  ? "border-primary bg-primary/10 ring-2 ring-ring"
                  : "border-border bg-card hover:bg-accent"
              }`}
            >
              <div className="h-10 w-10 rounded-full bg-white text-black border border-border flex items-center justify-center">
                <Sun className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-foreground">Light Mode</span>
            </button>

            <button
              onClick={() => setTheme("system")}
              className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                theme === "system"
                  ? "border-primary bg-primary/10 ring-2 ring-ring"
                  : "border-border bg-card hover:bg-accent"
              }`}
            >
              <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                <Monitor className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-foreground">System Default</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Data Management</CardTitle>
          <CardDescription className="text-xs">Manage stored conversations and vector sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
            <div>
              <p className="text-sm font-semibold text-foreground">Delete All Chat History</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Clear all active and archived RAG AI conversations while keeping your PDF documents.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsClearChatsModalOpen(true)}
              className="text-xs text-destructive hover:bg-destructive/10"
            >
              Clear History
            </Button>
          </div>

          {clearedNotice && (
            <div className="p-3 rounded bg-emerald-500/10 text-emerald-500 text-xs font-medium flex items-center gap-1.5">
              <Check className="h-4 w-4" /> All conversation history has been cleared.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone Card */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Danger Zone
          </CardTitle>
          <CardDescription className="text-xs">Irreversible account actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-card">
            <div>
              <p className="text-sm font-semibold text-foreground">Delete PDF AIDigest Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently delete your account, uploaded PDFs, Pinecone vector stores, and all summaries.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteAccountModalOpen(true)}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clear Chats Safeguard Modal */}
      <Modal
        isOpen={isClearChatsModalOpen}
        onClose={() => setIsClearChatsModalOpen(false)}
        title="Clear All Chat History?"
        description="This action will delete all saved conversation threads."
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            All AI chat messages and retrieved vector history will be deleted. This cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsClearChatsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearChats}>
              Yes, Clear All Chats
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Safeguard Modal */}
      <Modal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        title="Delete Account Permanently?"
        description="Are you sure you want to permanently delete your account?"
      >
        <div className="space-y-4">
          <p className="text-xs text-destructive">
            Warning: All your uploaded PDFs, Pinecone vector embeddings, generated summaries, and account data will be permanently wiped.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsDeleteAccountModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Permanently Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

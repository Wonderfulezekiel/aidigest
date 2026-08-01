"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Trash2,
  BookOpen,
  Clock,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { useMockData, ConversationItem } from "@/context/MockDataContext";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

export default function ChatHistoryPage() {
  const { conversations, deleteConversation } = useMockData();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ConversationItem | null>(null);

  const filteredConversations = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.documentTitle.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteConversation(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Chat History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and continue your past AI study conversations across all documents ({conversations.length} total)
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search chat history..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-card pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
        />
      </div>

      {/* Conversations List */}
      {filteredConversations.length > 0 ? (
        <div className="space-y-4">
          {filteredConversations.map((conv) => {
            const lastMsg = conv.messages[conv.messages.length - 1];
            return (
              <Card key={conv.id} className="hover:border-primary/40 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-foreground">
                          {conv.title}
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                          Document: {conv.documentTitle}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[11px]">
                      {conv.messages.length} Messages
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="py-2">
                  {lastMsg && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground space-y-1">
                      <span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">
                        Last message ({lastMsg.role}):
                      </span>
                      <p className="line-clamp-2 text-foreground/90">{lastMsg.message}</p>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Started {formatDate(conv.createdAt)}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteTarget(conv)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Link href={`/documents/${conv.documentId}/chat`}>
                      <Button size="sm" className="gap-1 text-xs">
                        <span>Continue Discussion</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
          <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="text-sm font-semibold">No conversations found</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            You don&apos;t have any active chat threads matching your search.
          </p>
          <Link href="/documents">
            <Button size="sm" className="mt-2">Browse Documents to Chat</Button>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Chat Thread?"
        description="Are you sure you want to delete this conversation thread?"
      >
        <div className="space-y-4">
          {deleteTarget && (
            <p className="text-xs text-muted-foreground p-3 rounded bg-muted">
              Thread: <strong>{deleteTarget.title}</strong> ({deleteTarget.messages.length} messages)
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete Thread
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

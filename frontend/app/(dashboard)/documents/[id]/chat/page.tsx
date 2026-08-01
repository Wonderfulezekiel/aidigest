"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Send,
  ArrowLeft,
  Bot,
  User,
  FileText,
  Sparkles,
} from "lucide-react";
import { useMockData } from "@/context/MockDataContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

export default function DocumentChatPage() {
  const params = useParams();
  const docId = params.id as string;
  const { documents, getConversationByDocId, sendMessage } = useMockData();

  const doc = documents.find((d) => d.id === docId);
  const conversation = getConversationByDocId(docId);

  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showPdfPane, setShowPdfPane] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, isSending]);

  if (!doc || !conversation) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold">Document Not Found</h2>
        <p className="text-sm text-muted-foreground">The requested document for chat does not exist.</p>
        <Link href="/documents">
          <Button variant="outline">Back to Library</Button>
        </Link>
      </div>
    );
  }

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const text = inputMessage;
    setInputMessage("");
    setIsSending(true);
    await sendMessage(conversation.id, text);
    setIsSending(false);
  };

  const samplePrompts = [
    "Explain in simple terms",
    "Key takeaways",
    "Exam summary",
    "Main formulas & definitions",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] animate-in fade-in-50">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border pb-3 mb-3 gap-2">
        <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
          <Link href="/documents" className="text-muted-foreground hover:text-foreground shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-foreground truncate max-w-[200px] sm:max-w-md">
                Chat: {doc.title}
              </h1>
              <Badge variant="success" className="text-[10px] gap-1 shrink-0">
                <Sparkles className="h-3 w-3" />
                Active
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {doc.fileName} • {doc.pageCount} Pages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPdfPane(!showPdfPane)}
            className="hidden md:flex text-xs h-8"
          >
            {showPdfPane ? "Hide PDF Context" : "Show PDF Context"}
          </Button>
          <Link href={`/documents/${doc.id}/summary`}>
            <Button variant="outline" size="sm" className="text-xs h-8">View Summary</Button>
          </Link>
        </div>
      </div>

      {/* Main Dual Pane Content */}
      <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
        {/* Left Pane: PDF Context Preview */}
        {showPdfPane && (
          <div className="hidden md:flex w-1/3 flex-col rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-3 bg-muted/30">
              <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <FileText className="h-4 w-4 text-primary" /> Document Context
              </span>
              <span className="text-[11px] text-muted-foreground">{doc.pageCount} Pages</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs text-muted-foreground leading-relaxed">
              <div className="p-3 rounded-lg bg-muted/40 border border-border">
                <span className="font-bold text-foreground block mb-1">DOCUMENT OVERVIEW</span>
                Interactive discussion enabled for {doc.title}. Ask any question to retrieve answers directly from your material.
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <span className="font-bold block mb-1">Smart Search Enabled:</span>
                Questions automatically query your uploaded handout for precise citations and page references.
              </div>
            </div>
          </div>
        )}

        {/* Right Pane: AI Chat Box */}
        <div className="flex-1 flex flex-col rounded-xl border border-border bg-card overflow-hidden min-w-0">
          {/* Chat Messages List */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-4">
            {conversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shrink-0 mt-1">
                    <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[90%] sm:max-w-[85%] rounded-xl p-3 sm:p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground font-medium shadow-xs"
                      : "bg-muted/50 border border-border text-foreground"
                  }`}
                >
                  <MarkdownRenderer content={msg.message} isUserMessage={msg.role === "user"} />

                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2 border-t border-border/60 space-y-1.5">
                      <span className="text-[11px] font-semibold opacity-80 block">Document References:</span>
                      {msg.citations.map((cit, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-background/80 text-[11px] font-mono border border-border/60 shadow-2xs">
                          <span className="font-bold text-emerald-500 mr-1.5">Page {cit.page}:</span>
                          <span className="text-muted-foreground">&quot;{cit.snippet}&quot;</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground font-bold shrink-0 mt-1">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                )}
              </div>
            ))}

            {isSending && (
              <div className="flex gap-2.5 justify-start">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shrink-0">
                  <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div className="rounded-xl p-3 sm:p-4 bg-muted/50 border border-border text-xs text-muted-foreground flex items-center gap-2">
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
                  <span>AI is thinking and analyzing document...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-2 border-t border-border bg-muted/20 flex gap-2 overflow-x-auto text-xs no-scrollbar">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputMessage(prompt);
                }}
                className="px-3 py-1.5 rounded-full border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground shrink-0 transition-colors text-xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-2.5 sm:p-3 border-t border-border bg-card flex gap-2">
            <input
              type="text"
              placeholder="Ask any question about this document..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isSending}
              className="flex-1 h-9 sm:h-10 rounded-md border border-input bg-background px-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
            <Button type="submit" size="md" disabled={!inputMessage.trim() || isSending} className="gap-1.5 h-9 sm:h-10 px-3.5">
              <span className="hidden sm:inline">Send</span>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

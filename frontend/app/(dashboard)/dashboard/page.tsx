"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  MessageSquare,
  Upload,
  Clock,
  ChevronRight,
  Plus,
  BookOpen,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { useMockData } from "@/context/MockDataContext";
import { formatBytes, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function DashboardPage() {
  const { documents, conversations, userProfile } = useMockData();

  const totalPages = documents.reduce((acc, doc) => acc + doc.pageCount, 0);
  const totalVectors = documents.reduce((acc, doc) => acc + doc.vectorCount, 0);
  const lastConversation = conversations[0];

  return (
    <div className="space-y-8 animate-in fade-in-50">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {userProfile.fullName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your academic PDFs, AI summaries, and study conversations.
          </p>
        </div>
        <Link href="/upload">
          <Button className="gap-2 shadow-xs">
            <Plus className="h-4 w-4" />
            Upload New PDF
          </Button>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Documents</p>
            <p className="text-2xl font-bold text-foreground mt-1">{documents.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{totalPages} pages total</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Conversations</p>
            <p className="text-2xl font-bold text-foreground mt-1">{conversations.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Active study threads</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <MessageSquare className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Indexed Passages</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalVectors}</p>
            <p className="text-xs text-emerald-500 font-medium mt-0.5">Search ready</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Layers className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Summaries Generated</p>
            <p className="text-2xl font-bold text-foreground mt-1">{documents.length * 2}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Executive & Detailed</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <BookOpen className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Quick Upload Widget & Resume Last Chat Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drag and Drop Quick Upload */}
        <Card className="lg:col-span-2 border-dashed border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4" /> Quick Upload Zone
            </CardTitle>
            <CardDescription className="text-xs">
              Upload any lecture note, textbook chapter, or research PDF for instant AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/upload" className="block text-center py-8 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                <Upload className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">Click to browse or drop PDF here</p>
              <p className="text-xs text-muted-foreground mt-1">PDF files up to 50MB</p>
            </Link>
          </CardContent>
        </Card>

        {/* Continue Last Chat Card */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline">Active Study Session</Badge>
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <CardTitle className="text-base mt-2 truncate">
              {lastConversation ? lastConversation.title : "No active chat"}
            </CardTitle>
            <CardDescription className="text-xs truncate">
              {lastConversation ? lastConversation.documentTitle : "Upload a PDF to begin"}
            </CardDescription>
          </CardHeader>

          <CardContent className="py-2">
            {lastConversation ? (
              <div className="p-3 rounded-md bg-muted/40 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground truncate">
                  Latest prompt: &quot;{lastConversation.messages[lastConversation.messages.length - 1]?.message}&quot;
                </p>
                <p className="text-[11px]">{lastConversation.messages.length} messages exchanged</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Start chatting with your documents to see your sessions here.</p>
            )}
          </CardContent>

          <CardFooter className="pt-2">
            {lastConversation ? (
              <Link href={`/documents/${lastConversation.documentId}/chat`} className="w-full">
                <Button variant="outline" size="sm" className="w-full justify-between">
                  <span>Resume Discussion</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/upload" className="w-full">
                <Button size="sm" className="w-full">Upload First PDF</Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Recent Documents Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Recent Documents</h2>
          <Link href="/documents" className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
            View All ({documents.length})
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.slice(0, 3).map((doc) => (
            <Card key={doc.id} className="flex flex-col justify-between hover:border-primary/40 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <Badge variant="success">Ready</Badge>
                </div>
                <CardTitle className="text-sm font-semibold mt-3 line-clamp-2 leading-snug">
                  {doc.title}
                </CardTitle>
                <CardDescription className="text-xs flex items-center gap-2 mt-1">
                  <span>{formatBytes(doc.fileSize)}</span>
                  <span>•</span>
                  <span>{doc.pageCount} pages</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="py-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5" />
                    <span>{doc.vectorCount} passages</span>
                  </div>
                  <span>•</span>
                  <span>{formatDate(doc.uploadDate)}</span>
                </div>
              </CardContent>

              <CardFooter className="pt-3 border-t border-border grid grid-cols-2 gap-2">
                <Link href={`/documents/${doc.id}/summary`}>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    View Summary
                  </Button>
                </Link>
                <Link href={`/documents/${doc.id}/chat`}>
                  <Button size="sm" className="w-full text-xs">
                    Chat with AI
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

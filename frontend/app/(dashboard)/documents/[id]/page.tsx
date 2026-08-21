"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  BookOpen,
  MessageSquare,
  ArrowLeft,
  Award,
  Layers,
  Sparkles,
  Download,
  HardDrive,
} from "lucide-react";
import { useMockData } from "@/context/MockDataContext";
import { formatBytes, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function DocumentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;
  const { documents, deleteDocument } = useMockData();

  const doc = documents.find((d) => d.id === docId);

  if (!doc) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold">Document Not Found</h2>
        <p className="text-sm text-muted-foreground">The requested document could not be located in your library.</p>
        <Link href="/documents">
          <Button variant="outline">Return to Documents</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in-50 pb-12">
      {/* Back Link */}
      <Link href="/documents" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Document Library
      </Link>

      {/* Main Metadata Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="success">Pinecone Indexed</Badge>
            <span className="text-xs font-mono text-muted-foreground">ID: {doc.id}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{doc.title}</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <span>Filename: {doc.fileName}</span>
            <span>•</span>
            <span>Uploaded: {formatDate(doc.uploadDate)}</span>
          </p>
        </div>

        {/* Action Buttons Grid */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/documents/${doc.id}/summary`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <BookOpen className="h-4 w-4" />
              Summary
            </Button>
          </Link>
          <Link href={`/documents/${doc.id}/chat`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <MessageSquare className="h-4 w-4" />
              Chat AI
            </Button>
          </Link>
          <Link href={`/documents/${doc.id}/quiz`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-primary/40 text-primary">
              <Award className="h-4 w-4" />
              Take Quiz
            </Button>
          </Link>
          <Link href={`/documents/${doc.id}/flashcards`}>
            <Button size="sm" className="gap-1.5 text-xs">
              <Layers className="h-4 w-4" />
              Flashcards
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Action Study Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href={`/documents/${doc.id}/summary`} className="block group">
          <Card className="p-4 border-border hover:border-primary/50 transition-all h-full flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <BookOpen className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-foreground">AI Summaries</h3>
              <p className="text-xs text-muted-foreground">Executive overviews, tables, and core concepts.</p>
            </div>
            <span className="text-xs text-primary font-semibold mt-3 inline-block group-hover:underline">
              Read Summary &rarr;
            </span>
          </Card>
        </Link>

        <Link href={`/documents/${doc.id}/chat`} className="block group">
          <Card className="p-4 border-border hover:border-primary/50 transition-all h-full flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <MessageSquare className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-foreground">RAG Chat</h3>
              <p className="text-xs text-muted-foreground">Ask questions with exact page citations.</p>
            </div>
            <span className="text-xs text-primary font-semibold mt-3 inline-block group-hover:underline">
              Start Conversation &rarr;
            </span>
          </Card>
        </Link>

        <Link href={`/documents/${doc.id}/quiz`} className="block group">
          <Card className="p-4 border-border hover:border-primary/50 transition-all h-full flex flex-col justify-between bg-primary/5">
            <div className="space-y-2">
              <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                <Award className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Interactive Quiz</h3>
              <p className="text-xs text-muted-foreground">Adaptive learning quiz with instant AI feedback.</p>
            </div>
            <span className="text-xs text-primary font-semibold mt-3 inline-block group-hover:underline">
              Take AI Quiz &rarr;
            </span>
          </Card>
        </Link>

        <Link href={`/documents/${doc.id}/flashcards`} className="block group">
          <Card className="p-4 border-border hover:border-primary/50 transition-all h-full flex flex-col justify-between bg-emerald-500/5">
            <div className="space-y-2">
              <div className="h-9 w-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Layers className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-foreground">3D Flashcards</h3>
              <p className="text-xs text-muted-foreground">Active recall study deck with flip cards.</p>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-3 inline-block group-hover:underline">
              Study Deck &rarr;
            </span>
          </Card>
        </Link>
      </div>

      {/* Technical Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-medium">File Size</p>
              <p className="text-base font-bold text-foreground">{formatBytes(doc.fileSize)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-medium">Total Pages</p>
              <p className="text-base font-bold text-foreground">{doc.pageCount} pages</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-medium">Pinecone Vectors</p>
              <p className="text-base font-bold text-foreground">{doc.vectorCount} chunks</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Document Information Card */}
      <Card className="shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div>
            <CardTitle className="text-base">Document Content Preview</CardTitle>
            <CardDescription className="text-xs">Extracted text passages and indexed study context</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => alert("Downloading document...")}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-64 rounded-lg border border-border bg-muted/20 p-6 font-mono text-xs text-muted-foreground overflow-y-auto space-y-3">
            <p className="text-foreground font-bold text-sm underline decoration-muted-foreground/30">
              {doc.title.toUpperCase()}
            </p>
            <p className="leading-relaxed">
              [Indexed Passage #1]: Course content introduces fundamental principles, requirements engineering, data gathering techniques, qualitative interviews, and quantitative system evaluations.
            </p>
            <div className="p-3 rounded border border-border bg-card text-foreground">
              <span className="font-semibold text-emerald-500">Key Focus:</span> &quot;Establishing clear requirements is the foundation of successful engineering projects.&quot;
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

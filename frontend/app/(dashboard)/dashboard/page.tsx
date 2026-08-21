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
  Award,
  ArrowRight,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { useMockData } from "@/context/MockDataContext";
import { formatBytes, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function DashboardPage() {
  const { documents, conversations, quizAttempts, userProfile } = useMockData();

  const totalPages = documents.reduce((acc, doc) => acc + doc.pageCount, 0);
  const totalVectors = documents.reduce((acc, doc) => acc + doc.vectorCount, 0);
  const lastConversation = conversations[0];
  const lastQuizAttempt = quizAttempts[0];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 pb-12 w-full max-w-full overflow-hidden">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4 sm:pb-6">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {userProfile.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your academic documents, summaries, quizzes, and study flashcards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/quiz">
            <Button variant="outline" size="sm" className="gap-1.5 shadow-xs text-xs">
              <Award className="h-3.5 w-3.5 text-primary" />
              Quizzes
            </Button>
          </Link>
          <Link href="/upload">
            <Button size="sm" className="gap-1.5 shadow-xs text-xs">
              <Plus className="h-3.5 w-3.5" />
              Upload PDF
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3.5 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Documents</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{documents.length}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{totalPages} pages</p>
          </div>
          <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </Card>

        <Card className="p-3.5 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Quizzes</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{quizAttempts.length}</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Active Recall</p>
          </div>
          <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Award className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </Card>

        <Card className="p-3.5 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Decks</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{documents.length}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">3D Study</p>
          </div>
          <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </Card>

        <Card className="p-3.5 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Chats</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{conversations.length}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Discussions</p>
          </div>
          <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </Card>
      </div>

      {/* Feature Study Cards Launchpad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Adaptive Quiz Launch Card */}
        <Card className="border-border hover:border-primary/50 transition-all p-4 sm:p-6 flex flex-col justify-between bg-gradient-to-br from-primary/5 via-card to-card">
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                <Award className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <Badge variant="default" className="text-[10px] sm:text-xs">Learning Mode</Badge>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">Interactive Quizzes</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Test your understanding with instant feedback, explanations, and topic performance reviews.
            </p>
          </div>

          <div className="pt-4 border-t border-border/80 mt-3 sm:mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {lastQuizAttempt ? `Last Score: ${lastQuizAttempt.percentage}%` : "Ready to practice"}
            </span>
            <Link href="/quiz">
              <Button size="sm" className="gap-1 text-xs">
                <span>Quizzes</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* 3D Flashcards Launch Card */}
        <Card className="border-border hover:border-primary/50 transition-all p-4 sm:p-6 flex flex-col justify-between bg-gradient-to-br from-emerald-500/5 via-card to-card">
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <Badge variant="success" className="text-[10px] sm:text-xs">Active Recall</Badge>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">3D Flashcard Decks</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Review key definitions and formulas with interactive flip cards, mastery sorting, and review filters.
            </p>
          </div>

          <div className="pt-4 border-t border-border/80 mt-3 sm:mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {documents.length} Study Decks
            </span>
            <Link href="/flashcards">
              <Button size="sm" variant="outline" className="gap-1 text-xs border-emerald-500/40 text-foreground hover:bg-emerald-500/10">
                <span>Flashcards</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Documents Grid */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">Document Library</h2>
          <Link href="/documents" className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
            View All ({documents.length})
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {documents.slice(0, 3).map((doc) => (
            <Card key={doc.id} className="flex flex-col justify-between hover:border-primary/40 transition-all">
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <Badge variant="success" className="text-[10px]">Ready</Badge>
                </div>
                <CardTitle className="text-xs sm:text-sm font-semibold mt-2 line-clamp-2 leading-snug break-words">
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
                <Link href={`/documents/${doc.id}/quiz`}>
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                    <Award className="h-3.5 w-3.5 text-primary" />
                    Quiz
                  </Button>
                </Link>
                <Link href={`/documents/${doc.id}/flashcards`}>
                  <Button size="sm" className="w-full text-xs gap-1">
                    <Layers className="h-3.5 w-3.5" />
                    Flashcards
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

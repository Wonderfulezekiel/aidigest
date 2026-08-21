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
  Sparkles,
  ArrowRight,
  CheckCircle2,
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
    <div className="space-y-8 animate-in fade-in-50 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {userProfile.fullName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your academic PDFs, AI summaries, quizzes, and 3D study flashcards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/quiz">
            <Button variant="outline" className="gap-2 shadow-xs text-xs">
              <Award className="h-4 w-4 text-primary" />
              AI Quizzes
            </Button>
          </Link>
          <Link href="/upload">
            <Button className="gap-2 shadow-xs text-xs">
              <Plus className="h-4 w-4" />
              Upload PDF
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Documents</p>
            <p className="text-2xl font-bold text-foreground mt-1">{documents.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{totalPages} pages indexed</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Quizzes Taken</p>
            <p className="text-2xl font-bold text-foreground mt-1">{quizAttempts.length}</p>
            <p className="text-xs text-emerald-500 font-medium mt-0.5">Active Recall</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Award className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Flashcard Decks</p>
            <p className="text-2xl font-bold text-foreground mt-1">{documents.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">3D Study Ready</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Layers className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Discussions</p>
            <p className="text-2xl font-bold text-foreground mt-1">{conversations.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Active RAG threads</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <MessageSquare className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Feature Study Cards Launchpad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Adaptive Quiz Launch Card */}
        <Card className="border-border hover:border-primary/50 transition-all p-6 flex flex-col justify-between bg-gradient-to-br from-primary/5 via-card to-card">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                <Award className="h-5 w-5" />
              </div>
              <Badge variant="default" className="text-xs">Adaptive Learning</Badge>
            </div>
            <h3 className="text-lg font-bold text-foreground">Interactive AI Quizzes</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Test your understanding on lecture handouts with instant answer checks, intelligent corrections, and comprehensive topic reviews.
            </p>
          </div>

          <div className="pt-5 border-t border-border/80 mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {lastQuizAttempt ? `Last Score: ${lastQuizAttempt.percentage}%` : "Ready to practice"}
            </span>
            <Link href="/quiz">
              <Button size="sm" className="gap-1.5 text-xs">
                <span>Open Quizzes</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* 3D Flashcards Launch Card */}
        <Card className="border-border hover:border-primary/50 transition-all p-6 flex flex-col justify-between bg-gradient-to-br from-emerald-500/5 via-card to-card">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Layers className="h-5 w-5" />
              </div>
              <Badge variant="success" className="text-xs">Active Recall</Badge>
            </div>
            <h3 className="text-lg font-bold text-foreground">3D Flashcard Study Decks</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Review key concepts, definitions, and formulas with interactive 3D flip cards, mastery sorting, and spaced repetition.
            </p>
          </div>

          <div className="pt-5 border-t border-border/80 mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {documents.length} Study Decks Available
            </span>
            <Link href="/flashcards">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs border-emerald-500/40 text-foreground hover:bg-emerald-500/10">
                <span>Explore Flashcards</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Documents Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Your Document Library</h2>
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

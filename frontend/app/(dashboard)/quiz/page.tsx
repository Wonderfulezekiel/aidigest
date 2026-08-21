"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  FileText,
  Search,
} from "lucide-react";
import { useMockData } from "@/context/MockDataContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";

export default function GlobalQuizHubPage() {
  const { documents, quizAttempts } = useMockData();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAttempts = quizAttempts.length;
  const avgScore =
    totalAttempts > 0
      ? Math.round(
          quizAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalAttempts
        )
      : 0;
  const masteries = quizAttempts.filter((a) => a.percentage >= 80).length;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto w-full max-w-full overflow-hidden pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-4 sm:pb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Award className="h-6 w-6 text-primary shrink-0" />
            Interactive Quizzes
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Test your knowledge with adaptive quizzes and real-time learning corrections.
          </p>
        </div>
      </div>

      {/* Analytics Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Award className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs uppercase font-medium text-muted-foreground">Quizzes Taken</p>
              <p className="text-xl sm:text-2xl font-extrabold text-foreground">{totalAttempts}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs uppercase font-medium text-muted-foreground">Average Score</p>
              <p className="text-xl sm:text-2xl font-extrabold text-foreground">{avgScore}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs uppercase font-medium text-muted-foreground">Mastered (&ge;80%)</p>
              <p className="text-xl sm:text-2xl font-extrabold text-foreground">{masteries} Decks</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Select Document to Start Quiz */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              Select Document
            </h2>
            <p className="text-xs text-muted-foreground">
              Choose any uploaded handout to practice quiz questions.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        {filteredDocs.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">No documents found.</p>
            <Link href="/upload">
              <Button size="sm" className="gap-1.5 text-xs">
                Upload New PDF
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredDocs.map((doc) => (
              <Card
                key={doc.id}
                className="border-border shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {doc.pageCount} Pages
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(doc.uploadDate)}
                    </span>
                  </div>
                  <CardTitle className="text-sm sm:text-base font-bold text-foreground line-clamp-1 break-words">
                    {doc.title}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2 break-words">
                    {doc.fileName}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-1">
                  <Link href={`/documents/${doc.id}/quiz`}>
                    <Button className="w-full justify-center gap-2 text-xs" size="sm">
                      <Award className="h-3.5 w-3.5" />
                      <span>Take Quiz</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Quiz Attempts History */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
          Recent Attempts & History
        </h2>

        {quizAttempts.length === 0 ? (
          <Card className="p-6 text-center space-y-2">
            <Clock className="h-7 w-7 mx-auto text-muted-foreground" />
            <p className="text-xs sm:text-sm text-muted-foreground">No quiz attempts recorded yet.</p>
          </Card>
        ) : (
          <div className="space-y-2.5 sm:space-y-3">
            {quizAttempts.map((attempt) => (
              <Card key={attempt.id} className="p-3.5 sm:p-4 border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        attempt.percentage >= 80
                          ? "success"
                          : attempt.percentage >= 60
                          ? "default"
                          : "destructive"
                      }
                      className="text-[10px] sm:text-xs font-bold"
                    >
                      {attempt.percentage}% • Grade: {attempt.grade}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {attempt.score}/{attempt.totalQuestions} Correct
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-foreground break-words">{attempt.quizTitle || attempt.documentTitle}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{attempt.feedback}</p>
                </div>

                <Link href={`/documents/${attempt.documentId}/quiz`}>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs shrink-0 w-full sm:w-auto">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Retake Quiz
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

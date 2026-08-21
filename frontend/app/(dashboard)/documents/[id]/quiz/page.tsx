"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  Award,
  Clock,
  Layers,
  ChevronRight,
  Lightbulb,
  Check,
  AlertCircle,
  Zap,
} from "lucide-react";
import { useMockData, QuizItem, QuizAttempt } from "@/context/MockDataContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export default function DocumentQuizPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;
  const { documents, getQuizzesForDocument, generateNewQuiz, submitQuizAttempt } = useMockData();

  const doc = documents.find((d) => d.id === docId);

  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quizAttemptResult, setQuizAttemptResult] = useState<QuizAttempt | null>(null);
  const [reviewFilter, setReviewFilter] = useState<"all" | "incorrect">("all");
  const [mode, setMode] = useState<"learning" | "exam">("learning");
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Load quizzes with safety timeout
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const safetyTimer = setTimeout(() => {
      if (isMounted) setIsLoading(false);
    }, 4000);

    getQuizzesForDocument(docId)
      .then((data) => {
        if (isMounted) {
          clearTimeout(safetyTimer);
          if (Array.isArray(data) && data.length > 0) {
            setQuizzes(data);
          }
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          clearTimeout(safetyTimer);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, [docId]);

  // Quiz timer
  useEffect(() => {
    if (quizAttemptResult || isLoading) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [quizAttemptResult, isLoading]);

  const activeQuiz = quizzes[currentQuizIndex];
  const questions = activeQuiz?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSelectOption = (questionId: string, option: string) => {
    if (quizAttemptResult) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: option }));
    if (mode === "learning") {
      setCheckedQuestions((prev) => ({ ...prev, [questionId]: true }));
    }
  };

  const handleCheckCurrentAnswer = () => {
    if (!currentQuestion) return;
    setCheckedQuestions((prev) => ({ ...prev, [currentQuestion.id]: true }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setIsSubmitting(true);
    try {
      const result = await submitQuizAttempt(activeQuiz.id, userAnswers, timerSeconds);
      setQuizAttemptResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetakeQuiz = () => {
    setUserAnswers({});
    setCheckedQuestions({});
    setCurrentQuestionIndex(0);
    setQuizAttemptResult(null);
    setTimerSeconds(0);
  };

  const handleGenerateNewQuiz = async () => {
    setIsGenerating(true);
    try {
      const newQ = await generateNewQuiz(docId);
      setQuizzes((prev) => [newQ, ...prev]);
      setCurrentQuizIndex(0);
      handleRetakeQuiz();
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-xs sm:text-sm text-muted-foreground font-medium text-center">
          Preparing Quiz from document passages...
        </p>
      </div>
    );
  }

  if (!activeQuiz || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 sm:py-16 space-y-6 px-4">
        <div className="h-14 w-14 sm:h-16 sm:w-16 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <Award className="h-7 w-7 sm:h-8 sm:w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Generate Document Quiz</h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Test your knowledge on <strong>{doc?.title || "this document"}</strong>.
          </p>
        </div>
        <Button onClick={handleGenerateNewQuiz} isLoading={isGenerating} size="md" className="gap-2 text-xs sm:text-sm">
          <Zap className="h-4 w-4" />
          Create Quiz Now
        </Button>
      </div>
    );
  }

  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto w-full max-w-full overflow-hidden pb-12">
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4 w-full">
        <div className="space-y-1">
          <Link
            href={`/documents/${docId}`}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Document
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Award className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
            <span className="truncate">{activeQuiz.title}</span>
          </h1>
          <p className="text-xs text-muted-foreground truncate">
            {doc?.title || activeQuiz.documentTitle}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher */}
          <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border text-xs">
            <button
              onClick={() => setMode("learning")}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer",
                mode === "learning"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Learning
            </button>
            <button
              onClick={() => setMode("exam")}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer",
                mode === "exam"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Exam
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateNewQuiz}
            isLoading={isGenerating}
            className="gap-1.5 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New Quiz
          </Button>
        </div>
      </div>

      {/* QUIZ IN-PROGRESS VIEW */}
      {!quizAttemptResult ? (
        <div className="space-y-5 sm:space-y-6 w-full max-w-full">
          {/* Progress & Stats Bar */}
          <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground flex-wrap">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="font-bold text-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-primary font-semibold">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(timerSeconds)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span>{answeredCount}/{questions.length} Answered</span>
            </div>
          </div>

          {/* Progress Line */}
          <div className="h-1.5 sm:h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Main Question Card */}
          {currentQuestion && (
            <Card className="border-border shadow-xs w-full max-w-full">
              <CardHeader className="space-y-2 sm:space-y-3 pb-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[11px] font-mono">
                    Topic: {currentQuestion.topic}
                  </Badge>
                  {currentQuestion.pageCitation && (
                    <span className="text-[11px] text-muted-foreground">
                      Page {currentQuestion.pageCitation}
                    </span>
                  )}
                </div>
                <CardTitle className="text-base sm:text-lg font-bold leading-snug break-words">
                  {currentQuestion.question}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2.5 sm:space-y-3 pt-1">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = userAnswers[currentQuestion.id] === option;
                  const isChecked = checkedQuestions[currentQuestion.id];
                  const isCorrect = option.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();

                  let stateStyles = "border-border bg-card hover:bg-muted/40 hover:border-primary/40";
                  if (isChecked) {
                    if (isCorrect) {
                      stateStyles = "border-emerald-500/80 bg-emerald-500/10 text-foreground font-semibold shadow-xs";
                    } else if (isSelected && !isCorrect) {
                      stateStyles = "border-destructive/80 bg-destructive/10 text-foreground font-semibold shadow-xs";
                    } else {
                      stateStyles = "border-border/60 opacity-60 bg-muted/20";
                    }
                  } else if (isSelected) {
                    stateStyles = "border-primary bg-primary/10 text-foreground font-semibold shadow-xs";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(currentQuestion.id, option)}
                      className={cn(
                        "w-full text-left p-3 sm:p-4 rounded-xl border transition-all flex items-start justify-between gap-2.5 text-xs sm:text-sm cursor-pointer break-words",
                        stateStyles
                      )}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <span className="font-mono text-xs font-bold text-muted-foreground shrink-0 mt-0.5">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <span className="break-words">{option.replace(/^[A-D]\)\s*/, "")}</span>
                      </div>

                      {isChecked && isCorrect && (
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                      {isChecked && isSelected && !isCorrect && (
                        <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}

                {/* ADAPTIVE LEARNING CORRECTION BOX */}
                {checkedQuestions[currentQuestion.id] && (
                  <div
                    className={cn(
                      "p-3.5 sm:p-4 rounded-xl border mt-3 text-xs leading-relaxed space-y-1.5 animate-in fade-in-50 break-words",
                      userAnswers[currentQuestion.id]?.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase()
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200"
                    )}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                      {userAnswers[currentQuestion.id]?.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase() ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>Correct Answer!</span>
                        </>
                      ) : (
                        <>
                          <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
                          <span>Explanation & Correction:</span>
                        </>
                      )}
                    </div>
                    <p className="text-foreground/90 font-medium break-words">
                      {currentQuestion.explanation}
                    </p>
                    <div className="pt-1 text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap">
                      <span>Source: Page {currentQuestion.pageCitation}</span>
                      <span>•</span>
                      <span>Topic: {currentQuestion.topic}</span>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="w-full sm:w-auto gap-1 text-xs"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Previous
                </Button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {mode === "exam" && !checkedQuestions[currentQuestion.id] && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCheckCurrentAnswer}
                      disabled={!userAnswers[currentQuestion.id]}
                      className="text-xs w-full sm:w-auto"
                    >
                      Check Answer
                    </Button>
                  )}

                  {currentQuestionIndex < questions.length - 1 ? (
                    <Button
                      size="sm"
                      onClick={handleNextQuestion}
                      className="w-full sm:w-auto gap-1 text-xs"
                    >
                      Next Question
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleSubmitQuiz}
                      isLoading={isSubmitting}
                      className="w-full sm:w-auto gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                    >
                      <Check className="h-4 w-4" />
                      Submit & Score
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          )}

          {/* Question Step Selector dots */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-1 flex-wrap">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentQuestionIndex;
              const isAnswered = !!userAnswers[q.id];
              const isChecked = checkedQuestions[q.id];
              const isCorrect = userAnswers[q.id]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

              let badgeStyle = "bg-muted text-muted-foreground border-border";
              if (isChecked) {
                badgeStyle = isCorrect ? "bg-emerald-500 text-white border-emerald-600" : "bg-destructive text-white border-destructive";
              } else if (isAnswered) {
                badgeStyle = "bg-primary/20 text-primary border-primary";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={cn(
                    "h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-xs font-bold border transition-all flex items-center justify-center cursor-pointer",
                    badgeStyle,
                    isCurrent && "ring-2 ring-primary ring-offset-1"
                  )}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* QUIZ COMPLETION SCORECARD VIEW - FULLY MOBILE RESPONSIVE */
        <div className="space-y-6 animate-in fade-in-50 w-full max-w-full overflow-hidden">
          <Card className="border-border shadow-md overflow-hidden w-full max-w-full">
            {/* Scorecard Hero Banner */}
            <div className="p-5 sm:p-8 text-center bg-gradient-to-b from-primary/10 via-primary/5 to-transparent border-b border-border space-y-3 sm:space-y-4">
              <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Award className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>

              <div className="space-y-1">
                <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider">
                  Grade: {quizAttemptResult.grade}
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {quizAttemptResult.percentage}% Score
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {quizAttemptResult.score} of {quizAttemptResult.totalQuestions} correct in {formatTime(quizAttemptResult.timeSpentSeconds)}.
                </p>
              </div>

              <p className="text-xs sm:text-sm max-w-xl mx-auto text-foreground/90 leading-relaxed bg-card/80 p-3 sm:p-4 rounded-xl border border-border break-words">
                {quizAttemptResult.feedback}
              </p>
            </div>

            <CardContent className="pt-4 sm:pt-6 space-y-4 sm:space-y-6 p-3.5 sm:p-6 w-full max-w-full">
              {/* Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <h3 className="text-sm sm:text-base font-bold text-foreground">Question Review</h3>
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={() => setReviewFilter("all")}
                    className={cn(
                      "px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-medium transition-colors cursor-pointer text-xs",
                      reviewFilter === "all" ? "bg-primary text-primary-foreground font-semibold" : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    All ({quizAttemptResult.totalQuestions})
                  </button>
                  <button
                    onClick={() => setReviewFilter("incorrect")}
                    className={cn(
                      "px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-medium transition-colors cursor-pointer text-xs",
                      reviewFilter === "incorrect" ? "bg-primary text-primary-foreground font-semibold" : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Needs Review ({quizAttemptResult.totalQuestions - quizAttemptResult.score})
                  </button>
                </div>
              </div>

              {/* Review Question List - FIXED MOBILE OVERFLOW */}
              <div className="space-y-3 sm:space-y-4 w-full max-w-full">
                {(quizAttemptResult.questionResults || [])
                  .filter((r) => (reviewFilter === "incorrect" ? !r.isCorrect : true))
                  .map((res, index) => (
                    <div
                      key={res.questionId}
                      className={cn(
                        "p-3.5 sm:p-5 rounded-xl border transition-all space-y-2.5 sm:space-y-3 w-full max-w-full overflow-hidden break-words",
                        res.isCorrect ? "bg-card border-border" : "bg-destructive/5 border-destructive/30"
                      )}
                    >
                      {/* Responsive Header: Stack on mobile so badge never overflows */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold text-muted-foreground uppercase">
                            Question {index + 1}
                          </span>
                          <Badge variant="outline" className="text-[10px] sm:text-[11px] font-mono">
                            {res.topic}
                          </Badge>
                        </div>

                        <div>
                          {res.isCorrect ? (
                            <Badge variant="success" className="gap-1 text-[10px] sm:text-xs">
                              <CheckCircle2 className="h-3 w-3" /> Correct
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1 text-[10px] sm:text-xs">
                              <XCircle className="h-3 w-3" /> Needs Review
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Question Text */}
                      <p className="text-xs sm:text-sm font-bold text-foreground leading-snug break-words">
                        {res.question}
                      </p>

                      {/* Your Answer & Correct Answer Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 sm:p-3 rounded-lg bg-muted/40 border border-border break-words">
                          <span className="font-semibold text-muted-foreground block mb-1 text-[11px]">Your Answer:</span>
                          <span className={cn("break-words text-xs", res.isCorrect ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-destructive font-semibold")}>
                            {res.chosenAnswer || "No answer selected"}
                          </span>
                        </div>
                        <div className="p-2.5 sm:p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 break-words">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400 block mb-1 text-[11px]">Correct Answer:</span>
                          <span className="text-foreground font-semibold break-words text-xs">{res.correctAnswer}</span>
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="p-3 sm:p-3.5 rounded-lg bg-background border border-border text-xs leading-relaxed space-y-1 break-words">
                        <span className="font-bold text-foreground flex items-center gap-1.5 text-[11px] sm:text-xs">
                          <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          Explanation & Reference:
                        </span>
                        <p className="text-muted-foreground break-words text-xs">{res.explanation}</p>
                        <p className="text-[11px] text-primary/80 pt-1 font-medium">
                          Source: Page {res.pageCitation}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border pt-4 sm:pt-6 bg-muted/20">
              <Button variant="outline" size="sm" onClick={handleRetakeQuiz} className="w-full sm:w-auto gap-2 text-xs">
                <RotateCcw className="h-4 w-4" />
                Retake Quiz
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={handleGenerateNewQuiz} isLoading={isGenerating} className="gap-2 text-xs w-full sm:w-auto">
                  <Zap className="h-3.5 w-3.5" />
                  New Quiz
                </Button>
                <Link href={`/documents/${docId}`} className="w-full sm:w-auto">
                  <Button size="sm" className="gap-2 text-xs w-full">
                    <BookOpen className="h-3.5 w-3.5" />
                    Back to Document
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

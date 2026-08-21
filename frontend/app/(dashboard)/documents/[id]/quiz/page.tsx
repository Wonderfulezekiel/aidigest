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
  Sparkles,
  RotateCcw,
  BookOpen,
  Award,
  Clock,
  Layers,
  ChevronRight,
  Lightbulb,
  Check,
  AlertCircle,
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

  // Load quizzes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getQuizzesForDocument(docId)
      .then((data) => {
        if (isMounted) {
          setQuizzes(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground font-medium">Generating AI Quiz from document passages...</p>
      </div>
    );
  }

  if (!activeQuiz || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-6">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <HelpCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">No Quiz Generated Yet</h2>
          <p className="text-sm text-muted-foreground">
            Generate an interactive comprehension quiz for <strong>{doc?.title || "this document"}</strong>.
          </p>
        </div>
        <Button onClick={handleGenerateNewQuiz} isLoading={isGenerating} size="lg" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Generate AI Quiz Now
        </Button>
      </div>
    );
  }

  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in-50 pb-12">
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <Link
            href={`/documents/${docId}`}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Document
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Award className="h-6 w-6 text-primary" />
            {activeQuiz.title}
          </h1>
          <p className="text-xs text-muted-foreground">
            Document: <span className="font-semibold text-foreground">{doc?.title || activeQuiz.documentTitle}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher */}
          <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border text-xs">
            <button
              onClick={() => setMode("learning")}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium transition-all",
                mode === "learning"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Adaptive Learning
            </button>
            <button
              onClick={() => setMode("exam")}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium transition-all",
                mode === "exam"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Exam Mode
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateNewQuiz}
            isLoading={isGenerating}
            className="gap-1.5 text-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate New Quiz
          </Button>
        </div>
      </div>

      {/* QUIZ IN-PROGRESS VIEW */}
      {!quizAttemptResult ? (
        <div className="space-y-6">
          {/* Progress & Stats Bar */}
          <div className="flex items-center justify-between gap-4 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-3">
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
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Main Question Card */}
          {currentQuestion && (
            <Card className="border-border shadow-md">
              <CardHeader className="space-y-3 pb-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs font-mono">
                    Topic: {currentQuestion.topic}
                  </Badge>
                  {currentQuestion.pageCitation && (
                    <span className="text-xs text-muted-foreground">
                      Source: Page {currentQuestion.pageCitation}
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg md:text-xl font-bold leading-snug">
                  {currentQuestion.question}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 pt-2">
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
                        "w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between gap-3 text-sm cursor-pointer",
                        stateStyles
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-mono text-xs font-bold text-muted-foreground shrink-0 mt-0.5">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <span>{option.replace(/^[A-D]\)\s*/, "")}</span>
                      </div>

                      {isChecked && isCorrect && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                      {isChecked && isSelected && !isCorrect && (
                        <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}

                {/* ADAPTIVE LEARNING CORRECTION BOX (Appears immediately when question is answered in Learning Mode) */}
                {checkedQuestions[currentQuestion.id] && (
                  <div
                    className={cn(
                      "p-4 rounded-xl border mt-4 text-xs leading-relaxed space-y-2 animate-in fade-in-50",
                      userAnswers[currentQuestion.id]?.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase()
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200"
                    )}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {userAnswers[currentQuestion.id]?.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase() ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span>Correct Answer!</span>
                        </>
                      ) : (
                        <>
                          <Lightbulb className="h-4 w-4 text-amber-500" />
                          <span>AI Learning Correction & Explanation:</span>
                        </>
                      )}
                    </div>
                    <p className="text-foreground/90 font-medium">
                      {currentQuestion.explanation}
                    </p>
                    <div className="pt-1 text-[11px] text-muted-foreground flex items-center gap-3">
                      <span>Verified against: Page {currentQuestion.pageCitation}</span>
                      <span>•</span>
                      <span>Topic Area: {currentQuestion.topic}</span>
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
                      className="text-xs"
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
                      Submit & Score Quiz
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          )}

          {/* Question Step Selector dots */}
          <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
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
                    "h-8 w-8 rounded-lg text-xs font-bold border transition-all flex items-center justify-center cursor-pointer",
                    badgeStyle,
                    isCurrent && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* QUIZ COMPLETION SCORECARD VIEW */
        <div className="space-y-6 animate-in fade-in-50">
          <Card className="border-border shadow-xl overflow-hidden">
            <div className="p-8 text-center bg-gradient-to-b from-primary/10 via-primary/5 to-transparent border-b border-border space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <Award className="h-10 w-10" />
              </div>

              <div className="space-y-1">
                <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider">
                  Grade: {quizAttemptResult.grade}
                </Badge>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                  {quizAttemptResult.percentage}% Score
                </h2>
                <p className="text-sm font-medium text-muted-foreground">
                  You answered <strong>{quizAttemptResult.score}</strong> out of <strong>{quizAttemptResult.totalQuestions}</strong> questions correctly in {formatTime(quizAttemptResult.timeSpentSeconds)}.
                </p>
              </div>

              <p className="text-sm max-w-xl mx-auto text-foreground/90 leading-relaxed bg-card/60 p-4 rounded-xl border border-border">
                {quizAttemptResult.feedback}
              </p>
            </div>

            <CardContent className="pt-6 space-y-6">
              {/* Filter Tabs */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground">Detailed Question Review</h3>
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={() => setReviewFilter("all")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer",
                      reviewFilter === "all" ? "bg-primary text-primary-foreground font-semibold" : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    All Questions ({quizAttemptResult.totalQuestions})
                  </button>
                  <button
                    onClick={() => setReviewFilter("incorrect")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer",
                      reviewFilter === "incorrect" ? "bg-primary text-primary-foreground font-semibold" : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Incorrect Only ({quizAttemptResult.totalQuestions - quizAttemptResult.score})
                  </button>
                </div>
              </div>

              {/* Review Question List */}
              <div className="space-y-4">
                {(quizAttemptResult.questionResults || [])
                  .filter((r) => (reviewFilter === "incorrect" ? !r.isCorrect : true))
                  .map((res, index) => (
                    <div
                      key={res.questionId}
                      className={cn(
                        "p-5 rounded-xl border transition-all space-y-3",
                        res.isCorrect ? "bg-card border-border" : "bg-destructive/5 border-destructive/30"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground uppercase">
                              Question {index + 1}
                            </span>
                            <Badge variant="outline" className="text-[11px]">
                              {res.topic}
                            </Badge>
                          </div>
                          <p className="text-sm font-bold text-foreground">{res.question}</p>
                        </div>

                        {res.isCorrect ? (
                          <Badge variant="success" className="gap-1 shrink-0">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1 shrink-0">
                            <XCircle className="h-3.5 w-3.5" /> Needs Review
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-3 rounded-lg bg-muted/40 border border-border">
                          <span className="font-semibold text-muted-foreground block mb-1">Your Answer:</span>
                          <span className={cn(res.isCorrect ? "text-emerald-500 font-semibold" : "text-destructive font-semibold")}>
                            {res.chosenAnswer || "No answer selected"}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400 block mb-1">Correct Answer:</span>
                          <span className="text-foreground font-semibold">{res.correctAnswer}</span>
                        </div>
                      </div>

                      {/* AI Correction */}
                      <div className="p-3.5 rounded-lg bg-background border border-border text-xs leading-relaxed space-y-1">
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                          AI Explanation:
                        </span>
                        <p className="text-muted-foreground">{res.explanation}</p>
                        <p className="text-[11px] text-primary/80 pt-1 font-medium">
                          Source Reference: Page {res.pageCitation}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border pt-6 bg-muted/20">
              <Button variant="outline" onClick={handleRetakeQuiz} className="w-full sm:w-auto gap-2">
                <RotateCcw className="h-4 w-4" />
                Retake Quiz
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={handleGenerateNewQuiz} isLoading={isGenerating} className="gap-2 text-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate Fresh Quiz
                </Button>
                <Link href={`/documents/${docId}`}>
                  <Button className="gap-2 text-xs">
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

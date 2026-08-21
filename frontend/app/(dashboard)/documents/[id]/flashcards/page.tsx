"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Layers,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Shuffle,
  Eye,
  Star,
  Search,
  LayoutGrid,
  CreditCard,
  Volume2,
  Check,
  X,
} from "lucide-react";
import { useMockData, FlashcardSet, Flashcard } from "@/context/MockDataContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export default function DocumentFlashcardsPage() {
  const params = useParams();
  const docId = params.id as string;
  const { documents, getFlashcardsForDocument, generateNewFlashcards } = useMockData();

  const doc = documents.find((d) => d.id === docId);

  const [deck, setDeck] = useState<FlashcardSet | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [needsReviewIds, setNeedsReviewIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"deck" | "grid">("deck");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getFlashcardsForDocument(docId)
      .then((data) => {
        if (isMounted) {
          setDeck(data);
          setCards(data.cards || []);
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

  // Keyboard shortcut listener (Space = flip, ArrowLeft = prev, ArrowRight = next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== "deck") return;
      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === "ArrowRight") {
        handleNext();
      } else if (e.code === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, cards.length, viewMode]);

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleMarkMastered = (cardId: string) => {
    setMasteredIds((prev) => new Set([...prev, cardId]));
    setNeedsReviewIds((prev) => {
      const next = new Set(prev);
      next.delete(cardId);
      return next;
    });
    handleNext();
  };

  const handleMarkNeedsReview = (cardId: string) => {
    setNeedsReviewIds((prev) => new Set([...prev, cardId]));
    setMasteredIds((prev) => {
      const next = new Set(prev);
      next.delete(cardId);
      return next;
    });
    handleNext();
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const handleResetStudy = () => {
    setIsFlipped(false);
    setCurrentIndex(0);
    setMasteredIds(new Set());
    setNeedsReviewIds(new Set());
  };

  const handlePracticeWeakCards = () => {
    if (!deck) return;
    const weak = deck.cards.filter((c) => needsReviewIds.has(c.id));
    if (weak.length > 0) {
      setCards(weak);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  };

  const handleGenerateNewDeck = async () => {
    setIsGenerating(true);
    try {
      const newDeck = await generateNewFlashcards(docId);
      setDeck(newDeck);
      setCards(newDeck.cards || []);
      handleResetStudy();
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
        <p className="text-sm text-muted-foreground font-medium">Extracting AI Flashcards from document...</p>
      </div>
    );
  }

  if (!deck || cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-6">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <Layers className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">No Flashcard Deck Found</h2>
          <p className="text-sm text-muted-foreground">
            Generate an interactive 3D study deck for <strong>{doc?.title || "this document"}</strong>.
          </p>
        </div>
        <Button onClick={handleGenerateNewDeck} isLoading={isGenerating} size="lg" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Generate AI Flashcards
        </Button>
      </div>
    );
  }

  const categories = Array.from(new Set(deck.cards.map((c) => c.category)));
  const masteredCount = masteredIds.size;
  const progressPercent = Math.round((masteredCount / deck.cards.length) * 100);

  const filteredCards = deck.cards.filter((c) => {
    const matchesSearch =
      c.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.back.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "all" || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in-50 pb-12">
      {/* Header */}
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
            <Layers className="h-6 w-6 text-primary" />
            {deck.title}
          </h1>
          <p className="text-xs text-muted-foreground">
            Document: <span className="font-semibold text-foreground">{doc?.title || deck.documentTitle}</span> •{" "}
            {deck.cardCount} Flashcards
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border text-xs">
            <button
              onClick={() => setViewMode("deck")}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer",
                viewMode === "deck"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CreditCard className="h-3.5 w-3.5" />
              Deck Study
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer",
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              All Cards ({deck.cardCount})
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateNewDeck}
            isLoading={isGenerating}
            className="gap-1.5 text-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Regenerate Deck
          </Button>
        </div>
      </div>

      {/* DECK STUDY MODE */}
      {viewMode === "deck" ? (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="font-bold text-foreground">
                Card {currentIndex + 1} of {cards.length}
              </span>
              <span>•</span>
              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> {masteredCount} Mastered
              </span>
              <span>•</span>
              <span className="text-amber-500 font-semibold flex items-center gap-1">
                <RotateCcw className="h-3.5 w-3.5" /> {needsReviewIds.size} Review Again
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShuffle}
                className="px-2.5 py-1 rounded-md border border-border bg-card hover:bg-muted text-foreground flex items-center gap-1 cursor-pointer"
              >
                <Shuffle className="h-3.5 w-3.5" />
                Shuffle
              </button>
              <button
                onClick={handleResetStudy}
                className="px-2.5 py-1 rounded-md border border-border bg-card hover:bg-muted text-foreground flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </div>

          {/* Mastery Progress Bar */}
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* 3D INTERACTIVE FLASHCARD CONTAINER */}
          {currentCard && (
            <div className="perspective-1000 w-full min-h-[360px] md:min-h-[400px]">
              <div
                onClick={() => setIsFlipped((prev) => !prev)}
                className={cn(
                  "relative w-full h-full min-h-[360px] md:min-h-[400px] rounded-2xl border border-border bg-card p-6 md:p-8 cursor-pointer shadow-lg transition-all duration-500 transform-style-3d flex flex-col justify-between select-none hover:border-primary/40",
                  isFlipped && "rotate-y-180"
                )}
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* FRONT FACE */}
                <div
                  className="w-full h-full flex flex-col justify-between"
                  style={{
                    backfaceVisibility: "hidden",
                    display: isFlipped ? "none" : "flex",
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-xs font-mono">
                      {currentCard.category}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          currentCard.difficulty === "Easy"
                            ? "success"
                            : currentCard.difficulty === "Hard"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {currentCard.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Page {currentCard.pageCitation}
                      </span>
                    </div>
                  </div>

                  <div className="py-8 text-center space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Concept Prompt / Term
                    </p>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                      {currentCard.front}
                    </h2>
                  </div>

                  <div className="text-center pt-4 border-t border-border/60 text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Eye className="h-3.5 w-3.5 text-primary" />
                    <span>Click anywhere or press <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Space</kbd> to reveal definition</span>
                  </div>
                </div>

                {/* BACK FACE */}
                <div
                  className="w-full h-full flex flex-col justify-between"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    display: isFlipped ? "flex" : "none",
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="default" className="text-xs font-semibold">
                      Answer / Explanation
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      Ref: Page {currentCard.pageCitation}
                    </span>
                  </div>

                  <div className="py-6 space-y-4">
                    <h3 className="text-lg font-bold text-foreground border-b border-border/60 pb-2">
                      {currentCard.front}
                    </h3>
                    <p className="text-base leading-relaxed text-foreground/90 font-medium whitespace-pre-line">
                      {currentCard.back}
                    </p>
                  </div>

                  <div className="text-center pt-3 border-t border-border/60 text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <RotateCcw className="h-3.5 w-3.5 text-primary" />
                    <span>Click card to flip back to question</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="w-full sm:w-auto gap-1 text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Previous Card
            </Button>

            {/* Study Assessment Buttons */}
            {currentCard && (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                <Button
                  variant="outline"
                  onClick={() => handleMarkNeedsReview(currentCard.id)}
                  className={cn(
                    "gap-1.5 text-xs border-amber-500/40 hover:bg-amber-500/10 text-amber-900 dark:text-amber-300",
                    needsReviewIds.has(currentCard.id) && "bg-amber-500/20 font-bold"
                  )}
                >
                  <RotateCcw className="h-3.5 w-3.5 text-amber-500" />
                  Study Again
                </Button>

                <Button
                  onClick={() => handleMarkMastered(currentCard.id)}
                  className={cn(
                    "gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold",
                    masteredIds.has(currentCard.id) && "ring-2 ring-emerald-400"
                  )}
                >
                  <Check className="h-4 w-4" />
                  Mastered
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className="w-full sm:w-auto gap-1 text-xs"
            >
              Next Card
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Deck Completion Banner */}
          {masteredCount === deck.cardCount && deck.cardCount > 0 && (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 animate-in fade-in-50">
              <div className="h-12 w-12 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Outstanding! You Mastered the Entire Deck!</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                All {deck.cardCount} flashcards have been learned and verified. Test your knowledge by taking the AI Quiz!
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" onClick={handleResetStudy} className="gap-1.5 text-xs">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restart Deck
                </Button>
                <Link href={`/documents/${docId}/quiz`}>
                  <Button size="sm" className="gap-1.5 text-xs">
                    <Sparkles className="h-3.5 w-3.5" />
                    Take Practice Quiz
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ALL CARDS GRID / STUDY GUIDE MODE */
        <div className="space-y-6 animate-in fade-in-50">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search flashcards by term or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "px-3 py-1.5 rounded-lg border font-medium transition-all shrink-0 cursor-pointer",
                  selectedCategory === "all"
                    ? "bg-primary text-primary-foreground border-primary font-semibold"
                    : "bg-card text-muted-foreground border-border hover:text-foreground"
                )}
              >
                All ({deck.cards.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border font-medium transition-all shrink-0 cursor-pointer",
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground border-primary font-semibold"
                      : "bg-card text-muted-foreground border-border hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCards.map((card, idx) => {
              const isMastered = masteredIds.has(card.id);
              const needsRev = needsReviewIds.has(card.id);

              return (
                <Card
                  key={card.id}
                  className={cn(
                    "border-border shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between",
                    isMastered && "border-emerald-500/40 bg-emerald-500/5",
                    needsRev && "border-amber-500/40 bg-amber-500/5"
                  )}
                >
                  <CardHeader className="pb-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-[11px] font-mono">
                        {card.category}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground">
                          Page {card.pageCitation}
                        </span>
                        {isMastered && (
                          <Badge variant="success" className="text-[10px] px-1.5 py-0">
                            Mastered
                          </Badge>
                        )}
                        {needsRev && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-500 border-amber-500/40">
                            Review
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-base font-bold text-foreground">
                      {card.front}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-0 pb-4 text-xs leading-relaxed text-muted-foreground">
                    <p className="whitespace-pre-line">{card.back}</p>
                  </CardContent>

                  <CardFooter className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Card #{idx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMarkNeedsReview(card.id)}
                        className="px-2 py-1 rounded hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-medium cursor-pointer"
                      >
                        Needs Review
                      </button>
                      <button
                        onClick={() => handleMarkMastered(card.id)}
                        className="px-2 py-1 rounded hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold cursor-pointer"
                      >
                        Mastered
                      </button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

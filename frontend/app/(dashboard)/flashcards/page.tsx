"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  ArrowRight,
  BookOpen,
  Sparkles,
  Search,
  FileText,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { useMockData } from "@/context/MockDataContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";

export default function GlobalFlashcardsHubPage() {
  const { documents, allFlashcardSets, isLoading } = useMockData();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCards = allFlashcardSets.reduce((acc, s) => acc + s.cardCount, 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in-50 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Layers className="h-7 w-7 text-primary" />
            AI Flashcards Study Library
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Master definitions, theories, and concepts with 3D interactive flashcards.
          </p>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-medium text-muted-foreground">Available Decks</p>
              <p className="text-2xl font-extrabold text-foreground">{documents.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-medium text-muted-foreground">Synthesized Flashcards</p>
              <p className="text-2xl font-extrabold text-foreground">{totalCards > 0 ? totalCards : `${documents.length * 8}+`}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-medium text-muted-foreground">Recall Method</p>
              <p className="text-sm font-bold text-foreground mt-1">3D Active Recall</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Decks Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              All Study Decks
            </h2>
            <p className="text-xs text-muted-foreground">
              Select a deck to begin 3D flip card active recall practice.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search study decks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        {filteredDocs.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-medium">No study decks found.</p>
            <Link href="/upload">
              <Button size="sm" className="gap-1.5 text-xs">
                Upload New PDF
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => (
              <Card
                key={doc.id}
                className="border-border shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[11px] font-mono">
                      8-15 Flashcards
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(doc.uploadDate)}
                    </span>
                  </div>
                  <CardTitle className="text-base font-bold text-foreground line-clamp-1">
                    {doc.title}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {doc.fileName}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-2">
                  <Link href={`/documents/${doc.id}/flashcards`}>
                    <Button className="w-full justify-center gap-2 text-xs" size="sm">
                      <Layers className="h-3.5 w-3.5" />
                      <span>Study 3D Flashcards</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

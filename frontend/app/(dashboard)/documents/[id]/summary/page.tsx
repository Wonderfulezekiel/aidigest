"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BookOpen,
  MessageSquare,
  ArrowLeft,
  Copy,
  Check,
  FileText,
  HelpCircle,
  Award,
  Layers,
} from "lucide-react";
import { useMockData } from "@/context/MockDataContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

export default function DocumentSummaryPage() {
  const params = useParams();
  const docId = params.id as string;
  const { documents, getSummary } = useMockData();

  const doc = documents.find((d) => d.id === docId);
  const summary = getSummary(docId);

  const [summaryTab, setSummaryTab] = useState<"short" | "detailed">("short");
  const [copied, setCopied] = useState(false);

  if (!doc || !summary) {
    return (
      <div className="text-center py-16 space-y-4 px-4">
        <h2 className="text-xl font-bold">Summary Not Found</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">No generated summary exists for this document ID.</p>
        <Link href="/documents">
          <Button variant="outline" size="sm">Back to Library</Button>
        </Link>
      </div>
    );
  }

  const handleCopy = () => {
    const textToCopy = summaryTab === "short" ? summary.shortSummary : summary.detailedSummary;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-5xl mx-auto w-full max-w-full overflow-hidden pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="space-y-1">
          <Link href="/documents" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Documents
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
            Document Summary
          </h1>
          <p className="text-xs text-muted-foreground truncate">
            {doc.title} ({doc.pageCount} pages)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 text-xs">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </Button>
          <Link href={`/documents/${doc.id}/chat`}>
            <Button size="sm" className="gap-1.5 text-xs">
              <MessageSquare className="h-3.5 w-3.5" />
              Chat
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary View Tab Toggle */}
      <div className="flex justify-between items-center">
        <div className="inline-flex rounded-lg border border-border bg-card p-1 text-xs">
          <button
            onClick={() => setSummaryTab("short")}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              summaryTab === "short"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Executive Summary
          </button>
          <button
            onClick={() => setSummaryTab("detailed")}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              summaryTab === "detailed"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            In-Depth Analysis
          </button>
        </div>
      </div>

      {/* Main Summary Content Box */}
      <Card className="shadow-xs border-border w-full max-w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            {summaryTab === "short" ? "Executive Summary" : "In-Depth Academic Analysis"}
          </CardTitle>
          <CardDescription className="text-xs">
            Structured analysis, core concepts, and key takeaways
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 overflow-x-auto">
          <MarkdownRenderer content={summaryTab === "short" ? summary.shortSummary : summary.detailedSummary} />
        </CardContent>
      </Card>

      {/* Structured Key Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Key Topics Tag Cloud */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Key Topics & Themes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {summary.keyTopics.map((topic, idx) => (
                <Badge key={idx} variant="outline" className="px-2.5 py-0.5 text-[11px]">
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Definitions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> Important Definitions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {summary.definitions.map((def, idx) => (
              <div key={idx} className="p-2.5 sm:p-3 rounded-lg border border-border bg-muted/20 text-xs break-words">
                <span className="font-bold text-foreground block">{def.term}:</span>
                <span className="text-muted-foreground mt-0.5 block">{def.definition}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Important Concepts */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" /> Core Concepts & Explanations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {summary.importantConcepts.map((concept, idx) => (
              <div key={idx} className="p-3 sm:p-4 rounded-lg border border-border bg-card space-y-1 break-words">
                <p className="font-semibold text-xs sm:text-sm text-foreground">{concept.term}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{concept.explanation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Main Ideas & Conclusion */}
      <Card className="border-border w-full max-w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Key Takeaways & Conclusion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-muted-foreground break-words">
            {summary.mainIdeas.map((idea, idx) => (
              <li key={idx} className="leading-relaxed">
                <span className="text-foreground">{idea}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 p-3 sm:p-4 rounded-lg bg-primary/5 border border-primary/20 text-xs sm:text-sm text-foreground break-words">
            <span className="font-bold block mb-1">Conclusion:</span>
            {summary.conclusion}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

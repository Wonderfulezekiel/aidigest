"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Upload,
  Cpu,
  FileText,
  MessageSquare,
  Zap,
  ShieldCheck,
  Clock,
  Layers,
  ChevronRight,
  Plus,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "upload" | "summary" | "chat">("summary");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqItems = [
    {
      q: "Can I upload multiple PDFs?",
      a: "Yes! You can upload multiple PDFs including textbooks, lecture slides, research papers, and assignments to your personal document library.",
    },
    {
      q: "Does the AI answer only from my document?",
      a: "Yes. PDF AIDigest uses Retrieval-Augmented Generation (RAG). When you ask a question, the vector engine retrieves relevant passages directly from your document, ensuring accurate, context-bound responses with page citations.",
    },
    {
      q: "What file formats and sizes are supported?",
      a: "We support standard PDF files up to 50MB per document. Scanned text, embedded figures, and multi-chapter documents are processed seamlessly.",
    },
    {
      q: "Is my document data secure?",
      a: "All documents are securely stored in Supabase Storage with strict row-level security policies (RLS). Vector embeddings are isolated in Pinecone.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Subtle grid background blur */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-6 px-3 py-1 text-xs sm:text-sm font-medium backdrop-blur-xs border-border">
            Academic RAG Assistant • Pinecone & OpenRouter Powered
          </Badge>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl max-w-4xl mx-auto leading-tight">
            Understand Academic PDFs in Minutes with <span className="underline decoration-muted-foreground/40 underline-offset-8">AI</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Stop drowning in hundreds of textbook pages and lecture slides. Upload any document, get instant structured summaries, and chat directly with your course material.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto px-8 gap-2 shadow-md">
                Get Started Free
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Hero Interactive Preview Mockup */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-2xl">
            <div className="rounded-xl border border-border bg-background p-4 sm:p-6 text-left">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-chart-1/60" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
                  <span className="ml-2 text-xs font-mono text-muted-foreground">
                    CS401_AI_Chapter_3_Search.pdf (RAG Active)
                  </span>
                </div>
                <Badge variant="success">Pinecone Indexed</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left PDF Preview Mock */}
                <div className="rounded-lg border border-border bg-muted/40 p-4 font-mono text-xs text-muted-foreground space-y-2">
                  <p className="font-semibold text-foreground">SECTION 3.4 — A* SEARCH ALGORITHM</p>
                  <p className="leading-relaxed">
                    A* search evaluates nodes by combining g(n), the cost to reach the node, and h(n), the cost to get from the node to the goal: f(n) = g(n) + h(n)...
                  </p>
                  <div className="p-2 rounded bg-card border border-border text-foreground text-[11px]">
                    <span className="font-bold text-emerald-500">Highlighted Context Chunk #14:</span> "Admissibility requires h(n) &le; h*(n) for all nodes n."
                  </div>
                </div>

                {/* Right AI Chat Mock */}
                <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                  <div className="flex justify-end">
                    <div className="rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs max-w-[85%]">
                      Explain A* admissibility in simple terms for my exam.
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="rounded-lg bg-muted text-foreground p-3 text-xs max-w-[90%] space-y-2">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" /> AI Assistant Response:
                      </p>
                      <p>
                        An <strong>admissible heuristic</strong> never overestimates the actual cost to reach the goal. It acts as an optimistic estimate so A* will never mistakenly skip the true shortest path!
                      </p>
                      <Badge variant="outline" className="text-[10px]">Citation: Page 14 • Chunk #14</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-16 bg-muted/20 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Core Academic Features
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Designed specifically for university students, researchers, and lecturers studying dense academic material.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:border-primary/50">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <Upload className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Instant PDF Ingestion</CardTitle>
                <CardDescription>
                  Upload textbooks, lecture slides, or papers. Fast text extraction using PyMuPDF.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/50">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Multi-Tier Summaries</CardTitle>
                <CardDescription>
                  Generate 100-word quick summaries or 1000-word detailed breakdowns with key concepts.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/50">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <Cpu className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Pinecone Vector Search</CardTitle>
                <CardDescription>
                  Retrieval-Augmented Generation ensures exact context retrieval before generating answers.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/50">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Conversational AI Chat</CardTitle>
                <CardDescription>
                  Ask targeted questions, request exam explanations, and track complete chat history.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How PDF AIDigest Works
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              4 simple steps from raw PDF document to complete academic comprehension.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-4 shadow-sm">
                1
              </div>
              <h3 className="font-semibold text-lg text-foreground">Upload PDF</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Drop your PDF file into Supabase storage in seconds.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-4 shadow-sm">
                2
              </div>
              <h3 className="font-semibold text-lg text-foreground">Extract & Vectorize</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Text is extracted, chunked, and embedded into Pinecone.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-4 shadow-sm">
                3
              </div>
              <h3 className="font-semibold text-lg text-foreground">Generate Summary</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                AI creates short and detailed summaries with definitions.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-4 shadow-sm">
                4
              </div>
              <h3 className="font-semibold text-lg text-foreground">Chat & Learn</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Interact with your material using RAG context citations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interface Preview Showcase Tabs */}
      <section className="py-16 bg-muted/20 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Clean & Modern Academic Dashboard
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Designed with Vercel Tweakcn UI aesthetics for maximum focus and productivity.
            </p>
          </div>

          {/* Tabs header */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg border border-border bg-card p-1">
              {(["summary", "chat", "dashboard", "upload"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-md capitalize transition-colors ${
                    activeTab === tab
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab} View
                </button>
              ))}
            </div>
          </div>

          {/* Preview Tab Display */}
          <div className="max-w-4xl mx-auto rounded-xl border border-border bg-card p-6 shadow-xl">
            {activeTab === "summary" && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="font-semibold text-lg">AI Document Summary</h3>
                  <Badge variant="outline">Short Summary (220 words)</Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "This chapter presents state-space formulations for problem-solving agents. It compares uninformed search strategies (BFS, DFS) against informed algorithms like A* search, proving admissibility conditions for optimal path generation."
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg border border-border bg-muted/30">
                    <span className="text-xs font-bold text-foreground">Key Topic:</span>
                    <p className="text-xs text-muted-foreground mt-1">Admissible Heuristics & Consistency</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-muted/30">
                    <span className="text-xs font-bold text-foreground">Core Equation:</span>
                    <p className="text-xs font-mono text-muted-foreground mt-1">f(n) = g(n) + h(n)</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "chat" && (
              <div className="space-y-3 animate-in fade-in-50">
                <div className="flex justify-end">
                  <div className="rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs">
                    What is the difference between BFS and DFS space complexity?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="rounded-lg bg-muted text-foreground p-3 text-xs max-w-[85%] space-y-2">
                    <p>
                      BFS has space complexity of <strong>O(b^d)</strong> because it stores all generated nodes in memory. DFS has space complexity of <strong>O(bm)</strong>, requiring significantly less memory in linear depth spaces.
                    </p>
                    <Badge variant="outline" className="text-[10px]">Page 12 Passage #4</Badge>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "dashboard" && (
              <div className="grid grid-cols-3 gap-4 text-center animate-in fade-in-50">
                <div className="p-4 rounded-lg border border-border bg-muted/20">
                  <p className="text-2xl font-bold text-foreground">12</p>
                  <p className="text-xs text-muted-foreground mt-1">Uploaded PDFs</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-muted/20">
                  <p className="text-2xl font-bold text-foreground">48</p>
                  <p className="text-xs text-muted-foreground mt-1">Conversations</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-muted/20">
                  <p className="text-2xl font-bold text-foreground">1,240</p>
                  <p className="text-xs text-muted-foreground mt-1">Pinecone Vectors</p>
                </div>
              </div>
            )}

            {activeTab === "upload" && (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center animate-in fade-in-50 space-y-3">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium">Drag & drop your academic PDF here</p>
                <p className="text-xs text-muted-foreground">Supports PDF up to 50MB</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-muted-foreground">
              Everything you need to know about PDF AIDigest.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-medium text-foreground hover:bg-accent/50 transition-colors"
                >
                  <span className="text-sm sm:text-base">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      openFaqIndex === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/50">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  BookOpen,
  MessageSquare,
  ArrowLeft,
  Trash2,
  Download,
  Layers,
  CheckCircle2,
  Clock,
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

  const handleDelete = () => {
    deleteDocument(doc.id);
    router.push("/documents");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in-50">
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

        <div className="flex items-center gap-2">
          <Link href={`/documents/${doc.id}/summary`}>
            <Button variant="outline" className="gap-2">
              <BookOpen className="h-4 w-4" />
              View Summary
            </Button>
          </Link>
          <Link href={`/documents/${doc.id}/chat`}>
            <Button className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat with AI
            </Button>
          </Link>
        </div>
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
              <p className="text-xs text-muted-foreground uppercase font-medium">Pinecone Chunks</p>
              <p className="text-base font-bold text-foreground">{doc.vectorCount} vectors</p>
            </div>
          </div>
        </Card>
      </div>

      {/* PDF View Mockup */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div>
            <CardTitle className="text-base">Document Preview</CardTitle>
            <CardDescription className="text-xs">Processed PyMuPDF text rendering</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => alert("Downloading original PDF file from Supabase Storage...")}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-96 rounded-lg border border-border bg-muted/20 p-6 font-mono text-xs text-muted-foreground overflow-y-auto space-y-4">
            <p className="text-foreground font-bold text-sm text-center underline decoration-muted-foreground/30">
              {doc.title.toUpperCase()}
            </p>
            <p className="leading-relaxed">
              [Simulated PDF Viewer Page 1] - Chapter 1: Introduction to state-space representations in modern computational frameworks. The target domain comprises discrete states, action sets, and deterministic transition models...
            </p>
            <div className="p-4 rounded border border-border bg-card text-foreground">
              <span className="font-semibold text-emerald-500">Indexed Chunk #1:</span> &quot;A state space graph comprises nodes representing configurations and directed arcs representing transitions.&quot;
            </div>
            <p className="leading-relaxed">
              [Simulated PDF Viewer Page 2] - Evaluative functions combine step costs g(n) with heuristic estimations h(n). Detailed derivations demonstrate admissibility bounds...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

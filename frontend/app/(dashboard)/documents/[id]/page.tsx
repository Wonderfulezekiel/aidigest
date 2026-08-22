"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  BookOpen,
  MessageSquare,
  ArrowLeft,
  Award,
  Layers,
  Download,
  HardDrive,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useMockData } from "@/context/MockDataContext";
import { formatBytes, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

export default function DocumentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;
  const { documents, deleteDocument } = useMockData();

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const doc = documents.find((d) => d.id === docId);

  if (!doc) {
    return (
      <div className="text-center py-16 space-y-4 px-4">
        <h2 className="text-xl font-bold">Document Not Found</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">The requested document could not be located in your library.</p>
        <Link href="/documents">
          <Button variant="outline" size="sm">Return to Documents</Button>
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDocument(docId);
      router.push("/documents");
    } catch (err) {
      console.error("Failed to delete document:", err);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-5xl mx-auto w-full max-w-full overflow-hidden pb-12">
      {/* Back Link & Delete Header */}
      <div className="flex items-center justify-between gap-3">
        <Link href="/documents" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Document Library
        </Link>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDeleteModal(true)}
          className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete Document</span>
        </Button>
      </div>

      {/* Main Metadata Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4 sm:pb-6 w-full">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="success" className="text-[10px]">Indexed</Badge>
            <span className="text-xs font-mono text-muted-foreground truncate">ID: {doc.id}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground break-words">{doc.title}</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
            <span className="truncate">File: {doc.fileName}</span>
            <span>•</span>
            <span>Uploaded: {formatDate(doc.uploadDate)}</span>
          </p>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2 w-full md:w-auto">
          <Link href={`/documents/${doc.id}/summary`} className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs w-full">
              <BookOpen className="h-3.5 w-3.5" />
              Summary
            </Button>
          </Link>
          <Link href={`/documents/${doc.id}/chat`} className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs w-full">
              <MessageSquare className="h-3.5 w-3.5" />
              Chat
            </Button>
          </Link>
          <Link href={`/documents/${doc.id}/quiz`} className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-primary/40 text-primary w-full">
              <Award className="h-3.5 w-3.5" />
              Quiz
            </Button>
          </Link>
          <Link href={`/documents/${doc.id}/flashcards`} className="w-full sm:w-auto">
            <Button size="sm" className="gap-1.5 text-xs w-full">
              <Layers className="h-3.5 w-3.5" />
              Flashcards
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Action Study Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link href={`/documents/${doc.id}/summary`} className="block group">
          <Card className="p-4 border-border hover:border-primary/50 transition-all h-full flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <BookOpen className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Summaries</h3>
              <p className="text-xs text-muted-foreground">Executive overviews, tables, and core concepts.</p>
            </div>
            <span className="text-xs text-primary font-semibold mt-3 inline-block group-hover:underline">
              Read Summary &rarr;
            </span>
          </Card>
        </Link>

        <Link href={`/documents/${doc.id}/chat`} className="block group">
          <Card className="p-4 border-border hover:border-primary/50 transition-all h-full flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <MessageSquare className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Document Chat</h3>
              <p className="text-xs text-muted-foreground">Ask questions with exact page citations.</p>
            </div>
            <span className="text-xs text-primary font-semibold mt-3 inline-block group-hover:underline">
              Start Conversation &rarr;
            </span>
          </Card>
        </Link>

        <Link href={`/documents/${doc.id}/quiz`} className="block group">
          <Card className="p-4 border-border hover:border-primary/50 transition-all h-full flex flex-col justify-between bg-primary/5">
            <div className="space-y-2">
              <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                <Award className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Interactive Quiz</h3>
              <p className="text-xs text-muted-foreground">Learning quiz with instant feedback.</p>
            </div>
            <span className="text-xs text-primary font-semibold mt-3 inline-block group-hover:underline">
              Take Quiz &rarr;
            </span>
          </Card>
        </Link>

        <Link href={`/documents/${doc.id}/flashcards`} className="block group">
          <Card className="p-4 border-border hover:border-primary/50 transition-all h-full flex flex-col justify-between bg-emerald-500/5">
            <div className="space-y-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Layers className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-foreground">3D Flashcards</h3>
              <p className="text-xs text-muted-foreground">Active recall study deck with flip cards.</p>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-3 inline-block group-hover:underline">
              Study Deck &rarr;
            </span>
          </Card>
        </Link>
      </div>

      {/* Technical Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <HardDrive className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase font-medium">File Size</p>
              <p className="text-sm sm:text-base font-bold text-foreground">{formatBytes(doc.fileSize)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase font-medium">Total Pages</p>
              <p className="text-sm sm:text-base font-bold text-foreground">{doc.pageCount} pages</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase font-medium">Vectors</p>
              <p className="text-sm sm:text-base font-bold text-foreground">{doc.vectorCount} passages</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Document Information Card */}
      <Card className="shadow-xs w-full max-w-full">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
          <div>
            <CardTitle className="text-sm sm:text-base">Document Preview</CardTitle>
            <CardDescription className="text-xs">Extracted passages and study context</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => alert("Downloading document...")}>
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-56 rounded-lg border border-border bg-muted/20 p-4 font-mono text-xs text-muted-foreground overflow-y-auto space-y-2.5 break-words">
            <p className="text-foreground font-bold text-xs sm:text-sm underline decoration-muted-foreground/30 break-words">
              {doc.title.toUpperCase()}
            </p>
            <p className="leading-relaxed break-words">
              [Indexed Passage #1]: Course content introduces fundamental principles, requirements engineering, data gathering techniques, qualitative interviews, and quantitative system evaluations.
            </p>
            <div className="p-2.5 rounded border border-border bg-card text-foreground break-words">
              <span className="font-semibold text-emerald-500">Key Focus:</span> &quot;Establishing clear requirements is the foundation of successful engineering projects.&quot;
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Document"
        description="Permanently remove this document and its materials"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs flex items-start gap-2.5 text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Are you sure you want to delete this document?</p>
              <p className="mt-1 text-muted-foreground">
                This will permanently delete &ldquo;{doc.title}&rdquo; from cloud storage, database tables, quizzes, and vector indexes.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              isLoading={isDeleting}
              className="text-xs gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Permanently</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

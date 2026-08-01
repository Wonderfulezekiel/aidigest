"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Trash2,
  Plus,
  LayoutGrid,
  List,
} from "lucide-react";
import { useMockData, DocumentItem } from "@/context/MockDataContext";
import { formatBytes, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

export default function DocumentsPage() {
  const { documents, deleteDocument } = useMockData();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteTarget, setDeleteTarget] = useState<DocumentItem | null>(null);

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.fileName.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteDocument(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Document Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All uploaded academic PDFs and study materials ({documents.length} total)
          </p>
        </div>
        <Link href="/upload">
          <Button className="gap-2 shadow-xs">
            <Plus className="h-4 w-4" />
            Upload PDF
          </Button>
        </Link>
      </div>

      {/* Search & Layout Toggle Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents by title or filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-card pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          />
        </div>

        <div className="flex items-center rounded-lg border border-border bg-card p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid or List Display */}
      {filteredDocs.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <Card key={doc.id} className="flex flex-col justify-between hover:border-primary/40 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="success">Ready</Badge>
                    </div>
                  </div>
                  <CardTitle className="text-base font-semibold mt-3 line-clamp-2 leading-snug">
                    <Link href={`/documents/${doc.id}/summary`} className="hover:underline">
                      {doc.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1 truncate">
                    {doc.fileName}
                  </CardDescription>
                </CardHeader>

                <CardContent className="py-2 text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>File size:</span>
                    <span className="font-medium text-foreground">{formatBytes(doc.fileSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Page count:</span>
                    <span className="font-medium text-foreground">{doc.pageCount} pages</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uploaded:</span>
                    <span className="font-medium text-foreground">{formatDate(doc.uploadDate)}</span>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <div className="flex gap-2 flex-1">
                    <Link href={`/documents/${doc.id}/summary`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        Summary
                      </Button>
                    </Link>
                    <Link href={`/documents/${doc.id}/chat`} className="flex-1">
                      <Button size="sm" className="w-full text-xs">
                        Chat
                      </Button>
                    </Link>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => setDeleteTarget(doc)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          /* List View Table */
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="divide-y divide-border">
              {filteredDocs.map((doc) => (
                <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-accent/40 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <Link href={`/documents/${doc.id}/summary`} className="font-semibold text-sm hover:underline text-foreground">
                        {doc.title}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {doc.fileName} • {formatBytes(doc.fileSize)} • {doc.pageCount} pages
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/documents/${doc.id}/summary`}>
                      <Button variant="outline" size="sm" className="text-xs">Summary</Button>
                    </Link>
                    <Link href={`/documents/${doc.id}/chat`}>
                      <Button size="sm" className="text-xs">Chat</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteTarget(doc)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
          <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="text-sm font-semibold">No documents found</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No academic PDFs match your search query &quot;{search}&quot;. Try uploading a new file.
          </p>
          <Link href="/upload">
            <Button size="sm" className="mt-2">Upload Document</Button>
          </Link>
        </div>
      )}

      {/* Delete Modal Confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Document?"
        description="Are you sure you want to delete this document from your library?"
      >
        <div className="space-y-4">
          {deleteTarget && (
            <div className="p-3 rounded-lg bg-muted text-xs space-y-1">
              <p className="font-semibold text-foreground">{deleteTarget.title}</p>
              <p className="text-muted-foreground">This will permanently remove the document and its generated AI summaries.</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete Document
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

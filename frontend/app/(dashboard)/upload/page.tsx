"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  CheckCircle2,
  Cpu,
  Layers,
  BookOpen,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useMockData } from "@/context/MockDataContext";
import { formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

export default function UploadPage() {
  const router = useRouter();
  const { uploadDocument } = useMockData();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [createdDocId, setCreatedDocId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const steps = [
    { label: "Secure Document Upload", icon: FileText },
    { label: "Parsing Academic Content & Pages", icon: BookOpen },
    { label: "Analyzing Document Structure", icon: Cpu },
    { label: "Indexing Insights & Key Concepts", icon: Layers },
    { label: "Generating Executive & Detailed Summaries", icon: CheckCircle2 },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setSelectedFile(file);
        setErrorMessage(null);
      }
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setErrorMessage(null);
    setActiveStep(0);

    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const docId = await uploadDocument(selectedFile);
      setCreatedDocId(docId);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setErrorMessage(err.message || "Failed to process PDF document. Please try again.");
    } finally {
      clearInterval(stepInterval);
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in-50">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Upload Academic Document</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload any lecture note, textbook chapter, or paper for automated AI analysis, smart summaries, and interactive Q&A.
        </p>
      </div>

      {!createdDocId ? (
        <Card className="shadow-lg border-border">
          <CardHeader>
            <CardTitle className="text-lg">Select PDF Document</CardTitle>
            <CardDescription>Supported formats: PDF files up to 50MB</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all ${
                selectedFile ? "border-primary bg-primary/5" : "border-border bg-muted/20 hover:border-primary/40"
              }`}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              <label htmlFor="file-upload" className="cursor-pointer block space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Upload className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {selectedFile ? selectedFile.name : "Click to choose a file or drag & drop here"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedFile
                      ? `${formatBytes(selectedFile.size)} • PDF Ready`
                      : "Lecture slides, textbooks, assignments, and research articles"}
                  </p>
                </div>
              </label>
            </div>

            {/* Pipeline Status Progress */}
            {isUploading && (
              <div className="space-y-3 p-4 rounded-xl border border-border bg-card">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  AI Analysis & Processing...
                </p>
                <div className="space-y-2">
                  {steps.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isDone = idx < activeStep;
                    const isCurrent = idx === activeStep;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 text-xs p-2 rounded-md transition-colors ${
                          isCurrent
                            ? "bg-primary/10 font-semibold text-primary"
                            : isDone
                            ? "text-emerald-500 font-medium"
                            : "text-muted-foreground opacity-50"
                        }`}
                      >
                        {isCurrent ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                        ) : isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <StepIcon className="h-4 w-4 shrink-0" />
                        )}
                        <span>{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  setErrorMessage(null);
                }}
                disabled={!selectedFile || isUploading}
              >
                Clear
              </Button>
              <Button
                onClick={handleStartUpload}
                disabled={!selectedFile || isUploading}
                isLoading={isUploading}
                className="gap-2"
              >
                <span>Start AI Analysis</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Success Completed View */
        <Card className="shadow-xl border-emerald-500/30 bg-emerald-500/5 p-8 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Document Analysis Complete!</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Text has been analyzed, key concepts structured into topics, and AI summaries have been generated.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/documents/${createdDocId}/summary`)}
              className="w-full sm:w-auto"
            >
              View AI Summary
            </Button>
            <Button
              onClick={() => router.push(`/documents/${createdDocId}/chat`)}
              className="w-full sm:w-auto gap-2"
            >
              <span>Chat with Document</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

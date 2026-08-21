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
    { label: "Generating Summaries & Study Material", icon: CheckCircle2 },
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
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in-50 w-full max-w-full overflow-hidden pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Upload Document</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Upload any lecture handout, textbook chapter, or paper for automated analysis, summaries, and quizzes.
        </p>
      </div>

      {!createdDocId ? (
        <Card className="shadow-xs border-border w-full max-w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Select PDF Document</CardTitle>
            <CardDescription className="text-xs">Supported formats: PDF files up to 50MB</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 sm:p-4 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="break-words">{errorMessage}</span>
              </div>
            )}

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 sm:p-10 text-center transition-all ${
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
              <label htmlFor="file-upload" className="cursor-pointer block space-y-3 sm:space-y-4">
                <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Upload className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-foreground break-words">
                    {selectedFile ? selectedFile.name : "Click to choose file or drag & drop"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedFile
                      ? `${formatBytes(selectedFile.size)} • PDF Ready`
                      : "Lecture slides, textbooks, and research articles"}
                  </p>
                </div>
              </label>
            </div>

            {/* Pipeline Status Progress */}
            {isUploading && (
              <div className="space-y-2.5 p-3.5 sm:p-4 rounded-xl border border-border bg-card">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-primary" />
                  Processing & Indexing...
                </p>
                <div className="space-y-1.5">
                  {steps.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isDone = idx < activeStep;
                    const isCurrent = idx === activeStep;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2.5 text-xs p-2 rounded-md transition-colors ${
                          isCurrent
                            ? "bg-primary/10 font-semibold text-primary"
                            : isDone
                            ? "text-emerald-600 dark:text-emerald-400 font-medium"
                            : "text-muted-foreground opacity-50"
                        }`}
                      >
                        {isCurrent ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                        ) : isDone ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <StepIcon className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className="truncate">{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  setErrorMessage(null);
                }}
                disabled={!selectedFile || isUploading}
                className="text-xs"
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={handleStartUpload}
                disabled={!selectedFile || isUploading}
                isLoading={isUploading}
                className="gap-1.5 text-xs"
              >
                <span>Upload & Process</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Success Completed View */
        <Card className="shadow-xs border-emerald-500/30 bg-emerald-500/5 p-6 sm:p-8 text-center space-y-4 sm:space-y-6 w-full max-w-full">
          <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
            <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Analysis Complete!</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Text has been extracted, key concepts indexed, and summaries generated.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/documents/${createdDocId}/summary`)}
              className="w-full sm:w-auto text-xs"
            >
              View Summary
            </Button>
            <Button
              size="sm"
              onClick={() => router.push(`/documents/${createdDocId}/chat`)}
              className="w-full sm:w-auto gap-1.5 text-xs"
            >
              <span>Chat with Document</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

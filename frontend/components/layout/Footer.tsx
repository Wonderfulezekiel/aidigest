import React from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card/50 text-card-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-foreground">PDF AIDigest</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              An intelligent document summarization and conversational academic assistant designed for students, researchers, and educators.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-3">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/upload" className="hover:text-foreground transition-colors">
                  Upload PDF
                </Link>
              </li>
              <li>
                <Link href="/documents" className="hover:text-foreground transition-colors">
                  My Documents
                </Link>
              </li>
              <li>
                <Link href="/chat/history" className="hover:text-foreground transition-colors">
                  Chat History
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-3">Project Scope</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Next.js + Tailwind CSS</li>
              <li>FastAPI Backend</li>
              <li>Supabase & Pinecone RAG</li>
              <li>OpenRouter Free AI Models</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} PDF AIDigest. Final Year Academic Project.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground">Terms of Service</Link>
            <Link href="https://github.com" target="_blank" className="hover:text-foreground">GitHub</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeProvider";
import { MockDataProvider } from "@/context/MockDataContext";

export const metadata: Metadata = {
  title: "PDF AIDigest - Intelligent Academic Document Summarizer & AI Assistant",
  description:
    "An AI-powered academic assistant designed to help university and college students summarize lengthy PDFs, lecture notes, and research papers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <ThemeProvider>
          <MockDataProvider>{children}</MockDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

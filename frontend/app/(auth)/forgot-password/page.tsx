"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-xs">
          <BookOpen className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">
          PDF <span className="underline decoration-muted-foreground/30">AIDigest</span>
        </span>
      </Link>

      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Reset Password</CardTitle>
          <CardDescription>
            Enter your academic email address and we will send a password reset link
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isSubmitted ? (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-foreground">Reset link sent!</p>
              <p className="text-xs text-muted-foreground">
                We sent a password reset link to <strong>{email}</strong>. Please check your inbox or spam folder.
              </p>
              <Link href="/reset-password">
                <Button variant="outline" className="w-full mt-2">
                  Simulate Reset Link Click
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Academic Email"
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button type="submit" className="w-full justify-center" isLoading={isLoading}>
                Send Reset Link
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border pt-4">
          <Link href="/login" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

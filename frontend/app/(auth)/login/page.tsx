"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useMockData } from "@/context/MockDataContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { AILogo } from "@/components/ui/AILogo";

export default function LoginPage() {
  const router = useRouter();
  const { updateUserProfile } = useMockData();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setError("");

    try {
      const res = await api.login(email, password);
      if (typeof window !== "undefined") {
        if (res.token) localStorage.setItem("auth_token", res.token);
        if (res.user?.id) localStorage.setItem("auth_user_id", res.user.id);
        if (res.user?.email) localStorage.setItem("user_email", res.user.email);
        if (res.user?.full_name) localStorage.setItem("user_name", res.user.full_name);
      }
      if (res.user) {
        updateUserProfile(res.user.full_name, res.user.email);
      }
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <Link href="/" className="mb-8 transition-opacity hover:opacity-90">
        <AILogo size="lg" />
      </Link>

      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
          <CardDescription>
            Enter your credentials to access your PDF documents and AI chat history
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                {error}
              </div>
            )}

            <Input
              label="Academic Email"
              type="email"
              placeholder="student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                defaultChecked
                className="h-4 w-4 rounded border-input bg-background accent-primary cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer">
                Remember me on this browser
              </label>
            </div>

            <Button type="submit" className="w-full justify-center gap-2 mt-2" isLoading={isLoading}>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col border-t border-border pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-foreground hover:underline">
              Create one now
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

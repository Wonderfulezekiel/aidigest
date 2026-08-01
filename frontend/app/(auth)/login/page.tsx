"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useMockData } from "@/context/MockDataContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const { updateUserProfile } = useMockData();

  const [email, setEmail] = useState("student@university.edu");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.login(email, password);
      if (res.user && res.user.full_name) {
        updateUserProfile(res.user.full_name);
      }
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
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
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
          <CardDescription>
            Enter your credentials to access your PDF documents and AI chat history
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

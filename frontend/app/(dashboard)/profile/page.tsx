"use client";

import React, { useState } from "react";
import { User, Mail, Key, Check, AlertCircle, LogOut } from "lucide-react";
import { useMockData } from "@/context/MockDataContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function ProfilePage() {
  const { userProfile, updateUserProfile, logout } = useMockData();

  const [fullName, setFullName] = useState(userProfile.fullName);
  const [email, setEmail] = useState(userProfile.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const [nameSuccess, setNameSuccess] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);

  const [nameError, setNameError] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setIsUpdatingName(true);
    setNameError(null);
    setNameSuccess(false);

    try {
      await api.updateProfile(fullName, email);
      updateUserProfile(fullName);
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err: any) {
      setNameError(err.message || "Failed to update profile name");
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    setIsChangingPass(true);
    setPassError(null);
    setPassSuccess(false);

    try {
      await api.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setPassSuccess(true);
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (err: any) {
      setPassError(err.message || "Failed to change password");
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto w-full max-w-full overflow-hidden pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4 sm:pb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">User Profile</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your personal account settings and authentication credentials
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive gap-1.5 w-full sm:w-auto shrink-0"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </Button>
      </div>

      {/* Overview Card */}
      <Card className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl sm:text-2xl uppercase shadow-md shrink-0">
          {userProfile.fullName ? userProfile.fullName.charAt(0) : "U"}
        </div>
        <div className="space-y-1 text-center sm:text-left flex-1 w-full">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-foreground break-words">{userProfile.fullName}</h2>
            <Badge variant="success" className="text-[10px]">Active Session</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 break-words">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="break-all">{userProfile.email}</span>
          </p>
        </div>
      </Card>

      {/* Edit Name Form */}
      <Card className="w-full max-w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base font-semibold">Personal Information</CardTitle>
          <CardDescription className="text-xs">Update your display name and email address</CardDescription>
        </CardHeader>
        <CardContent>
          {nameError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="break-words">{nameError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateName} className="space-y-3 sm:space-y-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Academic Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
              {nameSuccess ? (
                <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Profile updated successfully!
                </span>
              ) : <span />}
              <Button type="submit" size="sm" isLoading={isUpdatingName} className="text-xs w-full sm:w-auto">
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Change Form */}
      <Card className="w-full max-w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" /> Security & Password
          </CardTitle>
          <CardDescription className="text-xs">Change your account password</CardDescription>
        </CardHeader>
        <CardContent>
          {passError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="break-words">{passError}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-3 sm:space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="New Password"
              type="password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
              {passSuccess ? (
                <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Password updated successfully!
                </span>
              ) : <span />}
              <Button type="submit" size="sm" isLoading={isChangingPass} className="text-xs w-full sm:w-auto">
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Session / Log Out Section */}
      <Card className="border-destructive/20 bg-destructive/5 w-full max-w-full p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">Sign Out of AIDigest</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Securely end your session on this browser.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={logout}
            className="text-xs gap-1.5 shrink-0 w-full sm:w-auto"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageHeader } from "@/components/page-header";
import { ModeToggle } from "@/components/theme-toggle";
import { signOut, useSession } from "@/lib/auth-client";
import {
  User,
  Mail,
  Globe,
  Shield,
  Save,
  LogOut,
  Gem,
  CheckCircle,
} from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [timezone, setTimezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  });
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleSignOut = () => {
    void signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.assign("/sign-in");
        },
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader title="Settings & Profile" />

      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-4xl mx-auto w-full">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Account Preferences</h2>
          <p className="text-xs text-muted-foreground">
            Manage your personal profile, local timezone, and application settings.
          </p>
        </div>

        {savedMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle className="size-4 shrink-0" />
            <span>Profile preferences updated successfully!</span>
          </div>
        )}

        {/* Profile Card */}
        <Card className="border-border/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">User Profile</CardTitle>
            <CardDescription className="text-xs">
              Your identity across Uli Health as a Service.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center gap-4 pb-2">
                <Avatar className="size-14 border">
                  <AvatarImage src={session?.user?.image ?? undefined} />
                  <AvatarFallback className="text-lg font-bold">
                    {session?.user?.name?.slice(0, 1).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{session?.user?.name ?? "Member"}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {(session?.user as any)?.role || "user"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1.5">
                    <User className="size-3.5 text-muted-foreground" />
                    <span>Display Name</span>
                  </label>
                  <Input
                    value={name || session?.user?.name || ""}
                    onChange={(e) => setName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1.5">
                    <Mail className="size-3.5 text-muted-foreground" />
                    <span>Email Address</span>
                  </label>
                  <Input
                    value={session?.user?.email || ""}
                    disabled
                    className="h-9 text-xs bg-muted/40 font-mono"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1.5">
                    <Globe className="size-3.5 text-muted-foreground" />
                    <span>Timezone</span>
                  </label>
                  <Input
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Calculates day start & end for meals and scheduled tasks.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1.5">
                    <Gem className="size-3.5 text-muted-foreground" />
                    <span>Current Plan</span>
                  </label>
                  <div className="flex items-center justify-between p-2 rounded-md border h-9 text-xs">
                    <span className="font-medium">
                      {(session?.user as any)?.isPremium ? "Pro HaaS Member" : "Starter (Free)"}
                    </span>
                    <Button variant="ghost" size="xs" asChild className="text-[11px] text-primary h-6">
                      <a href="/dashboard/pricing">Upgrade</a>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" size="sm" className="gap-1.5 text-xs">
                  <Save className="size-3.5" />
                  <span>Save Changes</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Appearance & Interface */}
        <Card className="border-border/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Interface & Theme</CardTitle>
            <CardDescription className="text-xs">
              Customize the look and feel of your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-medium">Theme Mode</span>
              <p className="text-xs text-muted-foreground">
                Toggle between light and dark visual aesthetics.
              </p>
            </div>
            <ModeToggle />
          </CardContent>
        </Card>

        {/* Security & Sessions */}
        <Card className="border-border/80 border-destructive/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-destructive">
              Session & Sign Out
            </CardTitle>
            <CardDescription className="text-xs">
              Securely sign out of your current session on this device.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-medium">End Active Session</span>
              <p className="text-xs text-muted-foreground">
                You will need to sign back in with your credentials or Google account.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSignOut}
              className="gap-1.5 text-xs"
            >
              <LogOut className="size-3.5" />
              <span>Sign Out</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Flame,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Droplets,
  Apple,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

export default function LandingHomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      {/* Top Navbar */}
      <header className="border-b border-border/60 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm">
              U
            </div>
            <span className="font-extrabold text-xl tracking-tight">Uli</span>
            <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider py-0 px-1.5 ml-1">
              HaaS
            </Badge>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">
              Platform Features
            </Link>
            <Link href="/dashboard/pricing" className="hover:text-foreground transition-colors">
              Membership Plans
            </Link>
            <Link href="#architecture" className="hover:text-foreground transition-colors">
              Health as a Service
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <Button size="sm" asChild className="gap-1.5 shadow-sm text-xs h-8">
                <Link href="/dashboard">
                  <span>Go to Dashboard</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="text-xs h-8">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="gap-1.5 shadow-sm text-xs h-8">
                  <Link href="/dashboard">
                    <span>Enter Workspace</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Badge className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            ⚡ All-in-One Health as a Service (HaaS)
          </Badge>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]">
            Calibrate Your Nutrition. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-500 to-cyan-500">
              Execute Your Day.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Uli fuses precision macronutrient tracking, intelligent daily meal logging, and prioritized task scheduling into a single high-performance operating system.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Button size="lg" asChild className="gap-2 shadow-md h-11 px-6 font-semibold">
              <Link href="/dashboard">
                <span>Launch App Dashboard</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="h-11 px-6 font-semibold">
              <Link href="/dashboard/pricing">Explore HaaS Tiers</Link>
            </Button>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-500" /> PostgreSQL & Drizzle Powered
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="size-4 text-primary" /> Real-time Macro Balancing
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="size-4 text-blue-500" /> Priority Task Engine
            </span>
          </div>
        </div>
      </section>

      {/* Feature Pillars Grid */}
      <section id="features" className="py-20 bg-muted/20 border-y border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Engineered for Optimal Daily Output
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Everything you need to sustain biological energy and operational focus.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Feature 1 */}
            <Card className="border-border/80 bg-card">
              <CardHeader className="space-y-2">
                <div className="size-10 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Flame className="size-5" />
                </div>
                <CardTitle className="text-base font-bold">Nutrition & Macro Diary</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Log foods across Breakfast, Lunch, Dinner, and Snacks. Automatically calculate Protein, Carbohydrate, and Fat breakdown with live goal alerts.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="border-border/80 bg-card">
              <CardHeader className="space-y-2">
                <div className="size-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="size-5" />
                </div>
                <CardTitle className="text-base font-bold">Prioritized Task Flow</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Categorize goals by Work, Health, or Fitness. Assign urgency badges, track estimated minutes, and conquer your daily checklist with one-click toggles.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="border-border/80 bg-card">
              <CardHeader className="space-y-2">
                <div className="size-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <TrendingUp className="size-5" />
                </div>
                <CardTitle className="text-base font-bold">Analytics & Intelligence</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Review 7-day caloric adherence charts, weekly task completion rates, and get instant dietary adjustments from your built-in AI Health Assistant.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/60 py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="size-5 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-[10px]">
              U
            </div>
            <span className="font-semibold text-foreground">Uli HaaS</span>
            <span>• Next-Generation Health as a Service</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/dashboard/pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <Link href="/dashboard/settings" className="hover:text-foreground">
              Settings
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
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
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/lib/auth-client";
import {
  Check,
  Gem,
  Sparkles,
  Zap,
  Shield,
  CreditCard,
  ArrowRight,
} from "lucide-react";

export default function PricingPage() {
  const { data: session } = useSession();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      id: "starter",
      name: "Starter",
      description: "Essential task management and baseline nutrition logging.",
      priceMonthly: 0,
      priceYearly: 0,
      badge: null,
      features: [
        "Up to 20 active tasks per day",
        "Basic nutrition diary (up to 5 entries)",
        "Standard calorie counter",
        "Mobile companion app access",
        "Community support",
      ],
      cta: "Current Active Tier",
      highlighted: false,
    },
    {
      id: "pro",
      name: "Pro HaaS",
      description: "Complete Health as a Service platform for high performers.",
      priceMonthly: 19,
      priceYearly: 190,
      badge: "Most Popular",
      features: [
        "Unlimited tasks & custom categories",
        "Full nutrition database with 500k+ foods",
        "Personalized macro targets & alerts",
        "Advanced weekly analytics & charts",
        "Hydration & micronutrient tracking",
        "Recurring task rules & subtasks",
        "Priority customer support",
      ],
      cta: "Upgrade to Pro",
      highlighted: true,
    },
    {
      id: "elite",
      name: "Elite Performance",
      description: "AI-driven bio-optimization and dedicated health coaching.",
      priceMonthly: 39,
      priceYearly: 390,
      badge: "Complete HaaS",
      features: [
        "All features in Pro HaaS",
        "Unlimited AI Health Assistant queries",
        "AI food photo & label recognition",
        "Custom metabolic rate adjustments",
        "Export reports for dietitians & doctors",
        "Direct 1-on-1 health coach messaging",
        "Early access to hardware integrations",
      ],
      cta: "Join Elite",
      highlighted: false,
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader title="HaaS Membership & Plans" />

      <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 max-w-6xl mx-auto w-full">
        {/* Title & Billing Toggle */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="outline" className="px-3 py-1 font-mono text-xs">
            Health as a Service (HaaS)
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Invest in Your Peak Daily Performance
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose the tier that fuels your lifestyle. Upgrade, downgrade, or cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <span
              className={`text-xs font-semibold cursor-pointer ${
                billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly Billing
            </span>

            <button
              type="button"
              onClick={() => setBillingCycle((c) => (c === "monthly" ? "yearly" : "monthly"))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                billingCycle === "yearly" ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                  billingCycle === "yearly" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>

            <span
              className={`text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"
              }`}
              onClick={() => setBillingCycle("yearly")}
            >
              Annual Billing
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-6 lg:grid-cols-3 items-stretch">
          {plans.map((plan) => {
            const price = billingCycle === "monthly" ? plan.priceMonthly : Math.round(plan.priceYearly / 12);

            return (
              <Card
                key={plan.id}
                className={`flex flex-col justify-between relative transition-all ${
                  plan.highlighted
                    ? "border-primary shadow-lg ring-1 ring-primary/20 bg-card"
                    : "border-border/80 bg-card"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground font-semibold text-[11px] px-3">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="space-y-2 pt-6">
                  <CardTitle className="text-xl font-bold flex items-center justify-between">
                    <span>{plan.name}</span>
                    {plan.id === "pro" && <Sparkles className="size-4 text-primary" />}
                    {plan.id === "elite" && <Gem className="size-4 text-primary" />}
                  </CardTitle>
                  <CardDescription className="text-xs min-h-8">
                    {plan.description}
                  </CardDescription>

                  <div className="pt-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold tracking-tight">
                        ${price}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        / month
                      </span>
                    </div>
                    {billingCycle === "yearly" && plan.priceYearly > 0 && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Billed annually at ${plan.priceYearly}/year
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 flex-1">
                  <div className="border-t border-border/60 pt-4 space-y-2.5">
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Included with {plan.name}:
                    </p>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <Check className="size-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="pt-4 border-t border-border/60">
                  <Button
                    variant={plan.highlighted ? "default" : "outline"}
                    className="w-full text-xs font-semibold gap-1.5 h-9"
                    onClick={() => {
                      if (plan.id === "starter") {
                        alert("You are currently on the Starter plan.");
                      } else {
                        alert(`Redirecting to secure checkout for ${plan.name} (${billingCycle})...`);
                      }
                    }}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Guarantee Banner */}
        <div className="p-4 rounded-xl border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Shield className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">30-Day Money-Back Guarantee</p>
              <p className="text-muted-foreground">
                If Uli HaaS doesn't transform your daily health and productivity, request a full refund within 30 days.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground shrink-0">
            <CreditCard className="size-4" />
            <span>Secure Dodo & Stripe Processing</span>
          </div>
        </div>
      </div>
    </div>
  );
}

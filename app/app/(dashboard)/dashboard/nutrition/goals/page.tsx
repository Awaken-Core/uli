"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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
import {
  goalsApi,
  type NutritionGoal,
} from "@/lib/api";
import {
  Target,
  ArrowLeft,
  Flame,
  Droplets,
  Save,
  CheckCircle,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";

export default function GoalsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeGoal, setActiveGoal] = useState<NutritionGoal | null>(null);

  const [calorieTarget, setCalorieTarget] = useState("2000");
  const [proteinTarget, setProteinTarget] = useState("130");
  const [carbsTarget, setCarbsTarget] = useState("220");
  const [fatTarget, setFatTarget] = useState("65");
  const [fiberTarget, setFiberTarget] = useState("30");
  const [sodiumLimit, setSodiumLimit] = useState("2300");
  const [waterTarget, setWaterTarget] = useState("2500");
  const [effectiveFrom, setEffectiveFrom] = useState(
    () => new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    async function loadGoal() {
      try {
        setLoading(true);
        const goal = await goalsApi.getGoals();
        if (goal) {
          setActiveGoal(goal);
          if (goal.calorieTarget) setCalorieTarget(String(goal.calorieTarget));
          if (goal.proteinGramsTarget) setProteinTarget(String(goal.proteinGramsTarget));
          if (goal.carbohydrateGramsTarget) setCarbsTarget(String(goal.carbohydrateGramsTarget));
          if (goal.fatGramsTarget) setFatTarget(String(goal.fatGramsTarget));
          if (goal.fiberGramsTarget) setFiberTarget(String(goal.fiberGramsTarget));
          if (goal.sodiumMilligramsLimit) setSodiumLimit(String(goal.sodiumMilligramsLimit));
          if (goal.waterMillilitersTarget) setWaterTarget(String(goal.waterMillilitersTarget));
          if (goal.effectiveFrom) setEffectiveFrom(goal.effectiveFrom);
        }
      } catch (err) {
        console.error("Failed to load goals", err);
      } finally {
        setLoading(false);
      }
    }
    loadGoal();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSavedSuccess(false);

      const payload = {
        effectiveFrom,
        calorieTarget: Number(calorieTarget) || 2000,
        proteinGramsTarget: Number(proteinTarget) || 130,
        carbohydrateGramsTarget: Number(carbsTarget) || 220,
        fatGramsTarget: Number(fatTarget) || 65,
        fiberGramsTarget: Number(fiberTarget) || 30,
        sodiumMilligramsLimit: Number(sodiumLimit) || 2300,
        waterMillilitersTarget: Number(waterTarget) || 2500,
      };

      const result = await goalsApi.createGoal(payload);
      setActiveGoal(result);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to save goal", err);
    } finally {
      setSaving(false);
    }
  };

  // Macro calorie estimation: P*4 + C*4 + F*9
  const calculatedCals =
    (Number(proteinTarget) || 0) * 4 +
    (Number(carbsTarget) || 0) * 4 +
    (Number(fatTarget) || 0) * 9;
  const targetNum = Number(calorieTarget) || 0;
  const macroCalorieDiff = Math.abs(calculatedCals - targetNum);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader title="Daily Goals & Targets" />

      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-4xl mx-auto w-full">
        {/* Navigation Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild className="size-8">
            <Link href="/dashboard/nutrition">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Personalized Nutrition Targets</h2>
            <p className="text-xs text-muted-foreground">
              Define your optimal daily calorie intake, macronutrient distribution, and hydration.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle className="size-4 shrink-0" />
            <span>Your nutritional goals were successfully saved and are now effective!</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground text-sm gap-2">
            <Loader2 className="size-5 animate-spin" /> Loading your goals...
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Calories & Effective Date */}
            <Card className="border-border/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Flame className="size-4 text-orange-500" />
                  <span>Energy & Calorie Baseline</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Your daily energy budget in kilocalories (kcal).
                </CardDescription>
              </CardHeader>

              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Daily Calorie Target (kcal) *</label>
                  <Input
                    type="number"
                    value={calorieTarget}
                    onChange={(e) => setCalorieTarget(e.target.value)}
                    className="h-9 font-mono"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Recommended for maintenance or active deficit.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Effective Starting Date *</label>
                  <Input
                    type="date"
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                    className="h-9 font-mono"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    When this nutrition plan takes effect.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Macronutrient Targets */}
            <Card className="border-border/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <span>Macronutrient Targets</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Target grams for Protein, Carbohydrates, Fats, and Fiber.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Protein (g)</label>
                    <Input
                      type="number"
                      value={proteinTarget}
                      onChange={(e) => setProteinTarget(e.target.value)}
                      className="font-mono h-9"
                    />
                    <span className="text-[10px] text-muted-foreground block">
                      {(Number(proteinTarget) || 0) * 4} kcal
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Carbohydrates (g)</label>
                    <Input
                      type="number"
                      value={carbsTarget}
                      onChange={(e) => setCarbsTarget(e.target.value)}
                      className="font-mono h-9"
                    />
                    <span className="text-[10px] text-muted-foreground block">
                      {(Number(carbsTarget) || 0) * 4} kcal
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Fats (g)</label>
                    <Input
                      type="number"
                      value={fatTarget}
                      onChange={(e) => setFatTarget(e.target.value)}
                      className="font-mono h-9"
                    />
                    <span className="text-[10px] text-muted-foreground block">
                      {(Number(fatTarget) || 0) * 9} kcal
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Fiber (g)</label>
                    <Input
                      type="number"
                      value={fiberTarget}
                      onChange={(e) => setFiberTarget(e.target.value)}
                      className="font-mono h-9"
                    />
                    <span className="text-[10px] text-muted-foreground block">Gut & digestion</span>
                  </div>
                </div>

                {/* Macro check box */}
                <div className="p-3 rounded-lg border bg-muted/30 text-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-foreground">
                      Sum of Macros: {calculatedCals} kcal
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {macroCalorieDiff > 50
                        ? `Note: Macro sum differs from your calorie target (${targetNum} kcal) by ${macroCalorieDiff} kcal.`
                        : "Balanced: Macro sum aligns closely with your total daily calorie target."}
                    </div>
                  </div>

                  <Badge
                    variant={macroCalorieDiff <= 50 ? "outline" : "secondary"}
                    className="text-[11px]"
                  >
                    {macroCalorieDiff <= 50 ? "Balanced" : "Adjustable"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Hydration & Micronutrients */}
            <Card className="border-border/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Droplets className="size-4 text-cyan-500" />
                  <span>Hydration & Sodium Thresholds</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Daily water intake and maximum recommended sodium limit.
                </CardDescription>
              </CardHeader>

              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Water Intake Goal (ml)</label>
                  <Input
                    type="number"
                    value={waterTarget}
                    onChange={(e) => setWaterTarget(e.target.value)}
                    className="h-9 font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground">Standard target: 2,000 - 3,000 ml.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Sodium Limit (mg)</label>
                  <Input
                    type="number"
                    value={sodiumLimit}
                    onChange={(e) => setSodiumLimit(e.target.value)}
                    className="h-9 font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Recommended daily maximum limit: 2,300 mg.
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button type="submit" disabled={saving} className="gap-1.5 shadow-sm">
                  {saving ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Save className="size-3.5" />
                  )}
                  <span>Save Daily Targets</span>
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
}

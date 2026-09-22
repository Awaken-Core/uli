"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  nutritionApi,
  foodsApi,
  type DailyNutritionSummary,
  type FoodItem,
  type NutritionEntry,
} from "@/lib/api";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Utensils,
  Flame,
  Search,
  Sparkles,
  Target,
  Apple,
  Loader2,
  Calendar,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";

export default function NutritionTrackerPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );
  const [summary, setSummary] = useState<DailyNutritionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Log Modal
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");
  const [logTab, setLogTab] = useState<"search" | "custom">("search");

  // Search template states
  const [searchFoodQuery, setSearchFoodQuery] = useState("");
  const [foodTemplates, setFoodTemplates] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servingQuantity, setServingQuantity] = useState("1");
  const [isSearching, setIsSearching] = useState(false);

  // Custom log states
  const [customName, setCustomName] = useState("");
  const [customCalories, setCustomCalories] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [customCarbs, setCustomCarbs] = useState("");
  const [customFat, setCustomFat] = useState("");

  const loadSummary = async (dateStr: string) => {
    try {
      setLoading(true);
      const data = await nutritionApi.getSummary(dateStr);
      setSummary(data);
    } catch (err) {
      console.error("Failed to load nutrition summary", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary(selectedDate);
  }, [selectedDate]);

  // Search foods when query changes
  useEffect(() => {
    if (!searchFoodQuery.trim()) {
      setFoodTemplates([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await foodsApi.getFoods({ search: searchFoodQuery.trim() });
        setFoodTemplates(results);
      } catch (err) {
        console.error("Failed to search foods", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchFoodQuery]);

  const changeDateBy = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  const setDateToToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  const openLogModalForMeal = (meal: "breakfast" | "lunch" | "dinner" | "snack") => {
    setActiveMealType(meal);
    setSelectedFood(null);
    setServingQuantity("1");
    setSearchFoodQuery("");
    setCustomName("");
    setCustomCalories("");
    setCustomProtein("");
    setCustomCarbs("");
    setCustomFat("");
    setLogModalOpen(true);
  };

  const handleLogFoodTemplate = async () => {
    if (!selectedFood) return;
    const qty = parseFloat(servingQuantity) || 1;

    try {
      await nutritionApi.createEntry({
        foodId: selectedFood.id,
        foodName: selectedFood.name,
        mealType: activeMealType,
        source: "savedFood",
        quantity: qty,
        quantityUnit: selectedFood.servingUnit || "serving",
        consumedAt: new Date(selectedDate + "T12:00:00Z").toISOString(),
      });
      setLogModalOpen(false);
      loadSummary(selectedDate);
    } catch (err) {
      console.error("Failed to log food template", err);
    }
  };

  const handleLogCustomFood = async () => {
    if (!customName.trim() || !customCalories) return;

    try {
      await nutritionApi.createEntry({
        foodName: customName.trim(),
        mealType: activeMealType,
        source: "manual",
        quantity: 1,
        quantityUnit: "serving",
        calories: Number(customCalories) || 0,
        proteinGrams: Number(customProtein) || 0,
        carbohydrateGrams: Number(customCarbs) || 0,
        fatGrams: Number(customFat) || 0,
        consumedAt: new Date(selectedDate + "T12:00:00Z").toISOString(),
      });
      setLogModalOpen(false);
      loadSummary(selectedDate);
    } catch (err) {
      console.error("Failed to log custom food", err);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await nutritionApi.deleteEntry(id);
      loadSummary(selectedDate);
    } catch (err) {
      console.error("Failed to delete entry", err);
    }
  };

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  const targetCals = summary?.summary?.target?.calories || 2000;
  const consumedCals = summary?.summary?.consumed?.calories || 0;
  const remainingCals = Math.max(0, targetCals - consumedCals);
  const calPercent = Math.min(100, Math.round((consumedCals / targetCals) * 100));

  const proteinConsumed = summary?.summary?.consumed?.protein || 0;
  const proteinTarget = summary?.summary?.target?.protein || 130;
  const carbsConsumed = summary?.summary?.consumed?.carbohydrates || 0;
  const carbsTarget = summary?.summary?.target?.carbohydrates || 220;
  const fatConsumed = summary?.summary?.consumed?.fats || 0;
  const fatTarget = summary?.summary?.target?.fats || 65;
  const fiberConsumed = summary?.summary?.consumed?.fiber || 0;
  const fiberTarget = summary?.summary?.target?.fiber || 30;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader title="Nutrition & Macro Tracker" />

      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
        {/* Navigation & Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-4">
          {/* Date Navigator */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => changeDateBy(-1)}
              className="size-8"
            >
              <ChevronLeft className="size-4" />
            </Button>

            <Button
              variant={isToday ? "secondary" : "outline"}
              size="sm"
              onClick={setDateToToday}
              className="h-8 text-xs font-medium"
            >
              Today
            </Button>

            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => changeDateBy(1)}
              className="size-8"
            >
              <ChevronRight className="size-4" />
            </Button>

            <div className="flex items-center gap-1.5 ml-2 text-sm font-semibold">
              <Calendar className="size-4 text-muted-foreground" />
              <span>
                {new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="gap-1.5 h-8 text-xs">
              <Link href="/dashboard/nutrition/foods">
                <Apple className="size-3.5" />
                <span>Food Database</span>
              </Link>
            </Button>

            <Button variant="outline" size="sm" asChild className="gap-1.5 h-8 text-xs">
              <Link href="/dashboard/nutrition/goals">
                <Target className="size-3.5" />
                <span>Adjust Goals</span>
              </Link>
            </Button>

            <Button
              size="sm"
              className="gap-1.5 h-8 text-xs shadow-sm"
              onClick={() => openLogModalForMeal("breakfast")}
            >
              <Plus className="size-3.5" />
              <span>Log Meal</span>
            </Button>
          </div>
        </div>

        {/* Hero Daily Summary Card */}
        <div className="grid gap-4 md:grid-cols-5">
          {/* Calorie Ring / Bar Card (2 cols) */}
          <Card className="md:col-span-2 border-border/80 bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                <span>Daily Calories</span>
                <span className="p-1 rounded bg-orange-500/10 text-orange-500 text-xs font-mono font-normal">
                  <Flame className="size-3.5 inline mr-1" />
                  Target: {targetCals} kcal
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-extrabold tracking-tight">
                    {consumedCals.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Calories Consumed</div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-primary font-mono">
                    {remainingCals.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Remaining kcal</div>
                </div>
              </div>

              <Progress value={calPercent} className="h-3" />

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{calPercent}% of target</span>
                <span className="font-medium text-foreground">
                  {consumedCals > targetCals ? "Over target" : "Within target range"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Macros Breakdown (3 cols) */}
          <Card className="md:col-span-3 border-border/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <span>Macronutrients Breakdown</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              {/* Protein */}
              <div className="p-3 rounded-lg border border-border/60 bg-card space-y-1.5">
                <div className="text-xs font-semibold text-muted-foreground">Protein</div>
                <div className="text-lg font-bold">{proteinConsumed}g</div>
                <Progress
                  value={Math.min(100, Math.round((proteinConsumed / proteinTarget) * 100))}
                  className="h-1.5"
                />
                <div className="text-[11px] text-muted-foreground font-mono">Goal: {proteinTarget}g</div>
              </div>

              {/* Carbohydrates */}
              <div className="p-3 rounded-lg border border-border/60 bg-card space-y-1.5">
                <div className="text-xs font-semibold text-muted-foreground">Carbs</div>
                <div className="text-lg font-bold">{carbsConsumed}g</div>
                <Progress
                  value={Math.min(100, Math.round((carbsConsumed / carbsTarget) * 100))}
                  className="h-1.5"
                />
                <div className="text-[11px] text-muted-foreground font-mono">Goal: {carbsTarget}g</div>
              </div>

              {/* Fats */}
              <div className="p-3 rounded-lg border border-border/60 bg-card space-y-1.5">
                <div className="text-xs font-semibold text-muted-foreground">Fats</div>
                <div className="text-lg font-bold">{fatConsumed}g</div>
                <Progress
                  value={Math.min(100, Math.round((fatConsumed / fatTarget) * 100))}
                  className="h-1.5"
                />
                <div className="text-[11px] text-muted-foreground font-mono">Goal: {fatTarget}g</div>
              </div>

              {/* Fiber */}
              <div className="p-3 rounded-lg border border-border/60 bg-card space-y-1.5">
                <div className="text-xs font-semibold text-muted-foreground">Fiber</div>
                <div className="text-lg font-bold">{fiberConsumed}g</div>
                <Progress
                  value={Math.min(100, Math.round((fiberConsumed / fiberTarget) * 100))}
                  className="h-1.5"
                />
                <div className="text-[11px] text-muted-foreground font-mono">Goal: {fiberTarget}g</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meal Categories Sections */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight">Meals Logged</h3>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm gap-2">
              <Loader2 className="size-5 animate-spin" /> Loading meal logs...
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {(["breakfast", "lunch", "dinner", "snack"] as const).map((meal) => {
                const mealData = summary?.byMeal?.[meal];
                const cals = mealData?.calories || 0;
                const entries = mealData?.entries || [];

                return (
                  <Card key={meal} className="border-border/80 flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20">
                      <div>
                        <CardTitle className="capitalize text-sm font-bold flex items-center gap-2">
                          <span>{meal}</span>
                          <Badge variant="outline" className="text-[11px] font-mono font-normal">
                            {cals} kcal
                          </Badge>
                        </CardTitle>
                      </div>

                      <Button
                        size="xs"
                        variant="secondary"
                        className="gap-1 text-xs h-7"
                        onClick={() => openLogModalForMeal(meal)}
                      >
                        <Plus className="size-3" /> Log Item
                      </Button>
                    </CardHeader>

                    <CardContent className="space-y-2 p-3 flex-1">
                      {entries.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground/60 text-xs italic">
                          No items logged for {meal}
                        </div>
                      ) : (
                        <div className="divide-y divide-border/50">
                          {entries.map((entry) => (
                            <div
                              key={entry.id}
                              className="py-2.5 flex items-center justify-between text-xs hover:bg-muted/10 px-1 rounded transition-colors"
                            >
                              <div className="space-y-0.5 min-w-0 pr-2">
                                <div className="font-medium text-foreground truncate">
                                  {entry.foodName}
                                </div>
                                <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                                  <span>
                                    {entry.quantity} {entry.quantityUnit}
                                  </span>
                                  <span>•</span>
                                  <span>P: {entry.proteinGrams}g</span>
                                  <span>C: {entry.carbohydrateGrams}g</span>
                                  <span>F: {entry.fatGrams}g</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="font-mono font-semibold text-foreground">
                                  {entry.calories} kcal
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  className="size-6 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleDeleteEntry(entry.id)}
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Log Food Modal */}
      <Dialog open={logModalOpen} onOpenChange={setLogModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="capitalize">Log Food to {activeMealType}</DialogTitle>
            <DialogDescription>
              Search from your saved food database or record a custom item.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={logTab} onValueChange={(v) => setLogTab(v as any)} className="w-full">
            <TabsList className="grid grid-cols-2 mb-3">
              <TabsTrigger value="search" className="text-xs">
                Search Foods
              </TabsTrigger>
              <TabsTrigger value="custom" className="text-xs">
                Quick Custom
              </TabsTrigger>
            </TabsList>

            {/* Search Tab */}
            <TabsContent value="search" className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search food by name (e.g. Oatmeal, Chicken breast)..."
                  value={searchFoodQuery}
                  onChange={(e) => setSearchFoodQuery(e.target.value)}
                  className="pl-8 text-xs h-9"
                />
              </div>

              {/* Search Results */}
              <div className="max-h-52 overflow-y-auto divide-y divide-border/60 border rounded-md">
                {isSearching ? (
                  <div className="py-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="size-3.5 animate-spin" /> Searching food database...
                  </div>
                ) : foodTemplates.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    {searchFoodQuery ? "No matching foods found" : "Type above to search foods"}
                  </div>
                ) : (
                  foodTemplates.map((food) => {
                    const isSelected = selectedFood?.id === food.id;
                    return (
                      <div
                        key={food.id}
                        onClick={() => setSelectedFood(food)}
                        className={`p-2.5 text-xs cursor-pointer transition-colors flex items-center justify-between ${
                          isSelected ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-muted/40"
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-foreground">{food.name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            1 {food.servingUnit} • P: {food.proteinGrams}g, C: {food.carbohydrateGrams}g, F: {food.fatGrams}g
                          </div>
                        </div>
                        <div className="font-mono font-bold text-foreground">
                          {food.calories} kcal
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {selectedFood && (
                <div className="p-3 bg-muted/30 rounded-lg space-y-2 border">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Selected: {selectedFood.name}</span>
                    <span className="font-mono text-primary font-bold">
                      {Math.round(selectedFood.calories * (parseFloat(servingQuantity) || 1))} kcal
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground">Servings:</label>
                    <Input
                      type="number"
                      step="0.5"
                      min="0.1"
                      value={servingQuantity}
                      onChange={(e) => setServingQuantity(e.target.value)}
                      className="w-24 h-7 text-xs"
                    />
                    <span className="text-xs text-muted-foreground">
                      x {selectedFood.servingUnit}
                    </span>
                  </div>
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => setLogModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleLogFoodTemplate} disabled={!selectedFood}>
                  Add to {activeMealType}
                </Button>
              </DialogFooter>
            </TabsContent>

            {/* Custom Tab */}
            <TabsContent value="custom" className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Food / Meal Name *</label>
                <Input
                  placeholder="e.g. Avocado Toast with Egg"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Calories (kcal) *</label>
                  <Input
                    type="number"
                    placeholder="350"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Protein (g)</label>
                  <Input
                    type="number"
                    placeholder="18"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Carbohydrates (g)</label>
                  <Input
                    type="number"
                    placeholder="25"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Fats (g)</label>
                  <Input
                    type="number"
                    placeholder="12"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => setLogModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleLogCustomFood}>Add to {activeMealType}</Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

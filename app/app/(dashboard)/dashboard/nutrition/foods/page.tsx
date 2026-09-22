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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  foodsApi,
  type FoodItem,
} from "@/lib/api";
import {
  Search,
  Plus,
  Trash2,
  Apple,
  ArrowLeft,
  Loader2,
  Tag,
  Scale,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";

export default function FoodsLibraryPage() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyUser, setOnlyUser] = useState(false);

  // Create Food Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [barcode, setBarcode] = useState("");
  const [servingQuantity, setServingQuantity] = useState("1");
  const [servingUnit, setServingUnit] = useState("serving");
  const [calories, setCalories] = useState("");
  const [proteinGrams, setProteinGrams] = useState("");
  const [carbohydrateGrams, setCarbohydrateGrams] = useState("");
  const [fatGrams, setFatGrams] = useState("");
  const [fiberGrams, setFiberGrams] = useState("");
  const [sodiumMilligrams, setSodiumMilligrams] = useState("");

  const loadFoods = async () => {
    try {
      setLoading(true);
      const data = await foodsApi.getFoods({
        search: searchQuery.trim() || undefined,
        onlyUser,
      });
      setFoods(data);
    } catch (err) {
      console.error("Failed to load foods", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadFoods();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, onlyUser]);

  const handleCreateFood = async () => {
    if (!name.trim()) return;

    try {
      const newFood = await foodsApi.createFood({
        name: name.trim(),
        brand: brand.trim() || undefined,
        barcode: barcode.trim() || undefined,
        servingQuantity: parseFloat(servingQuantity) || 1,
        servingUnit: servingUnit.trim() || "serving",
        calories: Number(calories) || 0,
        proteinGrams: Number(proteinGrams) || 0,
        carbohydrateGrams: Number(carbohydrateGrams) || 0,
        fatGrams: Number(fatGrams) || 0,
        saturatedFatGrams: 0,
        fiberGrams: Number(fiberGrams) || 0,
        sugarGrams: 0,
        sodiumMilligrams: Number(sodiumMilligrams) || 0,
      });

      setFoods((prev) => [newFood, ...prev]);
      setCreateModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Failed to create food", err);
    }
  };

  const handleDeleteFood = async (id: string) => {
    try {
      await foodsApi.deleteFood(id);
      setFoods((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Failed to delete food", err);
    }
  };

  const resetForm = () => {
    setName("");
    setBrand("");
    setBarcode("");
    setServingQuantity("1");
    setServingUnit("serving");
    setCalories("");
    setProteinGrams("");
    setCarbohydrateGrams("");
    setFatGrams("");
    setFiberGrams("");
    setSodiumMilligrams("");
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader title="Food Database" />

      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon-sm" asChild className="size-8">
              <Link href="/dashboard/nutrition">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Food & Ingredient Database</h2>
              <p className="text-xs text-muted-foreground">
                Manage reusable food templates and reference accurate nutritional profiles.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            className="gap-1.5 shadow-sm"
            onClick={() => {
              resetForm();
              setCreateModalOpen(true);
            }}
          >
            <Plus className="size-3.5" />
            <span>Create Food Template</span>
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-card p-3 rounded-lg border border-border/80 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search food by name, brand, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={!onlyUser ? "secondary" : "outline"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setOnlyUser(false)}
            >
              All Foods
            </Button>
            <Button
              variant={onlyUser ? "secondary" : "outline"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setOnlyUser(true)}
            >
              My Custom Foods
            </Button>
          </div>
        </div>

        {/* Foods Grid / Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground text-sm gap-2">
            <Loader2 className="size-5 animate-spin" /> Loading food database...
          </div>
        ) : foods.length === 0 ? (
          <Card className="border-dashed border-border/80 text-center py-16">
            <CardContent className="space-y-3">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Apple className="size-6" />
              </div>
              <h3 className="font-semibold text-base">No food templates found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchQuery
                  ? "No results matched your search keyword. Try a different query or create this item."
                  : "Start creating reusable foods to quickly log them into your daily diary."}
              </p>
              <Button
                size="sm"
                onClick={() => {
                  resetForm();
                  setName(searchQuery);
                  setCreateModalOpen(true);
                }}
                className="mt-2"
              >
                <Plus className="size-3.5 mr-1" /> Add Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {foods.map((food) => (
              <Card
                key={food.id}
                className="border-border/80 bg-card hover:border-primary/40 transition-colors flex flex-col justify-between"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground">
                        {food.name}
                      </CardTitle>
                      {food.brand && (
                        <CardDescription className="text-xs text-muted-foreground">
                          {food.brand}
                        </CardDescription>
                      )}
                    </div>

                    <Badge variant="outline" className="font-mono text-xs shrink-0">
                      {food.calories} kcal
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Scale className="size-3 text-muted-foreground" />
                    <span>
                      Serving: {food.servingQuantity} {food.servingUnit}
                    </span>
                  </div>

                  {/* Macro Strip */}
                  <div className="grid grid-cols-4 gap-1 py-1.5 px-2 rounded-md bg-muted/40 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-muted-foreground font-medium">Protein</div>
                      <div className="font-bold text-foreground">{food.proteinGrams}g</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground font-medium">Carbs</div>
                      <div className="font-bold text-foreground">{food.carbohydrateGrams}g</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground font-medium">Fat</div>
                      <div className="font-bold text-foreground">{food.fatGrams}g</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground font-medium">Fiber</div>
                      <div className="font-bold text-foreground">{food.fiberGrams}g</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Sodium: {food.sodiumMilligrams}mg
                    </span>

                    {food.ownerId && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-muted-foreground hover:text-destructive size-6"
                        onClick={() => handleDeleteFood(food.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Food Template Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Food Template</DialogTitle>
            <DialogDescription>
              Save an ingredient or recipe to easily log in future meals.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Food Name *</label>
              <Input
                placeholder="e.g. Rolled Oats or Grilled Salmon"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Brand (optional)</label>
                <Input
                  placeholder="e.g. Quaker or Kirkland"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Barcode (optional)</label>
                <Input
                  placeholder="e.g. 012345678901"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Serving Size</label>
                <Input
                  type="number"
                  placeholder="1"
                  value={servingQuantity}
                  onChange={(e) => setServingQuantity(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Serving Unit</label>
                <Input
                  placeholder="e.g. cup, 100g, scoop"
                  value={servingUnit}
                  onChange={(e) => setServingUnit(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Calories (kcal) *</label>
                <Input
                  type="number"
                  placeholder="150"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Protein (g)</label>
                <Input
                  type="number"
                  placeholder="5"
                  value={proteinGrams}
                  onChange={(e) => setProteinGrams(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Carbohydrates (g)</label>
                <Input
                  type="number"
                  placeholder="27"
                  value={carbohydrateGrams}
                  onChange={(e) => setCarbohydrateGrams(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Fat (g)</label>
                <Input
                  type="number"
                  placeholder="3"
                  value={fatGrams}
                  onChange={(e) => setFatGrams(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Fiber (g)</label>
                <Input
                  type="number"
                  placeholder="4"
                  value={fiberGrams}
                  onChange={(e) => setFiberGrams(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Sodium (mg)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={sodiumMilligrams}
                  onChange={(e) => setSodiumMilligrams(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFood}>Save Food Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

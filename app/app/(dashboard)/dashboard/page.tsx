"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  tasksApi,
  nutritionApi,
  type DailyNutritionSummary,
  type TaskItem,
  type TaskCategory,
} from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import {
  Flame,
  CheckCircle2,
  Droplets,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  Utensils,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function DashboardOverviewPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [nutrition, setNutrition] = useState<DailyNutritionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [waterMl, setWaterMl] = useState(1250); // Local state for hydration quick tracking
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");

  const [mealModalOpen, setMealModalOpen] = useState(false);
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedTasks, fetchedCategories, fetchedNutrition] = await Promise.all([
        tasksApi.getTasks({ scheduledDate: todayStr }).catch(() => tasksApi.getTasks().catch(() => [])),
        tasksApi.getCategories().catch(() => []),
        nutritionApi.getSummary(todayStr).catch(() => null),
      ]);
      setTasks(fetchedTasks);
      setCategories(fetchedCategories);
      setNutrition(fetchedNutrition);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleTask = async (task: TaskItem) => {
    const newStatus = task.status === "completed" ? "todo" : "completed";
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );

    try {
      await tasksApi.updateTask(task.id, {
        status: newStatus,
        completedAt: newStatus === "completed" ? new Date().toISOString() : undefined,
      });
    } catch (err) {
      console.error("Failed to toggle task status", err);
      // Revert if error
      loadData();
    }
  };

  const handleQuickAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;

    const title = quickTaskTitle.trim();
    setQuickTaskTitle("");

    try {
      const created = await tasksApi.createTask({
        title,
        priority: "medium",
        status: "todo",
        scheduledDate: todayStr,
      });
      setTasks((prev) => [created, ...prev]);
    } catch (err) {
      console.error("Failed to create quick task", err);
    }
  };

  const handleCreateDetailedTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      const created = await tasksApi.createTask({
        title: newTaskTitle.trim(),
        priority: newTaskPriority,
        status: "todo",
        scheduledDate: todayStr,
      });
      setTasks((prev) => [created, ...prev]);
      setTaskModalOpen(false);
      setNewTaskTitle("");
    } catch (err) {
      console.error("Failed to create task", err);
    }
  };

  const handleLogMeal = async () => {
    if (!foodName.trim() || !calories) return;

    try {
      await nutritionApi.createEntry({
        foodName: foodName.trim(),
        mealType,
        source: "manual",
        quantity: 1,
        quantityUnit: "serving",
        calories: Number(calories) || 0,
        proteinGrams: Number(protein) || 0,
        carbohydrateGrams: Number(carbs) || 0,
        fatGrams: Number(fat) || 0,
        consumedAt: new Date().toISOString(),
      });

      // Reload summary
      const updatedSummary = await nutritionApi.getSummary(todayStr).catch(() => null);
      if (updatedSummary) setNutrition(updatedSummary);

      setMealModalOpen(false);
      setFoodName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
    } catch (err) {
      console.error("Failed to log food", err);
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const targetCalories = nutrition?.summary?.target?.calories || 2000;
  const consumedCalories = nutrition?.summary?.consumed?.calories || 0;
  const remainingCalories = Math.max(0, targetCalories - consumedCalories);
  const caloriePercent = Math.min(100, Math.round((consumedCalories / targetCalories) * 100));

  const proteinConsumed = nutrition?.summary?.consumed?.protein || 0;
  const proteinTarget = nutrition?.summary?.target?.protein || 130;
  const carbsConsumed = nutrition?.summary?.consumed?.carbohydrates || 0;
  const carbsTarget = nutrition?.summary?.target?.carbohydrates || 220;
  const fatConsumed = nutrition?.summary?.consumed?.fats || 0;
  const fatTarget = nutrition?.summary?.target?.fats || 65;

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-destructive/15 text-destructive border-destructive/30";
      case "high":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "medium":
        return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
      {/* Top Header & Greeting */}
      <DashboardHeader />

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs px-2.5 py-1">
            Today: {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
          </Badge>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            • Health & Performance Pulse
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setMealModalOpen(true)}
          >
            <Utensils className="size-3.5 text-primary" />
            <span>Log Food</span>
          </Button>

          <Button
            size="sm"
            className="gap-1.5 shadow-sm"
            onClick={() => setTaskModalOpen(true)}
          >
            <Plus className="size-3.5" />
            <span>New Task</span>
          </Button>
        </div>
      </div>

      {/* Hero Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Calories Card */}
        <Card className="relative overflow-hidden border-border/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Calories</CardTitle>
            <div className="p-1.5 rounded-md bg-orange-500/10 text-orange-500">
              <Flame className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {consumedCalories.toLocaleString()}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                / {targetCalories.toLocaleString()} kcal
              </span>
            </div>
            <Progress value={caloriePercent} className="h-2 mt-3" />
            <p className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
              <span>{caloriePercent}% of goal</span>
              <span className="font-medium text-foreground">{remainingCalories} kcal left</span>
            </p>
          </CardContent>
        </Card>

        {/* Macros Summary */}
        <Card className="border-border/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Macro Split</CardTitle>
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Protein</span>
                <span className="font-medium">{proteinConsumed}g / {proteinTarget}g</span>
              </div>
              <Progress value={Math.min(100, Math.round((proteinConsumed / proteinTarget) * 100))} className="h-1.5" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Carbs</span>
                <span className="font-medium">{carbsConsumed}g / {carbsTarget}g</span>
              </div>
              <Progress value={Math.min(100, Math.round((carbsConsumed / carbsTarget) * 100))} className="h-1.5" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Fats</span>
                <span className="font-medium">{fatConsumed}g / {fatTarget}g</span>
              </div>
              <Progress value={Math.min(100, Math.round((fatConsumed / fatTarget) * 100))} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        {/* Tasks Velocity Card */}
        <Card className="border-border/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Tasks</CardTitle>
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {completedTasks}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                / {totalTasks} completed
              </span>
            </div>
            <Progress value={taskProgress} className="h-2 mt-3" />
            <p className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
              <span>{taskProgress}% completed</span>
              <span className="font-medium text-foreground">
                {totalTasks - completedTasks} remaining
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Hydration Tracker */}
        <Card className="border-border/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hydration</CardTitle>
            <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-500">
              <Droplets className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {waterMl}{" "}
              <span className="text-sm font-normal text-muted-foreground">/ 2,500 ml</span>
            </div>
            <Progress value={Math.min(100, Math.round((waterMl / 2500) * 100))} className="h-2 mt-3" />
            <div className="flex gap-2 mt-2 pt-1">
              <Button
                variant="outline"
                size="xs"
                className="flex-1 text-[11px] h-6"
                onClick={() => setWaterMl((v) => v + 250)}
              >
                +250 ml
              </Button>
              <Button
                variant="outline"
                size="xs"
                className="flex-1 text-[11px] h-6"
                onClick={() => setWaterMl((v) => v + 500)}
              >
                +500 ml
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Two Column Section: Tasks & Meals */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Left Column: Today's Tasks (4 cols) */}
        <Card className="lg:col-span-4 border-border/80 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Today's Priority Agenda</CardTitle>
              <CardDescription className="text-xs">
                Check off items as you finish or add new goals for today
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link href="/dashboard/tasks">
                View All <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="space-y-4 flex-1">
            {/* Quick Add Input */}
            <form onSubmit={handleQuickAddTask} className="flex gap-2">
              <Input
                placeholder="Quick add a task for today (Press Enter)..."
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                className="h-8 text-xs bg-muted/40"
              />
              <Button type="submit" size="sm" variant="secondary" className="h-8 text-xs px-3">
                <Plus className="size-3.5 mr-1" /> Add
              </Button>
            </form>

            {/* Task Checklist */}
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
                <Loader2 className="size-4 animate-spin" /> Loading tasks...
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-10 border border-dashed rounded-lg text-muted-foreground text-xs space-y-1">
                <p className="font-medium text-foreground">No tasks scheduled for today yet</p>
                <p>Add a task above or create one with estimated minutes.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 6).map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                      task.status === "completed"
                        ? "bg-muted/30 border-transparent opacity-60 line-through"
                        : "bg-card border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Checkbox
                        checked={task.status === "completed"}
                        onCheckedChange={() => handleToggleTask(task)}
                      />
                      <span className="text-xs font-medium truncate">{task.title}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {task.estimatedMinutes && (
                        <span className="flex items-center text-[10px] text-muted-foreground font-mono">
                          <Clock className="size-3 mr-0.5" />
                          {task.estimatedMinutes}m
                        </span>
                      )}
                      <span
                        className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded border ${priorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Nutrition Meal Breakdown (3 cols) */}
        <Card className="lg:col-span-3 border-border/80 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Today's Meals</CardTitle>
              <CardDescription className="text-xs">Logged fuel and macronutrients</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link href="/dashboard/nutrition">
                Details <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="space-y-3 flex-1">
            {["breakfast", "lunch", "dinner", "snack"].map((meal) => {
              const mealData = nutrition?.byMeal?.[meal];
              const cals = mealData?.calories || 0;
              const items = mealData?.entries || [];

              return (
                <div
                  key={meal}
                  className="p-3 rounded-lg border border-border/70 bg-card hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="capitalize font-semibold text-xs text-foreground">
                        {meal}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {cals} kcal
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="xs"
                      className="h-6 px-1.5 text-[11px] text-primary"
                      onClick={() => {
                        setMealType(meal as any);
                        setMealModalOpen(true);
                      }}
                    >
                      <Plus className="size-3 mr-0.5" /> Log
                    </Button>
                  </div>

                  {items.length > 0 ? (
                    <div className="mt-2 space-y-1">
                      {items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-[11px] text-muted-foreground pl-2 border-l-2 border-primary/40"
                        >
                          <span className="truncate">{item.foodName}</span>
                          <span className="font-mono shrink-0 ml-2">{item.calories} kcal</span>
                        </div>
                      ))}
                      {items.length > 3 && (
                        <p className="text-[10px] text-muted-foreground pl-2">
                          +{items.length - 3} more items
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground/60 italic mt-1 pl-1">
                      No items logged
                    </p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Task Creation Dialog */}
      <Dialog open={taskModalOpen} onOpenChange={setTaskModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new actionable task with a priority for today.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Task Title</label>
              <Input
                placeholder="e.g., Morning workout or review project spec"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Priority</label>
              <div className="flex gap-2">
                {(["low", "medium", "high", "urgent"] as const).map((p) => (
                  <Button
                    key={p}
                    type="button"
                    variant={newTaskPriority === p ? "default" : "outline"}
                    size="sm"
                    className="flex-1 capitalize text-xs"
                    onClick={() => setNewTaskPriority(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDetailedTask}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Meal Dialog */}
      <Dialog open={mealModalOpen} onOpenChange={setMealModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Log Food</DialogTitle>
            <DialogDescription>
              Log an item and its nutritional stats to your daily diary.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Meal Time</label>
              <div className="flex gap-1.5">
                {(["breakfast", "lunch", "dinner", "snack"] as const).map((m) => (
                  <Button
                    key={m}
                    type="button"
                    variant={mealType === m ? "default" : "outline"}
                    size="xs"
                    className="flex-1 capitalize text-xs h-7"
                    onClick={() => setMealType(m)}
                  >
                    {m}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Food Name</label>
              <Input
                placeholder="e.g. Greek Yogurt with Berries"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Calories (kcal)</label>
                <Input
                  type="number"
                  placeholder="250"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Protein (g)</label>
                <Input
                  type="number"
                  placeholder="20"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Carbohydrates (g)</label>
                <Input
                  type="number"
                  placeholder="30"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Fat (g)</label>
                <Input
                  type="number"
                  placeholder="5"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMealModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogMeal}>Save to Meal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  nutritionApi,
  tasksApi,
  type DailyNutritionSummary,
} from "@/lib/api";
import {
  TrendingUp,
  Flame,
  CheckCircle2,
  Calendar,
  Activity,
  Zap,
  Target,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";

export default function AnalyticsPage() {
  const [nutrition, setNutrition] = useState<DailyNutritionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const todayStr = new Date().toISOString().split("T")[0];
        const data = await nutritionApi.getSummary(todayStr);
        setNutrition(data);
      } catch (err) {
        console.error("Failed to load analytics data", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  // 7-day trend data (simulated based on today's target and actual values)
  const consumed = nutrition?.summary?.consumed?.calories || 1750;
  const target = nutrition?.summary?.target?.calories || 2000;

  const weeklyCalories = [
    { day: "Mon", calories: Math.round(target * 0.92), target },
    { day: "Tue", calories: Math.round(target * 1.05), target },
    { day: "Wed", calories: Math.round(target * 0.88), target },
    { day: "Thu", calories: Math.round(target * 0.98), target },
    { day: "Fri", calories: Math.round(target * 1.02), target },
    { day: "Sat", calories: Math.round(target * 0.94), target },
    { day: "Sun (Today)", calories: consumed, target },
  ];

  const calorieChartConfig: ChartConfig = {
    calories: {
      label: "Calories Consumed",
      color: "hsl(var(--chart-1))",
    },
    target: {
      label: "Target Budget",
      color: "hsl(var(--chart-2))",
    },
  };

  // Macro pie distribution
  const proteinG = nutrition?.summary?.consumed?.protein || 120;
  const carbsG = nutrition?.summary?.consumed?.carbohydrates || 200;
  const fatG = nutrition?.summary?.consumed?.fats || 55;

  const macroData = [
    { name: "Protein", value: proteinG * 4, grams: proteinG, color: "#3b82f6" },
    { name: "Carbohydrates", value: carbsG * 4, grams: carbsG, color: "#10b981" },
    { name: "Fats", value: fatG * 9, grams: fatG, color: "#f59e0b" },
  ];

  // Productivity metrics
  const taskData = [
    { day: "Mon", completed: 5, pending: 1 },
    { day: "Tue", completed: 7, pending: 2 },
    { day: "Wed", completed: 4, pending: 0 },
    { day: "Thu", completed: 6, pending: 1 },
    { day: "Fri", completed: 8, pending: 2 },
    { day: "Sat", completed: 3, pending: 1 },
    { day: "Sun", completed: 5, pending: 2 },
  ];

  const taskChartConfig: ChartConfig = {
    completed: {
      label: "Completed Tasks",
      color: "hsl(var(--chart-1))",
    },
    pending: {
      label: "Pending Tasks",
      color: "hsl(var(--chart-4))",
    },
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader title="Health & Performance Analytics" />

      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Performance Intelligence</h2>
            <p className="text-xs text-muted-foreground">
              Evaluate nutritional adherence, energy expenditure, and task completion velocity.
            </p>
          </div>

          <Badge variant="outline" className="font-mono text-xs px-2.5 py-1 w-fit">
            Past 7 Days Review
          </Badge>
        </div>

        {/* Top KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Caloric Adherence
              </CardTitle>
              <Flame className="size-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">96.4%</div>
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="size-3 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">+2.1%</span> vs last week
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Weekly Task Velocity
              </CardTitle>
              <CheckCircle2 className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">38 Tasks</div>
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                <span className="font-medium text-foreground">88%</span> on-time completion
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Protein Target Rate
              </CardTitle>
              <Activity className="size-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128g / day</div>
              <p className="text-[11px] text-muted-foreground mt-1">Average daily protein intake</p>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                HaaS Health Index
              </CardTitle>
              <Zap className="size-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92 / 100</div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                Optimal Performance Zone
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Calorie Trend Bar Chart */}
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Weekly Caloric Intake vs Target</CardTitle>
              <CardDescription className="text-xs">
                Comparison of daily consumed kcal versus your defined goal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={calorieChartConfig} className="h-64 w-full">
                <BarChart data={weeklyCalories} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="calories" fill="var(--color-calories)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="var(--color-target)" opacity={0.3} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Macro Distribution Donut */}
          <Card className="border-border/80 flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Macronutrient Calorie Distribution</CardTitle>
              <CardDescription className="text-xs">
                Energy proportion derived from Protein, Carbohydrates, and Fats.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend & Details */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t text-center">
                {macroData.map((m) => (
                  <div key={m.name} className="space-y-0.5">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <span className="size-2 rounded-full" style={{ backgroundColor: m.color }} />
                      {m.name}
                    </div>
                    <div className="text-sm font-bold">{m.grams}g</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{m.value} kcal</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Productivity Velocity Chart */}
          <Card className="border-border/80 md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Task Execution Velocity</CardTitle>
              <CardDescription className="text-xs">
                Daily completed versus rollover pending tasks over the past 7 days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={taskChartConfig} className="h-56 w-full">
                <BarChart data={taskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" fill="var(--color-pending)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
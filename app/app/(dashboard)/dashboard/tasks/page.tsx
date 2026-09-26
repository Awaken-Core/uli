"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  tasksApi,
  type TaskItem,
  type TaskCategory,
} from "@/lib/api";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Clock,
  Tag,
  CheckCircle2,
  Trash2,
  Edit2,
  FolderPlus,
  Loader2,
  ArrowUpDown,
  CircleAlert,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Task Modal (Create & Edit)
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [status, setStatus] = useState<"todo" | "inProgress" | "completed" | "cancelled">("todo");
  const [categoryId, setCategoryId] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>("");

  // Category Modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("#3b82f6");

  const todayStr = new Date().toISOString().split("T")[0];

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedTasks, fetchedCategories] = await Promise.all([
        tasksApi.getTasks(),
        tasksApi.getCategories(),
      ]);
      setTasks(fetchedTasks);
      setCategories(fetchedCategories);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setPriority("medium");
    setStatus("todo");
    setCategoryId("");
    setScheduledDate(todayStr);
    setEstimatedMinutes("30");
    setTaskModalOpen(true);
  };

  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority);
    setStatus(task.status);
    setCategoryId(task.categoryId || "");
    setScheduledDate(task.scheduledDate || "");
    setEstimatedMinutes(task.estimatedMinutes ? String(task.estimatedMinutes) : "");
    setTaskModalOpen(true);
  };

  const handleSaveTask = async () => {
    if (!title.trim()) return;

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        categoryId: categoryId || undefined,
        scheduledDate: scheduledDate || undefined,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : undefined,
      };

      if (editingTask) {
        const updated = await tasksApi.updateTask(editingTask.id, payload);
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
      } else {
        const created = await tasksApi.createTask(payload);
        setTasks((prev) => [created, ...prev]);
      }

      setTaskModalOpen(false);
    } catch (err) {
      console.error("Failed to save task", err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await tasksApi.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const handleToggleTaskStatus = async (task: TaskItem) => {
    const nextStatus = task.status === "completed" ? "todo" : "completed";
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    try {
      await tasksApi.updateTask(task.id, {
        status: nextStatus,
        completedAt: nextStatus === "completed" ? new Date().toISOString() : undefined,
      });
    } catch (err) {
      console.error("Failed to update status", err);
      loadData();
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) return;

    try {
      const newCat = await tasksApi.createCategory({
        name: categoryName.trim(),
        color: categoryColor,
      });
      setCategories((prev) => [...prev, newCat]);
      setCategoryName("");
      setCategoryModalOpen(false);
    } catch (err) {
      console.error("Failed to create category", err);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    if (categoryFilter !== "all" && task.categoryId !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const priorityBadge = (p: string) => {
    switch (p) {
      case "urgent":
        return <Badge variant="destructive" className="text-[10px] uppercase">Urgent</Badge>;
      case "high":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] uppercase">High</Badge>;
      case "medium":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] uppercase">Medium</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px] uppercase">Low</Badge>;
    }
  };

  const colorPresets = ["#ef4444", "#f97316", "#eab308", "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader title="Tasks & Planner" />

      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
        {/* Actions & Summary Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Daily Habit & Task Flow</h2>
            <p className="text-xs text-muted-foreground">
              Manage your prioritized execution queue, categories, and time targets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setCategoryModalOpen(true)}
            >
              <FolderPlus className="size-3.5" />
              <span>Categories</span>
            </Button>

            <Button size="sm" className="gap-1.5 shadow-sm" onClick={openCreateModal}>
              <Plus className="size-3.5" />
              <span>New Task</span>
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card p-3 rounded-lg border border-border/80">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks by title or detail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Tabs */}
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs h-7">All</TabsTrigger>
                <TabsTrigger value="todo" className="text-xs h-7">Todo</TabsTrigger>
                <TabsTrigger value="inProgress" className="text-xs h-7">In Progress</TabsTrigger>
                <TabsTrigger value="completed" className="text-xs h-7">Completed</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Priority Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                  <Filter className="size-3" />
                  <span className="capitalize">
                    {priorityFilter === "all" ? "Priority" : priorityFilter}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs">Filter by Priority</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {["all", "urgent", "high", "medium", "low"].map((p) => (
                  <DropdownMenuItem key={p} onClick={() => setPriorityFilter(p)} className="capitalize text-xs">
                    {p}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Category Filter */}
            {categories.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                    <Tag className="size-3" />
                    <span>
                      {categoryFilter === "all"
                        ? "Category"
                        : categories.find((c) => c.id === categoryFilter)?.name || "Category"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="text-xs">Filter by Category</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCategoryFilter("all")} className="text-xs">
                    All Categories
                  </DropdownMenuItem>
                  {categories.map((c) => (
                    <DropdownMenuItem key={c.id} onClick={() => setCategoryFilter(c.id)} className="text-xs flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ backgroundColor: c.color || "#6b7280" }} />
                      {c.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-sm gap-2">
            <Loader2 className="size-5 animate-spin" /> Loading your tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <Card className="border-dashed border-border/80 text-center py-16">
            <CardContent className="space-y-3">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <CheckCircle2 className="size-6" />
              </div>
              <h3 className="font-semibold text-base">No tasks match your criteria</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Try clearing your search or status filters, or create a new task to get started.
              </p>
              <Button size="sm" onClick={openCreateModal} className="mt-2">
                <Plus className="size-3.5 mr-1" /> Create Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {filteredTasks.map((task) => {
              const cat = categories.find((c) => c.id === task.categoryId);

              return (
                <div
                  key={task.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border transition-all ${
                    task.status === "completed"
                      ? "bg-muted/20 border-border/50 opacity-70"
                      : "bg-card border-border hover:border-primary/40 shadow-xs"
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={task.status === "completed"}
                      onCheckedChange={() => handleToggleTaskStatus(task)}
                      className="mt-0.5 sm:mt-0"
                    />

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium truncate ${
                            task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </span>

                        {cat && (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border shrink-0"
                            style={{
                              borderColor: `${cat.color || "#6b7280"}40`,
                              backgroundColor: `${cat.color || "#6b7280"}15`,
                              color: cat.color || "#6b7280",
                            }}
                          >
                            <span className="size-1.5 rounded-full" style={{ backgroundColor: cat.color || "#6b7280" }} />
                            {cat.name}
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3 sm:mt-0 pl-7 sm:pl-0 shrink-0">
                    {task.scheduledDate && (
                      <span className="flex items-center text-xs text-muted-foreground font-mono">
                        <Calendar className="size-3 mr-1" />
                        {task.scheduledDate}
                      </span>
                    )}

                    {task.estimatedMinutes && (
                      <span className="flex items-center text-xs text-muted-foreground font-mono">
                        <Clock className="size-3 mr-1" />
                        {task.estimatedMinutes}m
                      </span>
                    )}

                    {priorityBadge(task.priority)}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="size-7">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(task)} className="text-xs">
                          <Edit2 className="size-3.5 mr-2" /> Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleTaskStatus(task)}
                          className="text-xs"
                        >
                          <CheckCircle2 className="size-3.5 mr-2" />
                          {task.status === "completed" ? "Mark Incomplete" : "Mark Complete"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-xs text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Task Dialog */}
      <Dialog open={taskModalOpen} onOpenChange={setTaskModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
            <DialogDescription>
              Specify task goals, priority, schedule, and category.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Task Title *</label>
              <Input
                placeholder="e.g. Complete 5km run or Finish Q3 sprint report"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Description</label>
              <Textarea
                placeholder="Optional notes or sub-steps..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Priority</label>
                <div className="flex gap-1">
                  {(["low", "medium", "high", "urgent"] as const).map((p) => (
                    <Button
                      key={p}
                      type="button"
                      variant={priority === p ? "default" : "outline"}
                      size="xs"
                      className="flex-1 capitalize text-[11px] h-7"
                      onClick={() => setPriority(p)}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Status</label>
                <div className="flex gap-1">
                  {(["todo", "inProgress", "completed"] as const).map((s) => (
                    <Button
                      key={s}
                      type="button"
                      variant={status === s ? "default" : "outline"}
                      size="xs"
                      className="flex-1 capitalize text-[11px] h-7"
                      onClick={() => setStatus(s)}
                    >
                      {s === "inProgress" ? "Prog" : s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-8 text-xs rounded-md border border-input bg-background px-2"
                >
                  <option value="">None</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Scheduled Date</label>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Estimated (min)</label>
                <Input
                  type="number"
                  placeholder="30"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTask}>
              {editingTask ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Creation Dialog */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Task Category</DialogTitle>
            <DialogDescription>
              Group tasks by domain (e.g. Fitness, Work, Health, Personal).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Category Name *</label>
              <Input
                placeholder="e.g. Workout, Nutrition, Work"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Color Accent</label>
              <div className="flex gap-2">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCategoryColor(color)}
                    className={`size-6 rounded-full border-2 transition-transform ${
                      categoryColor === color ? "scale-120 border-foreground" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory}>Save Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

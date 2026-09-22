import type { TaskPriority, TaskStatus, MealType, NutritionSource } from "./constants";

export interface TaskCategory {
  id: string;
  name: string;
  color?: string | null;
  icon?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskItem {
  id: string;
  userId: string;
  categoryId?: string | null;
  parentTaskId?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  scheduledDate?: string | null;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  dueAt?: string | null;
  estimatedMinutes?: number | null;
  actualMinutes?: number | null;
  sortOrder: number;
  recurrenceRule?: string | null;
  recurrenceTimeZone?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FoodItem {
  id: string;
  ownerId?: string | null;
  name: string;
  brand?: string | null;
  barcode?: string | null;
  servingQuantity: number;
  servingUnit: string;
  calories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
  saturatedFatGrams: number;
  fiberGrams: number;
  sugarGrams: number;
  sodiumMilligrams: number;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionEntry {
  id: string;
  userId: string;
  foodId?: string | null;
  foodName: string;
  mealType?: MealType | null;
  source: NutritionSource;
  quantity: number;
  quantityUnit: string;
  calories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
  saturatedFatGrams: number;
  fiberGrams: number;
  sugarGrams: number;
  sodiumMilligrams: number;
  notes?: string | null;
  consumedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionGoal {
  id: string;
  userId: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  calorieTarget?: number | null;
  proteinGramsTarget?: number | null;
  carbohydrateGramsTarget?: number | null;
  fatGramsTarget?: number | null;
  fiberGramsTarget?: number | null;
  sodiumMilligramsLimit?: number | null;
  waterMillilitersTarget?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyNutritionSummary {
  date: string;
  timezone: string;
  goal: NutritionGoal | null;
  summary: {
    consumed: {
      calories: number;
      protein: number;
      carbohydrates: number;
      fats: number;
      fiber: number;
      sugar: number;
      sodium: number;
    };
    target: {
      calories: number;
      protein: number;
      carbohydrates: number;
      fats: number;
      fiber: number;
      sodium: number;
      water: number;
    };
    remaining: {
      calories: number;
    };
    progress: {
      calories: number;
      protein: number;
      carbohydrates: number;
      fats: number;
    };
  };
  byMeal: Record<
    string,
    {
      calories: number;
      itemsCount: number;
      entries: NutritionEntry[];
    }
  >;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message =
      (errorData as { error?: string | { fieldErrors?: Record<string, string[]> } })?.error ||
      res.statusText ||
      "Request failed";
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return res.json();
}

export const tasksApi = {
  getTasks: (params?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    categoryId?: string;
    scheduledDate?: string;
    parentTaskId?: string;
  }) => {
    const search = new URLSearchParams();
    if (params?.status) search.set("status", params.status);
    if (params?.priority) search.set("priority", params.priority);
    if (params?.categoryId) search.set("categoryId", params.categoryId);
    if (params?.scheduledDate) search.set("scheduledDate", params.scheduledDate);
    if (params?.parentTaskId) search.set("parentTaskId", params.parentTaskId);
    const qs = search.toString();
    return request<TaskItem[]>(`/api/tasks${qs ? `?${qs}` : ""}`);
  },

  createTask: (data: Partial<TaskItem> & { title: string }) => {
    const payload = {
      ...data,
      categoryId: data.categoryId || undefined,
      parentTaskId: data.parentTaskId || undefined,
      scheduledDate: data.scheduledDate || undefined,
    };
    return request<TaskItem>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateTask: (id: string, data: Partial<TaskItem>) => {
    const payload = {
      ...data,
      categoryId: data.categoryId === "" ? undefined : data.categoryId,
      parentTaskId: data.parentTaskId === "" ? undefined : data.parentTaskId,
    };
    return request<TaskItem>(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteTask: (id: string) => {
    return request<{ success: boolean }>(`/api/tasks/${id}`, {
      method: "DELETE",
    });
  },

  getCategories: () => {
    return request<TaskCategory[]>("/api/tasks/categories");
  },

  createCategory: (data: { name: string; color?: string; icon?: string }) => {
    return request<TaskCategory>("/api/tasks/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  deleteCategory: (id: string) => {
    return request<{ success: boolean }>(`/api/tasks/categories/${id}`, {
      method: "DELETE",
    });
  },
};

export const nutritionApi = {
  getSummary: (date?: string, timezone?: string) => {
    const search = new URLSearchParams();
    if (date) search.set("date", date);
    if (timezone) search.set("timezone", timezone);
    const qs = search.toString();
    return request<DailyNutritionSummary>(`/api/nutrition/summary${qs ? `?${qs}` : ""}`);
  },

  getEntries: (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    mealType?: MealType;
    timezone?: string;
  }) => {
    const search = new URLSearchParams();
    if (params?.date) search.set("date", params.date);
    if (params?.startDate) search.set("startDate", params.startDate);
    if (params?.endDate) search.set("endDate", params.endDate);
    if (params?.mealType) search.set("mealType", params.mealType);
    if (params?.timezone) search.set("timezone", params.timezone);
    const qs = search.toString();
    return request<NutritionEntry[]>(`/api/nutrition/entries${qs ? `?${qs}` : ""}`);
  },

  createEntry: (data: Partial<NutritionEntry> & { quantity: number }) => {
    const payload = {
      ...data,
      foodId: data.foodId || undefined,
      notes: data.notes || undefined,
    };
    return request<NutritionEntry>("/api/nutrition/entries", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateEntry: (id: string, data: Partial<NutritionEntry>) => {
    const payload = {
      ...data,
      foodId: data.foodId === "" ? undefined : data.foodId,
    };
    return request<NutritionEntry>(`/api/nutrition/entries/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteEntry: (id: string) => {
    return request<{ success: boolean }>(`/api/nutrition/entries/${id}`, {
      method: "DELETE",
    });
  },
};

export const foodsApi = {
  getFoods: (params?: { search?: string; barcode?: string; onlyUser?: boolean }) => {
    const search = new URLSearchParams();
    if (params?.search) search.set("search", params.search);
    if (params?.barcode) search.set("barcode", params.barcode);
    if (params?.onlyUser) search.set("onlyUser", "true");
    const qs = search.toString();
    return request<FoodItem[]>(`/api/nutrition/foods${qs ? `?${qs}` : ""}`);
  },

  createFood: (data: Omit<FoodItem, "id" | "ownerId" | "createdAt" | "updatedAt">) => {
    const payload = {
      ...data,
      brand: data.brand?.trim() || undefined,
      barcode: data.barcode?.trim() || undefined,
    };
    return request<FoodItem>("/api/nutrition/foods", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  deleteFood: (id: string) => {
    return request<{ success: boolean }>(`/api/nutrition/foods/${id}`, {
      method: "DELETE",
    });
  },
};

export const goalsApi = {
  getGoals: async (date?: string, timezone?: string) => {
    const search = new URLSearchParams();
    if (date) search.set("date", date);
    if (timezone) search.set("timezone", timezone);
    const qs = search.toString();
    const res = await request<NutritionGoal | NutritionGoal[] | null>(
      `/api/nutrition/goals${qs ? `?${qs}` : ""}`
    );
    if (Array.isArray(res)) {
      return res[0] ?? null;
    }
    return res;
  },

  createGoal: (data: {
    effectiveFrom: string;
    effectiveTo?: string;
    calorieTarget?: number;
    proteinGramsTarget?: number;
    carbohydrateGramsTarget?: number;
    fatGramsTarget?: number;
    fiberGramsTarget?: number;
    sodiumMilligramsLimit?: number;
    waterMillilitersTarget?: number;
  }) => {
    const payload = {
      ...data,
      effectiveTo: data.effectiveTo?.trim() || undefined,
    };
    return request<NutritionGoal>("/api/nutrition/goals", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateGoal: (id: string, data: Partial<NutritionGoal>) => {
    return request<NutritionGoal>(`/api/nutrition/goals/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

import { create } from "zustand";

import {
  foodsApi,
  goalsApi,
  nutritionApi,
  type DailyNutritionSummary,
  type FoodItem,
  type NutritionEntry,
} from "@/lib/api";
import type { MealType } from "@/lib/constants";
import {
  dateAtLocalNoon,
  getDeviceTimeZone,
  getLocalDateKey,
} from "@/lib/date";

type ManualEntry = Pick<
  NutritionEntry,
  "foodName" | "calories" | "proteinGrams" | "carbohydrateGrams" | "fatGrams"
> & { mealType: MealType; quantityUnit?: string };

type NutritionState = {
  selectedDate: string;
  summary: DailyNutritionSummary | null;
  foods: FoodItem[];
  isLoading: boolean;
  isMutating: boolean;
  isSearching: boolean;
  error: string | null;
  setSelectedDate: (date: string) => void;
  loadSummary: (date?: string) => Promise<void>;
  searchFoods: (query: string) => Promise<void>;
  loadFoods: () => Promise<void>;
  createFood: (
    food: Omit<FoodItem, "id" | "ownerId" | "createdAt" | "updatedAt">,
  ) => Promise<boolean>;
  deleteFood: (id: string) => Promise<void>;
  saveGoal: (input: {
    calorieTarget: number;
    proteinGramsTarget: number;
    carbohydrateGramsTarget: number;
    fatGramsTarget: number;
    fiberGramsTarget: number;
    sodiumMilligramsLimit: number;
    waterMillilitersTarget: number;
  }) => Promise<boolean>;
  addManualEntry: (entry: ManualEntry) => Promise<boolean>;
  addSavedFood: (
    food: FoodItem,
    mealType: MealType,
    quantity?: number,
  ) => Promise<boolean>;
  deleteEntry: (id: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
};

const initialState = {
  selectedDate: getLocalDateKey(),
  summary: null,
  foods: [],
  isLoading: false,
  isMutating: false,
  isSearching: false,
  error: null,
};

function messageFrom(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export const useNutritionStore = create<NutritionState>((set, get) => ({
  ...initialState,
  setSelectedDate: (selectedDate) => {
    set({ selectedDate });
    void get().loadSummary(selectedDate);
  },
  loadSummary: async (date = get().selectedDate) => {
    set({ isLoading: true, error: null });
    try {
      const summary = await nutritionApi.getSummary(date, getDeviceTimeZone());
      if (get().selectedDate === date) set({ summary });
    } catch (error) {
      set({ error: messageFrom(error) });
    } finally {
      set({ isLoading: false });
    }
  },
  searchFoods: async (query) => {
    if (!query.trim()) {
      set({ foods: [], isSearching: false });
      return;
    }
    set({ isSearching: true, error: null });
    try {
      set({ foods: await foodsApi.getFoods({ search: query.trim() }) });
    } catch (error) {
      set({ error: messageFrom(error), foods: [] });
    } finally {
      set({ isSearching: false });
    }
  },
  loadFoods: async () => {
    set({ isSearching: true, error: null });
    try {
      set({ foods: await foodsApi.getFoods({ onlyUser: true }) });
    } catch (error) {
      set({ error: messageFrom(error) });
    } finally {
      set({ isSearching: false });
    }
  },
  createFood: async (food) => {
    set({ isMutating: true, error: null });
    try {
      const created = await foodsApi.createFood(food);
      set({ foods: [created, ...get().foods] });
      return true;
    } catch (error) {
      set({ error: messageFrom(error) });
      return false;
    } finally {
      set({ isMutating: false });
    }
  },
  deleteFood: async (id) => {
    set({ isMutating: true, error: null });
    try {
      await foodsApi.deleteFood(id);
      set({ foods: get().foods.filter((food) => food.id !== id) });
    } catch (error) {
      set({ error: messageFrom(error) });
    } finally {
      set({ isMutating: false });
    }
  },
  saveGoal: async (input) => {
    set({ isMutating: true, error: null });
    try {
      const current = get().summary?.goal;
      if (current) {
        await goalsApi.updateGoal(current.id, input);
      } else {
        await goalsApi.createGoal({
          ...input,
          effectiveFrom: getLocalDateKey(),
        });
      }
      await get().loadSummary();
      return true;
    } catch (error) {
      set({ error: messageFrom(error) });
      return false;
    } finally {
      set({ isMutating: false });
    }
  },
  addManualEntry: async (entry) => {
    set({ isMutating: true, error: null });
    try {
      await nutritionApi.createEntry({
        ...entry,
        source: "manual",
        quantity: 1,
        quantityUnit: entry.quantityUnit || "serving",
        consumedAt: dateAtLocalNoon(get().selectedDate),
      });
      await get().loadSummary();
      return true;
    } catch (error) {
      set({ error: messageFrom(error) });
      return false;
    } finally {
      set({ isMutating: false });
    }
  },
  addSavedFood: async (food, mealType, quantity = 1) => {
    set({ isMutating: true, error: null });
    try {
      await nutritionApi.createEntry({
        foodId: food.id,
        foodName: food.name,
        mealType,
        source: "savedFood",
        quantity,
        quantityUnit: food.servingUnit,
        consumedAt: dateAtLocalNoon(get().selectedDate),
      });
      await get().loadSummary();
      return true;
    } catch (error) {
      set({ error: messageFrom(error) });
      return false;
    } finally {
      set({ isMutating: false });
    }
  },
  deleteEntry: async (id) => {
    set({ isMutating: true, error: null });
    try {
      await nutritionApi.deleteEntry(id);
      await get().loadSummary();
    } catch (error) {
      set({ error: messageFrom(error) });
    } finally {
      set({ isMutating: false });
    }
  },
  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));

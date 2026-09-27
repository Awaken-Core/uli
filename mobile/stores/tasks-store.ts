import { create } from "zustand";

import { tasksApi, type TaskCategory, type TaskItem } from "@/lib/api";

type TaskState = {
  tasks: TaskItem[];
  categories: TaskCategory[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  load: () => Promise<void>;
  createTask: (
    input: Partial<TaskItem> & { title: string },
  ) => Promise<boolean>;
  updateTask: (id: string, input: Partial<TaskItem>) => Promise<boolean>;
  toggleTask: (task: TaskItem) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  createCategory: (input: { name: string; color?: string }) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
};

const messageFrom = (error: unknown) =>
  error instanceof Error ? error.message : "Unable to update tasks.";

export const useTasksStore = create<TaskState>((set, get) => ({
  tasks: [],
  categories: [],
  isLoading: false,
  isMutating: false,
  error: null,
  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const [tasks, categories] = await Promise.all([
        tasksApi.getTasks(),
        tasksApi.getCategories(),
      ]);
      set({ tasks, categories });
    } catch (error) {
      set({ error: messageFrom(error) });
    } finally {
      set({ isLoading: false });
    }
  },
  createTask: async (input) => {
    set({ isMutating: true, error: null });
    try {
      const task = await tasksApi.createTask(input);
      set({ tasks: [task, ...get().tasks], error: null });
      return true;
    } catch (error) {
      set({ error: messageFrom(error) });
      return false;
    } finally {
      set({ isMutating: false });
    }
  },
  updateTask: async (id, input) => {
    set({ isMutating: true, error: null });
    try {
      const task = await tasksApi.updateTask(id, input);
      set({ tasks: get().tasks.map((item) => (item.id === id ? task : item)) });
      return true;
    } catch (error) {
      set({ error: messageFrom(error) });
      return false;
    } finally {
      set({ isMutating: false });
    }
  },
  toggleTask: async (task) => {
    const status = task.status === "completed" ? "todo" : "completed";
    const previous = get().tasks;
    set({
      tasks: previous.map((item) =>
        item.id === task.id ? { ...item, status } : item,
      ),
      error: null,
    });
    try {
      const updated = await tasksApi.updateTask(task.id, {
        status,
        completedAt:
          status === "completed" ? new Date().toISOString() : undefined,
      });
      set({
        tasks: get().tasks.map((item) =>
          item.id === task.id ? updated : item,
        ),
      });
    } catch (error) {
      set({ tasks: previous, error: messageFrom(error) });
    }
  },
  deleteTask: async (id) => {
    set({ isMutating: true });
    try {
      await tasksApi.deleteTask(id);
      set({ tasks: get().tasks.filter((task) => task.id !== id), error: null });
    } catch (error) {
      set({ error: messageFrom(error) });
    } finally {
      set({ isMutating: false });
    }
  },
  createCategory: async (input) => {
    set({ isMutating: true, error: null });
    try {
      const category = await tasksApi.createCategory(input);
      set({ categories: [...get().categories, category] });
      return true;
    } catch (error) {
      set({ error: messageFrom(error) });
      return false;
    } finally {
      set({ isMutating: false });
    }
  },
  deleteCategory: async (id) => {
    set({ isMutating: true, error: null });
    try {
      await tasksApi.deleteCategory(id);
      set({
        categories: get().categories.filter((category) => category.id !== id),
      });
    } catch (error) {
      set({ error: messageFrom(error) });
    } finally {
      set({ isMutating: false });
    }
  },
  clearError: () => set({ error: null }),
  reset: () =>
    set({
      tasks: [],
      categories: [],
      isLoading: false,
      isMutating: false,
      error: null,
    }),
}));

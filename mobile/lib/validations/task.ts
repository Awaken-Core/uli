import { z } from "zod";
import { TASK_PRIORITY, TASK_STATUS } from "@/lib/constants";

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  parentTaskId: z.string().uuid().optional(),
  status: z.nativeEnum(TASK_STATUS).optional(),
  priority: z.nativeEnum(TASK_PRIORITY).optional(),
  scheduledDate: z.string().optional(), // YYYY-MM-DD
  scheduledStartAt: z.string().datetime().optional(),
  scheduledEndAt: z.string().datetime().optional(),
  dueAt: z.string().datetime().optional(),
  estimatedMinutes: z.number().int().nonnegative().optional(),
  recurrenceRule: z.string().optional(),
  recurrenceTimeZone: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  actualMinutes: z.number().int().nonnegative().optional(),
  completedAt: z.string().datetime().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const taskQuerySchema = z.object({
  status: z.nativeEnum(TASK_STATUS).optional(),
  priority: z.nativeEnum(TASK_PRIORITY).optional(),
  categoryId: z.string().uuid().optional(),
  scheduledDate: z.string().optional(),
  parentTaskId: z.string().uuid().optional(),
});

// user roles
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

export type UserRoles =
  (typeof USER_ROLES)[keyof typeof USER_ROLES];

// payment status
export const PAYMENT_STATUS = {
    FAILED: "failed",
    SUCCESS: "success",
    PENDING: "pending"
} as const;

export type PaymentStatus = 
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

// task status
export const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "inProgress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type TaskStatus =
  (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

// task priority
export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export type TaskPriority =
  (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];

// meal type
export const MEAL_TYPE = {
  BREAKFAST: "breakfast",
  LUNCH: "lunch",
  DINNER: "dinner",
  SNACK: "snack",
} as const;

export type MealType =
  (typeof MEAL_TYPE)[keyof typeof MEAL_TYPE];

// nutrition source
export const NUTRITION_SOURCE = {
  MANUAL: "manual",
  SAVED_FOOD: "savedFood",
  BARCODE: "barcode",
  AI: "ai",
} as const;

export type NutritionSource =
  (typeof NUTRITION_SOURCE)[keyof typeof NUTRITION_SOURCE];

import { relations } from "drizzle-orm/_relations";
import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  check,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./user";
import type { TaskPriority, TaskStatus } from "@/lib/constants";

export const taskCategories = pgTable(
  "taskCategory",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color"), // hex
    icon: text("icon"),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("task_category_user_name_uidx").on(table.userId, table.name),
  ],
);

export const tasks = pgTable(
  "task",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    categoryId: uuid("categoryId").references(() => taskCategories.id, {
      onDelete: "set null",
    }),
    parentTaskId: uuid("parentTaskId").references(
      (): AnyPgColumn => tasks.id,
      { onDelete: "cascade" },
    ),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").$type<TaskStatus>().default("todo").notNull(),
    priority: text("priority")
      .$type<TaskPriority>()
      .default("medium")
      .notNull(),
    scheduledDate: date("scheduledDate", { mode: "string" }),
    scheduledStartAt: timestamp("scheduledStartAt", { withTimezone: true }),
    scheduledEndAt: timestamp("scheduledEndAt", { withTimezone: true }),
    dueAt: timestamp("dueAt", { withTimezone: true }),
    estimatedMinutes: integer("estimatedMinutes"),
    actualMinutes: integer("actualMinutes"),
    sortOrder: integer("sortOrder").default(0).notNull(),
    recurrenceRule: text("recurrenceRule"),
    recurrenceTimeZone: text("recurrenceTimeZone"),
    completedAt: timestamp("completedAt", { withTimezone: true }),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("task_user_status_idx").on(table.userId, table.status),
    index("task_user_scheduled_date_idx").on(table.userId, table.scheduledDate),
    index("task_user_due_at_idx").on(table.userId, table.dueAt),
    index("task_category_id_idx").on(table.categoryId),
    index("task_parent_id_idx").on(table.parentTaskId),
    check(
      "task_schedule_range_check",
      sql`${table.scheduledEndAt} is null or ${table.scheduledStartAt} is null or ${table.scheduledEndAt} >= ${table.scheduledStartAt}`,
    ),
    check(
      "task_duration_nonnegative_check",
      sql`(${table.estimatedMinutes} is null or ${table.estimatedMinutes} >= 0) and (${table.actualMinutes} is null or ${table.actualMinutes} >= 0)`,
    ),
  ],
);

export const taskCategoryRelations = relations(taskCategories, ({ one, many }) => ({
  user: one(user, {
    fields: [taskCategories.userId],
    references: [user.id],
  }),
  tasks: many(tasks),
}));

export const taskRelations = relations(tasks, ({ one, many }) => ({
  user: one(user, {
    fields: [tasks.userId],
    references: [user.id],
  }),
  category: one(taskCategories, {
    fields: [tasks.categoryId],
    references: [taskCategories.id],
  }),
  parent: one(tasks, {
    fields: [tasks.parentTaskId],
    references: [tasks.id],
    relationName: "taskHierarchy",
  }),
  subtasks: many(tasks, { relationName: "taskHierarchy" }),
}));

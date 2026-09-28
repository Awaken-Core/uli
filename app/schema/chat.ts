import { relations } from "drizzle-orm/_relations";
import { index, jsonb, numeric, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { foods, nutritionEntries, nutritionGoals } from "./nutritions";
import { tasks } from "./tasks";
import { user } from "./user";

export const ChatRole = pgEnum("chat_role", ["user", "agent", "system"]);

export const conversation = pgTable("conversation", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
}, (table) => [index("conversation_user_id_idx").on(table.userId)]);

export const chats = pgTable("chat", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
    conversationId: uuid("conversationId").notNull().references(() => conversation.id, { onDelete: "cascade" }),
    taskId: uuid("taskId").references(() => tasks.id, { onDelete: "set null" }),
    nutritionId: uuid("nutritionId").references(() => nutritionEntries.id, { onDelete: "set null" }),
    foodId: uuid("foodId").references(() => foods.id, { onDelete: "set null" }),
    nutritionGoalId: uuid("nutritionGoalId").references(() => nutritionGoals.id, { onDelete: "set null" }),
    token: numeric("token", { precision: 10, scale: 2, mode: "number" }),
    price: numeric("price", { precision: 10, scale: 2, mode: "number" }),
    message: text("message").notNull(),
    role: ChatRole("role").notNull(),
    metaData: jsonb("metaData"),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
    index("chat_user_id_idx").on(table.userId),
    index("chat_conversation_id_idx").on(table.conversationId),
    index("chat_task_id_idx").on(table.taskId),
    index("chat_nutrition_id_idx").on(table.nutritionId),
    index("chat_food_id_idx").on(table.foodId),
    index("chat_nutrition_goal_id_idx").on(table.nutritionGoalId),
]);

export const conversationRelations = relations(conversation, ({ one, many }) => ({
    user: one(user, { fields: [conversation.userId], references: [user.id] }),
    chats: many(chats),
}));

export const chatRelations = relations(chats, ({ one }) => ({
    user: one(user, { fields: [chats.userId], references: [user.id] }),
    conversation: one(conversation, { fields: [chats.conversationId], references: [conversation.id] }),
    task: one(tasks, { fields: [chats.taskId], references: [tasks.id] }),
    nutritionEntry: one(nutritionEntries, { fields: [chats.nutritionId], references: [nutritionEntries.id] }),
    food: one(foods, { fields: [chats.foodId], references: [foods.id] }),
    nutritionGoal: one(nutritionGoals, { fields: [chats.nutritionGoalId], references: [nutritionGoals.id] }),
}));

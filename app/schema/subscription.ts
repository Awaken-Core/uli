import { relations } from "drizzle-orm/_relations";
import { pgTable, text, timestamp, boolean, integer, numeric } from "drizzle-orm/pg-core";
import { user } from "./user";

export const subscription = pgTable("subscription", {
    id: text("id").primaryKey(),
    price: numeric("price", { precision: 10, scale: 2, mode: "number" }).notNull(),
    totalDuration: integer("totalDuration").default(30),
    benefits: text("benefits").array().default([]),
    nonBenefits: text("nonBenefits").array().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const userSubscriptions = pgTable("userSubscription", {
    id: text("id").primaryKey(),
    isActive: boolean("isActive").default(true),
    subscriptionId: text("subscriptionId")
        .notNull()
        .references(() => subscription.id),
    userId: text("userId")
        .notNull()
        .references(() => user.id),
    startDate: timestamp("startDate", { withTimezone: true }),
    endDate: timestamp("endDate", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const subscriptionRelation = relations(subscription, ({ many }) => ({
    userSubscriptions: many(userSubscriptions),
}));

export const userSubscriptionRelation = relations(userSubscriptions, ({ one }) => ({
    subscription: one(subscription, {
        fields: [userSubscriptions.subscriptionId],
        references: [subscription.id],
    }),
    user: one(user, {
        fields: [userSubscriptions.userId],
        references: [user.id],
    }),
}));

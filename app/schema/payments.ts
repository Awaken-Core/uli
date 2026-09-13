import {
    pgTable,
    text,
    uuid,
    jsonb,
    boolean,
    timestamp,
    numeric,
    index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { user } from "./user";
import { subscription } from "./subscription";
import { PaymentStatus } from "@/lib/constants";

export const payment = pgTable(
    "payment",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: text("userId")
            .notNull()
            .references(() => user.id, { onDelete: "no action" }),
        dodoPaymentId: text("dodoPaymentId").unique(),
        amount: numeric("amount", {
            precision: 10,
            scale: 2,
            mode: "number",
        }).notNull(),
        currency: text("currency").default("USD").notNull(),
        status: text("status").$type<PaymentStatus>().default("pending").notNull(),
        createdAt: timestamp("createdAt", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),

        updatedAt: timestamp("updatedAt", {
            withTimezone: true,
        })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("payment_user_id_idx").on(table.userId),
    ],
);

export const paymentTransaction = pgTable("paymentTransaction", {
    id: uuid("id").defaultRandom().primaryKey(),
    paymentId: uuid("paymentId")
        .notNull()
        .unique()
        .references(() => payment.id, { onDelete: "cascade" }),
    subscriptionId: text("subscriptionId")
        .notNull()
        .references(() => subscription.id, { onDelete: "no action" }),
    createdAt: timestamp("createdAt", {
        withTimezone: true,
    })
        .defaultNow()
        .notNull(),
}, (table) => [
    index("payment_transaction_subscription_id_idx").on(table.subscriptionId),
]);

export const dodoWebhookEvent = pgTable("dodoWebhookEvent", {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: text("eventId").notNull().unique(),
    eventType: text("eventType").notNull(),
    payload: jsonb("payload").notNull(),
    processed: boolean("processed").default(false).notNull(),
    createdAt: timestamp("createdAt", {
        withTimezone: true,
    })
        .defaultNow()
        .notNull(),
});

export const paymentRelations = relations(payment, ({ one }) => ({
    user: one(user, {
        fields: [payment.userId],
        references: [user.id],
    }),
    transaction: one(paymentTransaction),
}));

export const paymentTransactionRelations = relations(paymentTransaction, ({ one }) => ({
    payment: one(payment, {
        fields: [paymentTransaction.paymentId],
        references: [payment.id],
    }),
    subscription: one(subscription, {
        fields: [paymentTransaction.subscriptionId],
        references: [subscription.id],
    }),
}));

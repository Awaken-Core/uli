CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"isPremium" boolean DEFAULT false,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" text NOT NULL,
	"message" text,
	"isRead" boolean DEFAULT false,
	"url" text,
	"userId" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" text PRIMARY KEY,
	"price" numeric(10,2) NOT NULL,
	"totalDuration" integer DEFAULT 30,
	"benefits" text[] DEFAULT '{}'::text[],
	"nonBenefits" text[] DEFAULT '{}'::text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userSubscription" (
	"id" text PRIMARY KEY,
	"isActive" boolean DEFAULT true,
	"subscriptionId" text NOT NULL,
	"userId" text NOT NULL,
	"startDate" timestamp with time zone,
	"endDate" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dodoWebhookEvent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"eventId" text NOT NULL UNIQUE,
	"eventType" text NOT NULL,
	"payload" jsonb NOT NULL,
	"processed" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"userId" text NOT NULL,
	"dodoPaymentId" text UNIQUE,
	"amount" numeric(10,2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paymentTransaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"paymentId" uuid NOT NULL UNIQUE,
	"subscriptionId" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taskCategory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"color" text,
	"icon" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"userId" text NOT NULL,
	"categoryId" uuid,
	"parentTaskId" uuid,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'todo' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"scheduledDate" date,
	"scheduledStartAt" timestamp with time zone,
	"scheduledEndAt" timestamp with time zone,
	"dueAt" timestamp with time zone,
	"estimatedMinutes" integer,
	"actualMinutes" integer,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"recurrenceRule" text,
	"recurrenceTimeZone" text,
	"completedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "task_schedule_range_check" CHECK ("scheduledEndAt" is null or "scheduledStartAt" is null or "scheduledEndAt" >= "scheduledStartAt"),
	CONSTRAINT "task_duration_nonnegative_check" CHECK (("estimatedMinutes" is null or "estimatedMinutes" >= 0) and ("actualMinutes" is null or "actualMinutes" >= 0))
);
--> statement-breakpoint
CREATE TABLE "food" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"ownerId" text,
	"name" text NOT NULL,
	"brand" text,
	"barcode" text UNIQUE,
	"servingQuantity" numeric(10,2) DEFAULT '1' NOT NULL,
	"servingUnit" text DEFAULT 'serving' NOT NULL,
	"calories" numeric(10,2) DEFAULT '0' NOT NULL,
	"proteinGrams" numeric(10,2) DEFAULT '0' NOT NULL,
	"carbohydrateGrams" numeric(10,2) DEFAULT '0' NOT NULL,
	"fatGrams" numeric(10,2) DEFAULT '0' NOT NULL,
	"saturatedFatGrams" numeric(10,2) DEFAULT '0' NOT NULL,
	"fiberGrams" numeric(10,2) DEFAULT '0' NOT NULL,
	"sugarGrams" numeric(10,2) DEFAULT '0' NOT NULL,
	"sodiumMilligrams" numeric(10,2) DEFAULT '0' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "food_nutrition_nonnegative_check" CHECK ("servingQuantity" > 0 and "calories" >= 0 and "proteinGrams" >= 0 and "carbohydrateGrams" >= 0 and "fatGrams" >= 0 and "saturatedFatGrams" >= 0 and "fiberGrams" >= 0 and "sugarGrams" >= 0 and "sodiumMilligrams" >= 0)
);
--> statement-breakpoint
CREATE TABLE "nutritionEntry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"userId" text NOT NULL,
	"foodId" uuid,
	"foodName" text NOT NULL,
	"mealType" text,
	"source" text DEFAULT 'manual' NOT NULL,
	"quantity" numeric(10,2) DEFAULT '1' NOT NULL,
	"quantityUnit" text DEFAULT 'serving' NOT NULL,
	"calories" numeric(10,2) DEFAULT '0' NOT NULL,
	"proteinGrams" numeric(10,2) DEFAULT '0' NOT NULL,
	"carbohydrateGrams" numeric(10,2) DEFAULT '0' NOT NULL,
	"fatGrams" numeric(10,2) DEFAULT '0' NOT NULL,
	"saturatedFatGrams" numeric(10,2) DEFAULT '0' NOT NULL,
	"fiberGrams" numeric(10,2) DEFAULT '0' NOT NULL,
	"sugarGrams" numeric(10,2) DEFAULT '0' NOT NULL,
	"sodiumMilligrams" numeric(10,2) DEFAULT '0' NOT NULL,
	"notes" text,
	"consumedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "nutrition_entry_values_check" CHECK ("quantity" > 0 and "calories" >= 0 and "proteinGrams" >= 0 and "carbohydrateGrams" >= 0 and "fatGrams" >= 0 and "saturatedFatGrams" >= 0 and "fiberGrams" >= 0 and "sugarGrams" >= 0 and "sodiumMilligrams" >= 0)
);
--> statement-breakpoint
CREATE TABLE "nutritionGoal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"userId" text NOT NULL,
	"effectiveFrom" date NOT NULL,
	"effectiveTo" date,
	"calorieTarget" numeric(10,2),
	"proteinGramsTarget" numeric(10,2),
	"carbohydrateGramsTarget" numeric(10,2),
	"fatGramsTarget" numeric(10,2),
	"fiberGramsTarget" numeric(10,2),
	"sodiumMilligramsLimit" numeric(10,2),
	"waterMillilitersTarget" numeric(10,2),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "nutrition_goal_date_range_check" CHECK ("effectiveTo" is null or "effectiveTo" >= "effectiveFrom"),
	CONSTRAINT "nutrition_goal_values_nonnegative_check" CHECK (("calorieTarget" is null or "calorieTarget" >= 0) and ("proteinGramsTarget" is null or "proteinGramsTarget" >= 0) and ("carbohydrateGramsTarget" is null or "carbohydrateGramsTarget" >= 0) and ("fatGramsTarget" is null or "fatGramsTarget" >= 0) and ("fiberGramsTarget" is null or "fiberGramsTarget" >= 0) and ("sodiumMilligramsLimit" is null or "sodiumMilligramsLimit" >= 0) and ("waterMillilitersTarget" is null or "waterMillilitersTarget" >= 0))
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
CREATE INDEX "notification_userId_idx" ON "notification" ("userId");--> statement-breakpoint
CREATE INDEX "payment_user_id_idx" ON "payment" ("userId");--> statement-breakpoint
CREATE INDEX "payment_transaction_subscription_id_idx" ON "paymentTransaction" ("subscriptionId");--> statement-breakpoint
CREATE UNIQUE INDEX "task_category_user_name_uidx" ON "taskCategory" ("userId","name");--> statement-breakpoint
CREATE INDEX "task_user_status_idx" ON "task" ("userId","status");--> statement-breakpoint
CREATE INDEX "task_user_scheduled_date_idx" ON "task" ("userId","scheduledDate");--> statement-breakpoint
CREATE INDEX "task_user_due_at_idx" ON "task" ("userId","dueAt");--> statement-breakpoint
CREATE INDEX "task_category_id_idx" ON "task" ("categoryId");--> statement-breakpoint
CREATE INDEX "task_parent_id_idx" ON "task" ("parentTaskId");--> statement-breakpoint
CREATE INDEX "food_owner_id_idx" ON "food" ("ownerId");--> statement-breakpoint
CREATE INDEX "food_name_idx" ON "food" ("name");--> statement-breakpoint
CREATE INDEX "nutrition_entry_user_consumed_at_idx" ON "nutritionEntry" ("userId","consumedAt");--> statement-breakpoint
CREATE INDEX "nutrition_entry_food_id_idx" ON "nutritionEntry" ("foodId");--> statement-breakpoint
CREATE UNIQUE INDEX "nutrition_goal_user_effective_from_uidx" ON "nutritionGoal" ("userId","effectiveFrom");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "userSubscription" ADD CONSTRAINT "userSubscription_subscriptionId_subscription_id_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id");--> statement-breakpoint
ALTER TABLE "userSubscription" ADD CONSTRAINT "userSubscription_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "paymentTransaction" ADD CONSTRAINT "paymentTransaction_paymentId_payment_id_fkey" FOREIGN KEY ("paymentId") REFERENCES "payment"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "paymentTransaction" ADD CONSTRAINT "paymentTransaction_subscriptionId_subscription_id_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id");--> statement-breakpoint
ALTER TABLE "taskCategory" ADD CONSTRAINT "taskCategory_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_categoryId_taskCategory_id_fkey" FOREIGN KEY ("categoryId") REFERENCES "taskCategory"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_parentTaskId_task_id_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "task"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "food" ADD CONSTRAINT "food_ownerId_user_id_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "nutritionEntry" ADD CONSTRAINT "nutritionEntry_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "nutritionEntry" ADD CONSTRAINT "nutritionEntry_foodId_food_id_fkey" FOREIGN KEY ("foodId") REFERENCES "food"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "nutritionGoal" ADD CONSTRAINT "nutritionGoal_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;
import { pgTable, uuid, text, timestamp, integer, jsonb, numeric, boolean } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(), // Privy DID
  xp: integer("xp").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const gamificationLogs = pgTable("gamification_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: text("profile_id").references(() => profiles.id).notNull(),
  points: integer("points").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const personals = pgTable("personals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => profiles.id).notNull(),
  slug: text("slug").unique().notNull(), // URL amigável para White Label
  brandName: text("brand_name").notNull(),
  primaryColor: text("primary_color").default("#000000"),
  bio: text("bio"),
  trainingPhilosophy: text("training_philosophy"), // Protocolo de treino do personal
  gamificationRules: jsonb("gamification_rules"), // Regras de gamificação
  evaluationMetrics: jsonb("evaluation_metrics"), // Métricas de avaliação

  // Stripe Integration
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default("inactive"), // active, trialing, past_due, canceled, inactive

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const athletes = pgTable("athletes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => profiles.id).notNull(),
  personalId: uuid("personal_id").references(() => personals.id),
  vGradeLevel: text("v_grade_level"),
  frenchGradeLevel: text("french_grade_level"),
  equipmentAccess: jsonb("equipment_access"),
  physicalStats: jsonb("physical_stats"),
  isActive: integer("is_active").default(1).notNull(), // 1 para ativo (faturável), 0 para inativo
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const anamnesis = pgTable("anamnesis", {
  id: uuid("id").primaryKey().defaultRandom(),
  athleteId: uuid("athlete_id").references(() => athletes.id).notNull(),
  medicalRestrictions: text("medical_restrictions"),
  goals: text("goals"),
  anthropometricData: jsonb("anthropometric_data"), // peso, altura, % gordura, etc.
  lifestyleInfo: jsonb("lifestyle_info"), // sono, fumante, nivel de atividade
  consentTermsSigned: boolean("consent_terms_signed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const trainingPackages = pgTable("training_packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  personalId: uuid("personal_id").references(() => personals.id).notNull(),
  name: text("name").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  features: jsonb("features"),
});

export const scheduleSlots = pgTable("schedule_slots", {
  id: uuid("id").primaryKey().defaultRandom(),
  personalId: uuid("personal_id").references(() => personals.id).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  maxCapacity: integer("max_capacity").default(1).notNull(),
  location: text("location"),
});

export const checkins = pgTable("checkins", {
  id: uuid("id").primaryKey().defaultRandom(),
  athleteId: uuid("athlete_id").references(() => athletes.id).notNull(),
  slotId: uuid("slot_id").references(() => scheduleSlots.id).notNull(),
  status: text("status").default("scheduled").notNull(),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trainingPlans = pgTable("training_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  athleteId: uuid("athlete_id").references(() => athletes.id).notNull(),
  personalId: uuid("personal_id").references(() => personals.id).notNull(),
  status: text("status").notNull().default("draft"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  aiRationale: text("ai_rationale"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workoutSessions = pgTable("workout_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  planId: uuid("plan_id").references(() => trainingPlans.id).notNull(),
  name: text("name").notNull(),
  order: integer("order").notNull(),
});

export const workoutExercises = pgTable("workout_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => workoutSessions.id).notNull(),
  exerciseId: text("exercise_id").notNull(), // ID do documento no Sanity
  order: integer("order").notNull(),
  sets: integer("sets"),
  reps: text("reps"),
  load: text("load"),
  notes: text("notes"),
});

export const workoutLogs = pgTable("workout_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  athleteId: uuid("athlete_id").references(() => athletes.id).notNull(),
  sessionId: uuid("session_id").references(() => workoutSessions.id).notNull(),
  rpe: integer("rpe"),
  feeling: text("feeling"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

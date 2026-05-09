import { pgTable, uuid, text, timestamp, integer, jsonb, numeric } from "drizzle-orm/pg-core";

export const personals = pgTable("personals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  brandName: text("brand_name").notNull(),
  primaryColor: text("primary_color").default("#000000"),
  bio: text("bio"),
  trainingPhilosophy: text("training_philosophy"), // Protocolo de treino do personal
  gamificationRules: jsonb("gamification_rules"), // Regras de gamificação
  evaluationMetrics: jsonb("evaluation_metrics"), // Métricas de avaliação
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const athletes = pgTable("athletes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  personalId: uuid("personal_id").references(() => personals.id),
  vGradeLevel: text("v_grade_level"),
  frenchGradeLevel: text("french_grade_level"),
  equipmentAccess: jsonb("equipment_access"),
  physicalStats: jsonb("physical_stats"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  exercises: jsonb("exercises"),
});

export const workoutLogs = pgTable("workout_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  athleteId: uuid("athlete_id").references(() => athletes.id).notNull(),
  sessionId: uuid("session_id").references(() => workoutSessions.id).notNull(),
  rpe: integer("rpe"),
  feeling: text("feeling"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

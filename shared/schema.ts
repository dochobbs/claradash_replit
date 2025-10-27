import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const reviewDecisionEnum = pgEnum("review_decision", [
  "agree",
  "agree_with_thoughts",
  "disagree",
  "needs_escalation",
]);

// Patients (parents)
export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Children
export const children = pgTable("children", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  name: text("name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  medicalRecordNumber: text("medical_record_number").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI Interactions
export const aiInteractions = pgTable("ai_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").notNull().references(() => children.id),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  parentConcern: text("parent_concern").notNull(),
  aiResponse: text("ai_response").notNull(),
  conversationContext: text("conversation_context"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Provider Reviews
export const providerReviews = pgTable("provider_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  interactionId: varchar("interaction_id").notNull().references(() => aiInteractions.id),
  providerName: text("provider_name").notNull(),
  reviewDecision: reviewDecisionEnum("review_decision").notNull(),
  providerNotes: text("provider_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const patientsRelations = relations(patients, ({ many }) => ({
  children: many(children),
  aiInteractions: many(aiInteractions),
}));

export const childrenRelations = relations(children, ({ one, many }) => ({
  patient: one(patients, {
    fields: [children.patientId],
    references: [patients.id],
  }),
  aiInteractions: many(aiInteractions),
}));

export const aiInteractionsRelations = relations(aiInteractions, ({ one, many }) => ({
  child: one(children, {
    fields: [aiInteractions.childId],
    references: [children.id],
  }),
  patient: one(patients, {
    fields: [aiInteractions.patientId],
    references: [patients.id],
  }),
  reviews: many(providerReviews),
}));

export const providerReviewsRelations = relations(providerReviews, ({ one }) => ({
  interaction: one(aiInteractions, {
    fields: [providerReviews.interactionId],
    references: [aiInteractions.id],
  }),
}));

// Insert Schemas
export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
});

export const insertChildSchema = createInsertSchema(children).omit({
  id: true,
  createdAt: true,
});

export const insertAiInteractionSchema = createInsertSchema(aiInteractions).omit({
  id: true,
  createdAt: true,
});

export const insertProviderReviewSchema = createInsertSchema(providerReviews).omit({
  id: true,
  createdAt: true,
});

// Types
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Child = typeof children.$inferSelect;
export type InsertChild = z.infer<typeof insertChildSchema>;

export type AiInteraction = typeof aiInteractions.$inferSelect;
export type InsertAiInteraction = z.infer<typeof insertAiInteractionSchema>;

export type ProviderReview = typeof providerReviews.$inferSelect;
export type InsertProviderReview = z.infer<typeof insertProviderReviewSchema>;

// Extended types for joined queries
export type ChildWithPatient = Child & {
  patient: Patient;
};

export type AiInteractionWithDetails = AiInteraction & {
  child: Child;
  patient: Patient;
  reviews: ProviderReview[];
};

export type PatientWithChildren = Patient & {
  children: Child[];
};

import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, pgEnum, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const reviewDecisionEnum = pgEnum("review_decision", [
  "agree",
  "agree_with_thoughts",
  "disagree",
  "needs_escalation",
]);

export const urgencyLevelEnum = pgEnum("urgency_level", [
  "routine",
  "moderate",
  "urgent",
  "critical",
]);

export const escalationStatusEnum = pgEnum("escalation_status", [
  "pending",
  "texting",
  "phone_call",
  "video_call",
  "resolved",
]);

// Patients (parents)
export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  preferredPharmacy: text("preferred_pharmacy"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Children
export const children = pgTable("children", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  name: text("name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  medicalRecordNumber: text("medical_record_number").notNull().unique(),
  currentWeight: decimal("current_weight", { precision: 10, scale: 2 }), // in pounds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI Interactions
export const aiInteractions = pgTable("ai_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").notNull().references(() => children.id),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  parentConcern: text("parent_concern").notNull(),
  aiResponse: text("ai_response").notNull(),
  aiSummary: text("ai_summary"), // Clara's clinical summary
  urgencyLevel: urgencyLevelEnum("urgency_level").default("routine"),
  claraRecommendations: text("clara_recommendations"),
  conversationContext: text("conversation_context"),
  queuedAt: timestamp("queued_at").defaultNow().notNull(), // When entered queue
  reviewedAt: timestamp("reviewed_at"), // When provider reviewed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Provider Reviews
export const providerReviews = pgTable("provider_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  interactionId: varchar("interaction_id").notNull().references(() => aiInteractions.id),
  providerName: text("provider_name").notNull(),
  reviewDecision: reviewDecisionEnum("review_decision").notNull(),
  providerNotes: text("provider_notes"),
  icd10Code: varchar("icd10_code"), // Diagnosis code for data analysis
  snomedCode: varchar("snomed_code"), // Alternative clinical coding
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Medications
export const medications = pgTable("medications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").notNull().references(() => children.id),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Allergies
export const allergies = pgTable("allergies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").notNull().references(() => children.id),
  allergen: text("allergen").notNull(),
  reaction: text("reaction").notNull(),
  severity: text("severity"), // mild, moderate, severe
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Problem List
export const problemList = pgTable("problem_list", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").notNull().references(() => children.id),
  condition: text("condition").notNull(),
  icd10Code: varchar("icd10_code"),
  status: text("status").default("active"), // active, resolved, chronic
  onsetDate: text("onset_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Escalations
export const escalations = pgTable("escalations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  interactionId: varchar("interaction_id").notNull().references(() => aiInteractions.id),
  initiatedBy: text("initiated_by").notNull(), // 'parent', 'provider', 'clara'
  status: escalationStatusEnum("status").default("pending"),
  severity: urgencyLevelEnum("severity").default("moderate"),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

// Messages for escalations
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  escalationId: varchar("escalation_id").notNull().references(() => escalations.id),
  senderId: varchar("sender_id").notNull(), // patient_id or provider_id
  senderType: text("sender_type").notNull(), // 'parent' or 'provider'
  content: text("content").notNull(),
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
  medications: many(medications),
  allergies: many(allergies),
  problemList: many(problemList),
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
  escalations: many(escalations),
}));

export const providerReviewsRelations = relations(providerReviews, ({ one }) => ({
  interaction: one(aiInteractions, {
    fields: [providerReviews.interactionId],
    references: [aiInteractions.id],
  }),
}));

export const medicationsRelations = relations(medications, ({ one }) => ({
  child: one(children, {
    fields: [medications.childId],
    references: [children.id],
  }),
}));

export const allergiesRelations = relations(allergies, ({ one }) => ({
  child: one(children, {
    fields: [allergies.childId],
    references: [children.id],
  }),
}));

export const problemListRelations = relations(problemList, ({ one }) => ({
  child: one(children, {
    fields: [problemList.childId],
    references: [children.id],
  }),
}));

export const escalationsRelations = relations(escalations, ({ one, many }) => ({
  interaction: one(aiInteractions, {
    fields: [escalations.interactionId],
    references: [aiInteractions.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  escalation: one(escalations, {
    fields: [messages.escalationId],
    references: [escalations.id],
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

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  createdAt: true,
});

export const insertAllergySchema = createInsertSchema(allergies).omit({
  id: true,
  createdAt: true,
});

export const insertProblemListSchema = createInsertSchema(problemList).omit({
  id: true,
  createdAt: true,
});

export const insertEscalationSchema = createInsertSchema(escalations).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
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

export type Medication = typeof medications.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;

export type Allergy = typeof allergies.$inferSelect;
export type InsertAllergy = z.infer<typeof insertAllergySchema>;

export type ProblemListItem = typeof problemList.$inferSelect;
export type InsertProblemListItem = z.infer<typeof insertProblemListSchema>;

export type Escalation = typeof escalations.$inferSelect;
export type InsertEscalation = z.infer<typeof insertEscalationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Extended types for joined queries
export type ChildWithPatient = Child & {
  patient: Patient;
};

export type AiInteractionWithDetails = AiInteraction & {
  child: Child;
  patient: Patient;
  reviews: ProviderReview[];
  escalations?: Escalation[];
};

export type ChildWithMedicalData = Child & {
  medications?: Medication[];
  allergies?: Allergy[];
  problemList?: ProblemListItem[];
};

export type EscalationWithMessages = Escalation & {
  messages: Message[];
  interaction: AiInteraction;
};

export type PatientWithChildren = Patient & {
  children: Child[];
};

// Referenced from javascript_database blueprint
import { 
  patients, 
  children, 
  aiInteractions, 
  providerReviews,
  medications,
  allergies,
  problemList,
  escalations,
  messages,
  type Patient, 
  type InsertPatient,
  type Child,
  type InsertChild,
  type AiInteraction,
  type InsertAiInteraction,
  type ProviderReview,
  type InsertProviderReview,
  type PatientWithChildren,
  type AiInteractionWithDetails,
  type Medication,
  type Allergy,
  type ProblemListItem,
  type Escalation,
  type InsertEscalation,
  type Message,
  type InsertMessage,
  type EscalationWithMessages,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Patients
  getPatient(id: string): Promise<Patient | undefined>;
  getPatientWithChildren(id: string): Promise<PatientWithChildren | undefined>;
  getAllPatientsWithChildren(): Promise<PatientWithChildren[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;

  // Children
  getChild(id: string): Promise<Child | undefined>;
  getChildrenByPatient(patientId: string): Promise<Child[]>;
  createChild(child: InsertChild): Promise<Child>;

  // AI Interactions
  getAiInteraction(id: string): Promise<AiInteraction | undefined>;
  getAiInteractionWithDetails(id: string): Promise<AiInteractionWithDetails | undefined>;
  getAllAiInteractionsWithDetails(): Promise<AiInteractionWithDetails[]>;
  getAiInteractionsByPatient(patientId: string): Promise<AiInteractionWithDetails[]>;
  getRecentAiInteractions(limit: number): Promise<AiInteractionWithDetails[]>;
  createAiInteraction(interaction: InsertAiInteraction): Promise<AiInteraction>;

  // Provider Reviews
  getProviderReview(id: string): Promise<ProviderReview | undefined>;
  getReviewsByInteraction(interactionId: string): Promise<ProviderReview[]>;
  createProviderReview(review: InsertProviderReview): Promise<ProviderReview>;

  // Medical Data
  getMedicationsByChild(childId: string): Promise<Medication[]>;
  getAllergiesByChild(childId: string): Promise<Allergy[]>;
  getProblemListByChild(childId: string): Promise<ProblemListItem[]>;
  getChildMedicalData(childId: string): Promise<{
    medications: Medication[];
    allergies: Allergy[];
    problemList: ProblemListItem[];
  }>;

  // Escalations and Messages
  getAllEscalationsWithDetails(): Promise<EscalationWithMessages[]>;
  getEscalation(id: string): Promise<Escalation | undefined>;
  createEscalation(escalation: InsertEscalation): Promise<Escalation>;
  updateEscalation(id: string, data: Partial<Escalation>): Promise<Escalation>;
  getMessagesByEscalation(escalationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  // Patients
  async getPatient(id: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async getPatientWithChildren(id: string): Promise<PatientWithChildren | undefined> {
    const patient = await this.getPatient(id);
    if (!patient) return undefined;

    const childrenList = await this.getChildrenByPatient(id);
    return { ...patient, children: childrenList };
  }

  async getAllPatientsWithChildren(): Promise<PatientWithChildren[]> {
    const allPatients = await db.select().from(patients);
    
    const patientsWithChildren = await Promise.all(
      allPatients.map(async (patient) => {
        const childrenList = await this.getChildrenByPatient(patient.id);
        return { ...patient, children: childrenList };
      })
    );

    return patientsWithChildren;
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await db
      .insert(patients)
      .values(insertPatient)
      .returning();
    return patient;
  }

  // Children
  async getChild(id: string): Promise<Child | undefined> {
    const [child] = await db.select().from(children).where(eq(children.id, id));
    return child || undefined;
  }

  async getChildrenByPatient(patientId: string): Promise<Child[]> {
    return await db.select().from(children).where(eq(children.patientId, patientId));
  }

  async createChild(insertChild: InsertChild): Promise<Child> {
    const [child] = await db
      .insert(children)
      .values(insertChild)
      .returning();
    return child;
  }

  // AI Interactions
  async getAiInteraction(id: string): Promise<AiInteraction | undefined> {
    const [interaction] = await db.select().from(aiInteractions).where(eq(aiInteractions.id, id));
    return interaction || undefined;
  }

  async getAiInteractionWithDetails(id: string): Promise<AiInteractionWithDetails | undefined> {
    const interaction = await this.getAiInteraction(id);
    if (!interaction) return undefined;

    const child = await this.getChild(interaction.childId);
    const patient = await this.getPatient(interaction.patientId);
    const reviews = await this.getReviewsByInteraction(interaction.id);

    if (!child || !patient) return undefined;

    return { ...interaction, child, patient, reviews };
  }

  async getAllAiInteractionsWithDetails(): Promise<AiInteractionWithDetails[]> {
    const allInteractions = await db
      .select()
      .from(aiInteractions)
      .orderBy(desc(aiInteractions.createdAt));

    const interactionsWithDetails = await Promise.all(
      allInteractions.map(async (interaction) => {
        const child = await this.getChild(interaction.childId);
        const patient = await this.getPatient(interaction.patientId);
        const reviews = await this.getReviewsByInteraction(interaction.id);

        if (!child || !patient) {
          throw new Error(`Missing child or patient for interaction ${interaction.id}`);
        }

        return { ...interaction, child, patient, reviews };
      })
    );

    return interactionsWithDetails;
  }

  async getAiInteractionsByPatient(patientId: string): Promise<AiInteractionWithDetails[]> {
    const patientInteractions = await db
      .select()
      .from(aiInteractions)
      .where(eq(aiInteractions.patientId, patientId))
      .orderBy(desc(aiInteractions.createdAt));

    const interactionsWithDetails = await Promise.all(
      patientInteractions.map(async (interaction) => {
        const child = await this.getChild(interaction.childId);
        const patient = await this.getPatient(interaction.patientId);
        const reviews = await this.getReviewsByInteraction(interaction.id);

        if (!child || !patient) {
          throw new Error(`Missing child or patient for interaction ${interaction.id}`);
        }

        return { ...interaction, child, patient, reviews };
      })
    );

    return interactionsWithDetails;
  }

  async getRecentAiInteractions(limit: number): Promise<AiInteractionWithDetails[]> {
    const recentInteractions = await db
      .select()
      .from(aiInteractions)
      .orderBy(desc(aiInteractions.createdAt))
      .limit(limit);

    const interactionsWithDetails = await Promise.all(
      recentInteractions.map(async (interaction) => {
        const child = await this.getChild(interaction.childId);
        const patient = await this.getPatient(interaction.patientId);
        const reviews = await this.getReviewsByInteraction(interaction.id);

        if (!child || !patient) {
          throw new Error(`Missing child or patient for interaction ${interaction.id}`);
        }

        return { ...interaction, child, patient, reviews };
      })
    );

    return interactionsWithDetails;
  }

  async createAiInteraction(insertInteraction: InsertAiInteraction): Promise<AiInteraction> {
    const [interaction] = await db
      .insert(aiInteractions)
      .values(insertInteraction)
      .returning();
    return interaction;
  }

  // Provider Reviews
  async getProviderReview(id: string): Promise<ProviderReview | undefined> {
    const [review] = await db.select().from(providerReviews).where(eq(providerReviews.id, id));
    return review || undefined;
  }

  async getReviewsByInteraction(interactionId: string): Promise<ProviderReview[]> {
    return await db
      .select()
      .from(providerReviews)
      .where(eq(providerReviews.interactionId, interactionId))
      .orderBy(desc(providerReviews.createdAt));
  }

  async createProviderReview(insertReview: InsertProviderReview): Promise<ProviderReview> {
    const [review] = await db
      .insert(providerReviews)
      .values(insertReview)
      .returning();
    return review;
  }

  // Medical Data
  async getMedicationsByChild(childId: string): Promise<Medication[]> {
    return await db
      .select()
      .from(medications)
      .where(eq(medications.childId, childId))
      .orderBy(desc(medications.createdAt));
  }

  async getAllergiesByChild(childId: string): Promise<Allergy[]> {
    return await db
      .select()
      .from(allergies)
      .where(eq(allergies.childId, childId))
      .orderBy(desc(allergies.createdAt));
  }

  async getProblemListByChild(childId: string): Promise<ProblemListItem[]> {
    return await db
      .select()
      .from(problemList)
      .where(eq(problemList.childId, childId))
      .orderBy(desc(problemList.createdAt));
  }

  async getChildMedicalData(childId: string): Promise<{
    medications: Medication[];
    allergies: Allergy[];
    problemList: ProblemListItem[];
  }> {
    const [meds, allergyList, problems] = await Promise.all([
      this.getMedicationsByChild(childId),
      this.getAllergiesByChild(childId),
      this.getProblemListByChild(childId),
    ]);

    return {
      medications: meds,
      allergies: allergyList,
      problemList: problems,
    };
  }

  // Escalations and Messages
  async getEscalation(id: string): Promise<Escalation | undefined> {
    const [escalation] = await db
      .select()
      .from(escalations)
      .where(eq(escalations.id, id));
    return escalation || undefined;
  }

  async getAllEscalationsWithDetails(): Promise<EscalationWithMessages[]> {
    const allEscalations = await db
      .select()
      .from(escalations)
      .orderBy(desc(escalations.createdAt));

    const escalationsWithDetails = await Promise.all(
      allEscalations.map(async (escalation) => {
        const interaction = await this.getAiInteractionWithDetails(escalation.interactionId);
        const messageList = await this.getMessagesByEscalation(escalation.id);
        
        if (!interaction) {
          throw new Error(`Missing interaction for escalation ${escalation.id}`);
        }

        return {
          ...escalation,
          messages: messageList,
          interaction,
        };
      })
    );

    return escalationsWithDetails;
  }

  async createEscalation(insertEscalation: InsertEscalation): Promise<Escalation> {
    const [escalation] = await db
      .insert(escalations)
      .values(insertEscalation)
      .returning();
    return escalation;
  }

  async updateEscalation(id: string, data: Partial<Escalation>): Promise<Escalation> {
    const [updated] = await db
      .update(escalations)
      .set(data)
      .where(eq(escalations.id, id))
      .returning();
    return updated;
  }

  async getMessagesByEscalation(escalationId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.escalationId, escalationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }
}

export const storage = new DatabaseStorage();

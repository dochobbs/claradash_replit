import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPatientSchema, 
  insertChildSchema, 
  insertAiInteractionSchema, 
  insertProviderReviewSchema,
  insertMessageSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Stats endpoint
  app.get("/api/stats", async (_req, res) => {
    try {
      const allInteractions = await storage.getAllAiInteractionsWithDetails();
      const allPatients = await storage.getAllPatientsWithChildren();

      const reviewsPending = allInteractions.filter(
        (interaction) => interaction.reviews.length === 0
      ).length;

      const escalations = allInteractions.filter((interaction) =>
        interaction.reviews.some((review) => review.reviewDecision === "needs_escalation")
      ).length;

      const activePatients = allPatients.length;

      // Calculate average response time (simplified - time between interaction and first review)
      const reviewedInteractions = allInteractions.filter(
        (interaction) => interaction.reviews.length > 0
      );
      
      let avgResponseTime = "N/A";
      if (reviewedInteractions.length > 0) {
        const totalMinutes = reviewedInteractions.reduce((sum, interaction) => {
          const interactionTime = new Date(interaction.createdAt).getTime();
          const reviewTime = new Date(interaction.reviews[0].createdAt).getTime();
          const diffMinutes = (reviewTime - interactionTime) / (1000 * 60);
          return sum + diffMinutes;
        }, 0);
        
        const avgMinutes = totalMinutes / reviewedInteractions.length;
        if (avgMinutes < 60) {
          avgResponseTime = `${Math.round(avgMinutes)}m`;
        } else {
          avgResponseTime = `${Math.round(avgMinutes / 60)}h`;
        }
      }

      // Count agrees and disagrees from all reviews
      const allReviews = allInteractions.flatMap((interaction) => interaction.reviews);
      const agreesCount = allReviews.filter(
        (review) => review.reviewDecision === "agree" || review.reviewDecision === "agree_with_thoughts"
      ).length;
      const disagreesCount = allReviews.filter(
        (review) => review.reviewDecision === "disagree"
      ).length;

      res.json({
        reviewsPending,
        escalations,
        activePatients,
        avgResponseTime,
        agreesCount,
        disagreesCount,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Badge counts endpoint for sidebar
  app.get("/api/stats/badges", async (_req, res) => {
    try {
      const allInteractions = await storage.getAllAiInteractionsWithDetails();
      const allMessages = await storage.getAllMessages();

      const reviewsPending = allInteractions.filter(
        (interaction) => interaction.reviews.length === 0
      ).length;

      const escalationsActive = allInteractions.filter((interaction) =>
        interaction.reviews.some((review) => review.reviewDecision === "needs_escalation")
      ).length;

      // Count unread messages (messages from parents that haven't been replied to)
      const messagesUnread = allMessages.filter((message) => 
        message.senderRole === "parent" && !message.isRead
      ).length;

      res.json({
        reviewsPending,
        escalationsActive,
        messagesUnread,
      });
    } catch (error) {
      console.error("Error fetching badge counts:", error);
      res.status(500).json({ error: "Failed to fetch badge counts" });
    }
  });

  // Patients endpoints
  app.get("/api/patients", async (_req, res) => {
    try {
      const patients = await storage.getAllPatientsWithChildren();
      
      // Enrich with stats
      const patientsWithStats = await Promise.all(
        patients.map(async (patient) => {
          const interactions = await storage.getAiInteractionsByPatient(patient.id);
          
          const lastReview = interactions
            .flatMap((i) => i.reviews)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

          const hasEscalation = interactions.some((i) =>
            i.reviews.some((r) => r.reviewDecision === "needs_escalation")
          );
          
          const hasPendingReview = interactions.some((i) => i.reviews.length === 0);

          let status: "active" | "review_pending" | "escalated" = "active";
          if (hasEscalation) status = "escalated";
          else if (hasPendingReview) status = "review_pending";

          return {
            ...patient,
            interactionCount: interactions.length,
            lastReviewDate: lastReview?.createdAt,
            status,
          };
        })
      );

      res.json(patientsWithStats);
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({ error: "Failed to fetch patients" });
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    try {
      const patient = await storage.getPatientWithChildren(req.params.id);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      console.error("Error fetching patient:", error);
      res.status(500).json({ error: "Failed to fetch patient" });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const validatedData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(validatedData);
      res.status(201).json(patient);
    } catch (error) {
      console.error("Error creating patient:", error);
      res.status(400).json({ error: "Invalid patient data" });
    }
  });

  // Children endpoints
  app.post("/api/children", async (req, res) => {
    try {
      const validatedData = insertChildSchema.parse(req.body);
      const child = await storage.createChild(validatedData);
      res.status(201).json(child);
    } catch (error) {
      console.error("Error creating child:", error);
      res.status(400).json({ error: "Invalid child data" });
    }
  });

  // Get child medical data
  app.get("/api/children/:id/medical", async (req, res) => {
    try {
      const medicalData = await storage.getChildMedicalData(req.params.id);
      res.json(medicalData);
    } catch (error) {
      console.error("Error fetching child medical data:", error);
      res.status(500).json({ error: "Failed to fetch medical data" });
    }
  });

  // AI Interactions endpoints
  app.get("/api/interactions", async (_req, res) => {
    try {
      const interactions = await storage.getAllAiInteractionsWithDetails();
      res.json(interactions);
    } catch (error) {
      console.error("Error fetching interactions:", error);
      res.status(500).json({ error: "Failed to fetch interactions" });
    }
  });

  app.get("/api/interactions/recent", async (_req, res) => {
    try {
      const interactions = await storage.getRecentAiInteractions(10);
      res.json(interactions);
    } catch (error) {
      console.error("Error fetching recent interactions:", error);
      res.status(500).json({ error: "Failed to fetch recent interactions" });
    }
  });

  app.get("/api/interactions/:patientId", async (req, res) => {
    try {
      const interactions = await storage.getAiInteractionsByPatient(req.params.patientId);
      res.json(interactions);
    } catch (error) {
      console.error("Error fetching patient interactions:", error);
      res.status(500).json({ error: "Failed to fetch patient interactions" });
    }
  });

  app.post("/api/interactions", async (req, res) => {
    try {
      const validatedData = insertAiInteractionSchema.parse(req.body);
      const interaction = await storage.createAiInteraction(validatedData);
      res.status(201).json(interaction);
    } catch (error) {
      console.error("Error creating interaction:", error);
      res.status(400).json({ error: "Invalid interaction data" });
    }
  });

  // Provider Reviews endpoints
  app.post("/api/reviews", async (req, res) => {
    try {
      const validatedData = insertProviderReviewSchema.parse(req.body);
      const review = await storage.createProviderReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ error: "Invalid review data" });
    }
  });

  // Escalations endpoints
  app.get("/api/escalations", async (_req, res) => {
    try {
      const escalations = await storage.getAllEscalationsWithDetails();
      res.json(escalations);
    } catch (error) {
      console.error("Error fetching escalations:", error);
      res.status(500).json({ error: "Failed to fetch escalations" });
    }
  });

  app.patch("/api/escalations/:id", async (req, res) => {
    try {
      const escalation = await storage.updateEscalation(req.params.id, req.body);
      res.json(escalation);
    } catch (error) {
      console.error("Error updating escalation:", error);
      res.status(500).json({ error: "Failed to update escalation" });
    }
  });

  // Messages endpoints
  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

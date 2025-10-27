import { db } from "./db";
import { 
  patients, 
  children, 
  aiInteractions, 
  providerReviews,
  medications,
  allergies,
  problemList,
  escalations,
  messages 
} from "@shared/schema";
import { subMonths, subDays, subHours, subMinutes } from "date-fns";

// Common pediatric conditions with ICD-10 codes
const commonConditions = [
  { condition: "Asthma", icd10: "J45.909", severity: "moderate" },
  { condition: "Eczema", icd10: "L20.9", severity: "mild" },
  { condition: "ADHD", icd10: "F90.0", severity: "moderate" },
  { condition: "Seasonal allergies", icd10: "J30.2", severity: "mild" },
  { condition: "Ear infection", icd10: "H66.90", severity: "moderate" },
  { condition: "Constipation", icd10: "K59.00", severity: "mild" },
];

// Common pediatric medications
const commonMeds = [
  { name: "Amoxicillin", dosage: "250mg", frequency: "twice daily" },
  { name: "Albuterol inhaler", dosage: "2 puffs", frequency: "as needed" },
  { name: "Cetirizine", dosage: "5mg", frequency: "once daily" },
  { name: "Ibuprofen", dosage: "100mg", frequency: "every 6 hours as needed" },
  { name: "Fluticasone nasal spray", dosage: "1 spray each nostril", frequency: "once daily" },
];

// Common allergies
const commonAllergies = [
  { allergen: "Peanuts", reaction: "Hives and swelling", severity: "severe" },
  { allergen: "Penicillin", reaction: "Rash", severity: "moderate" },
  { allergen: "Dust mites", reaction: "Sneezing and congestion", severity: "mild" },
  { allergen: "Eggs", reaction: "Upset stomach", severity: "mild" },
  { allergen: "Bee stings", reaction: "Local swelling", severity: "moderate" },
];

// Pharmacies
const pharmacies = [
  "CVS Pharmacy - Main St",
  "Walgreens - Oak Ave", 
  "Rite Aid - Downtown",
  "Target Pharmacy - Mall Location",
  "Costco Pharmacy",
];

// Clara AI summaries and recommendations
const claraSummaries = [
  {
    concern: "My 4 year old has had a fever of 101F for 2 days with a cough",
    summary: "Child presenting with moderate fever and cough for 48 hours. Likely viral upper respiratory infection.",
    recommendations: "Monitor temperature, encourage fluids, use acetaminophen for comfort. See provider if fever >103F or persists >3 days.",
    urgency: "routine" as const,
  },
  {
    concern: "Noticed a rash on my toddler's chest that's spreading",
    summary: "New onset spreading rash on trunk. Differential includes viral exanthem, contact dermatitis, or allergic reaction.",
    recommendations: "Photo document rash progression, monitor for fever or other symptoms. If rapid spread or breathing issues, seek immediate care.",
    urgency: "moderate" as const,
  },
  {
    concern: "My child is wheezing and having trouble breathing after playing outside",
    summary: "Acute onset respiratory distress with wheezing following outdoor activity. Possible asthma exacerbation or allergic reaction.",
    recommendations: "URGENT: Use rescue inhaler if available. If no improvement in 15 minutes or worsening, call 911 or go to ER immediately.",
    urgency: "urgent" as const,
  },
  {
    concern: "Baby hasn't had a wet diaper in 12 hours and seems very sleepy",
    summary: "Infant showing signs of dehydration with decreased urine output and lethargy. Risk of significant dehydration.",
    recommendations: "CRITICAL: Immediate medical evaluation needed. Go to ER for IV fluids and assessment. Do not delay.",
    urgency: "critical" as const,
  },
  {
    concern: "My 6 year old complains of stomach pain around belly button for past 3 hours",
    summary: "Periumbilical pain in school-age child. Consider appendicitis, constipation, or gastroenteritis.",
    recommendations: "Monitor for fever, vomiting, or pain migration to right lower quadrant. If symptoms worsen or persist >6 hours, seek evaluation.",
    urgency: "moderate" as const,
  },
  {
    concern: "Child has been coughing at night for about a week, worse when lying down",
    summary: "Persistent nocturnal cough, positional component suggests post-nasal drip or mild asthma.",
    recommendations: "Elevate head of bed, consider humidifier, honey for cough (if >1 year old). Schedule routine appointment if persists.",
    urgency: "routine" as const,
  },
];

async function seed() {
  console.log("🌱 Seeding comprehensive medical data...");

  // Clear existing data
  await db.delete(messages);
  await db.delete(escalations);
  await db.delete(providerReviews);
  await db.delete(aiInteractions);
  await db.delete(problemList);
  await db.delete(allergies);
  await db.delete(medications);
  await db.delete(children);
  await db.delete(patients);

  // Create 30 families
  const familyData = [];
  const firstNames = ["Emma", "Oliver", "Sophia", "Lucas", "Ava", "Ethan", "Isabella", "Mason", "Mia", "Noah"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
  
  for (let i = 0; i < 30; i++) {
    const lastName = lastNames[i % lastNames.length];
    const parentFirstName = ["Sarah", "Michael", "Jennifer", "David", "Lisa", "Robert", "Maria", "James"][i % 8];
    
    familyData.push({
      parentName: `${parentFirstName} ${lastName}`,
      email: `${parentFirstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
      phone: `(555) ${String(100 + i).padStart(3, '0')}-${String(1000 + i).padStart(4, '0')}`,
      pharmacy: pharmacies[i % pharmacies.length],
      children: [
        {
          name: `${firstNames[i % firstNames.length]} ${lastName}`,
          age: 2 + (i % 10), // Ages 2-11
          weight: 25 + (i % 10) * 5, // Weight varies by age
        }
      ]
    });
  }

  // Insert families and their medical data
  for (const family of familyData) {
    // Create parent
    const [patient] = await db.insert(patients).values({
      name: family.parentName,
      email: family.email,
      phone: family.phone,
      preferredPharmacy: family.pharmacy,
    }).returning();

    // Create children and their medical data
    for (const childData of family.children) {
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - childData.age);
      
      const [child] = await db.insert(children).values({
        patientId: patient.id,
        name: childData.name,
        dateOfBirth: dob.toISOString().split('T')[0],
        medicalRecordNumber: `MRN${String(Math.floor(Math.random() * 1000000)).padStart(7, '0')}`,
        currentWeight: String(childData.weight),
      }).returning();

      // Add medications (70% of children have at least one)
      if (Math.random() < 0.7) {
        const numMeds = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numMeds; i++) {
          const med = commonMeds[Math.floor(Math.random() * commonMeds.length)];
          await db.insert(medications).values({
            childId: child.id,
            ...med,
            active: Math.random() > 0.2, // 80% active
            startDate: subMonths(new Date(), Math.floor(Math.random() * 6)).toISOString().split('T')[0],
          });
        }
      }

      // Add allergies (40% of children have at least one)
      if (Math.random() < 0.4) {
        const numAllergies = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numAllergies; i++) {
          const allergy = commonAllergies[Math.floor(Math.random() * commonAllergies.length)];
          await db.insert(allergies).values({
            childId: child.id,
            ...allergy,
          });
        }
      }

      // Add problem list items (50% of children have at least one)
      if (Math.random() < 0.5) {
        const numProblems = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numProblems; i++) {
          const problem = commonConditions[Math.floor(Math.random() * commonConditions.length)];
          await db.insert(problemList).values({
            childId: child.id,
            condition: problem.condition,
            icd10Code: problem.icd10,
            status: Math.random() > 0.3 ? "active" : "resolved",
            onsetDate: subMonths(new Date(), Math.floor(Math.random() * 12)).toISOString().split('T')[0],
          });
        }
      }

      // Create interactions - 1 per month for the last 3 months
      for (let month = 0; month < 3; month++) {
        const claraData = claraSummaries[Math.floor(Math.random() * claraSummaries.length)];
        const interactionDate = subMonths(new Date(), month);
        const queueTime = subMinutes(interactionDate, Math.floor(Math.random() * 120) + 10); // 10-130 minutes in queue
        
        const [interaction] = await db.insert(aiInteractions).values({
          childId: child.id,
          patientId: patient.id,
          parentConcern: claraData.concern,
          aiResponse: `Based on the symptoms described, ${claraData.summary} ${claraData.recommendations}`,
          aiSummary: claraData.summary,
          urgencyLevel: claraData.urgency,
          claraRecommendations: claraData.recommendations,
          queuedAt: queueTime,
          reviewedAt: month === 0 && Math.random() > 0.5 ? null : interactionDate, // Some current month not reviewed yet
          createdAt: queueTime,
        }).returning();

        // Add provider review for 60% of interactions (except recent ones)
        if (month > 0 || Math.random() < 0.3) {
          const decisions = ["agree", "agree_with_thoughts", "disagree", "needs_escalation"];
          const decision = claraData.urgency === "critical" || claraData.urgency === "urgent" 
            ? "needs_escalation" 
            : decisions[Math.floor(Math.random() * 3)];

          await db.insert(providerReviews).values({
            interactionId: interaction.id,
            providerName: "Dr. House",
            reviewDecision: decision as any,
            providerNotes: decision === "agree" 
              ? null 
              : "Additional monitoring recommended. Follow up in 24-48 hours if symptoms persist.",
            icd10Code: commonConditions[Math.floor(Math.random() * commonConditions.length)].icd10,
            createdAt: interactionDate,
          });

          // Create escalation for "needs_escalation" decisions
          if (decision === "needs_escalation") {
            const [escalation] = await db.insert(escalations).values({
              interactionId: interaction.id,
              initiatedBy: "provider",
              status: month === 0 ? "texting" : "resolved",
              severity: claraData.urgency,
              reason: "Provider determined immediate consultation needed",
              createdAt: interactionDate,
              resolvedAt: month === 0 ? null : subHours(interactionDate, 2),
            }).returning();

            // Add some messages
            await db.insert(messages).values([
              {
                escalationId: escalation.id,
                senderId: patient.id,
                senderType: "parent",
                content: "Thank you for escalating this. Should I bring them in?",
                createdAt: subMinutes(interactionDate, 55),
              },
              {
                escalationId: escalation.id,
                senderId: "provider-1",
                senderType: "provider",
                content: "Yes, please come to the clinic within the next 2 hours. We'll fit you in.",
                createdAt: subMinutes(interactionDate, 50),
              },
            ]);
          }
        }
      }
    }
  }

  console.log("✅ Medical data seeded successfully!");
  console.log("📊 Created:");
  console.log("   - 30 families with children");
  console.log("   - Medical histories (medications, allergies, problems)");
  console.log("   - ~90 interactions with Clara AI summaries");
  console.log("   - Provider reviews with ICD-10 codes");
  console.log("   - Active escalations with messaging");
}

seed()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
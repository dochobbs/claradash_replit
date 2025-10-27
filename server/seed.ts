import { storage } from "./storage";

async function seed() {
  console.log("Seeding database...");

  // Create patients
  const patient1 = await storage.createPatient({
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "(555) 123-4567",
  });

  const patient2 = await storage.createPatient({
    name: "Michael Chen",
    email: "michael.chen@email.com",
    phone: "(555) 987-6543",
  });

  const patient3 = await storage.createPatient({
    name: "Emily Rodriguez",
    email: "emily.rodriguez@email.com",
    phone: "(555) 456-7890",
  });

  console.log("Created patients");

  // Create children
  const child1 = await storage.createChild({
    patientId: patient1.id,
    name: "Emma Johnson",
    dateOfBirth: "2018-05-15",
    medicalRecordNumber: "MRN-001234",
  });

  const child2 = await storage.createChild({
    patientId: patient1.id,
    name: "Oliver Johnson",
    dateOfBirth: "2020-09-22",
    medicalRecordNumber: "MRN-001235",
  });

  const child3 = await storage.createChild({
    patientId: patient2.id,
    name: "Sophia Chen",
    dateOfBirth: "2019-03-10",
    medicalRecordNumber: "MRN-001236",
  });

  const child4 = await storage.createChild({
    patientId: patient3.id,
    name: "Lucas Rodriguez",
    dateOfBirth: "2017-11-05",
    medicalRecordNumber: "MRN-001237",
  });

  console.log("Created children");

  // Create AI interactions
  const interaction1 = await storage.createAiInteraction({
    childId: child1.id,
    patientId: patient1.id,
    parentConcern: "Emma has been running a fever of 101°F for the past two days. She's been complaining of a sore throat and has reduced appetite. Should I be worried?",
    aiResponse: "Based on the symptoms you've described, Emma appears to have signs consistent with a viral upper respiratory infection. A fever of 101°F along with sore throat is common with viral infections. Here are my recommendations:\n\n1. Monitor her temperature regularly\n2. Ensure adequate hydration\n3. Acetaminophen or ibuprofen for fever/pain relief (age-appropriate dosing)\n4. Rest and comfort measures\n\nSeek immediate medical attention if:\n- Fever exceeds 103°F or persists beyond 3 days\n- Difficulty breathing or swallowing\n- Severe lethargy or inability to stay hydrated\n- Symptoms worsen significantly\n\nThis appears manageable at home with monitoring, but don't hesitate to contact your pediatrician if you have concerns.",
    conversationContext: "First-time parent, child previously healthy, no known allergies",
  });

  const interaction2 = await storage.createAiInteraction({
    childId: child2.id,
    patientId: patient1.id,
    parentConcern: "Oliver fell off his bike and scraped his knee pretty badly. I cleaned it with water but it's still bleeding a little. How should I care for it?",
    aiResponse: "For a scraped knee after a bike fall, here's the proper care:\n\n1. Clean the wound thoroughly with mild soap and water\n2. Apply gentle pressure with clean gauze to stop bleeding\n3. Once bleeding stops, apply antibiotic ointment\n4. Cover with a sterile bandage\n5. Change bandage daily and monitor for infection\n\nWatch for signs of infection:\n- Increased redness, warmth, or swelling\n- Pus or drainage\n- Red streaks extending from wound\n- Fever\n\nSeek medical care if:\n- Bleeding doesn't stop after 10 minutes of pressure\n- Wound is deep or gaping\n- Signs of infection develop\n- Unable to clean debris from wound\n- Tetanus shot is not up to date\n\nMost scraped knees heal well with basic home care.",
    conversationContext: "Active 4-year-old, up to date on vaccinations",
  });

  const interaction3 = await storage.createAiInteraction({
    childId: child3.id,
    patientId: patient2.id,
    parentConcern: "Sophia has been coughing at night for about a week. It sounds like a barking cough and she seems to have trouble breathing when she coughs. Is this serious?",
    aiResponse: "A barking cough with breathing difficulty could indicate croup (laryngotracheobronchitis), which needs medical evaluation. Key concerns:\n\n1. Barking/seal-like cough is characteristic of croup\n2. Breathing difficulties during coughing episodes\n3. Duration of one week\n\nImmediate steps:\n- Keep her calm (crying can worsen symptoms)\n- Try humidified air (steamy bathroom)\n- Cool night air can sometimes help\n\nIMPORTANT: This requires medical evaluation, especially given:\n- Duration of symptoms (1 week)\n- Breathing difficulties\n- Night-time worsening\n\nSeek immediate care if:\n- Stridor (high-pitched breathing sound) at rest\n- Severe breathing difficulty\n- Bluish lips or skin\n- Drooling or difficulty swallowing\n\nI recommend contacting your pediatrician today for evaluation. They may prescribe steroids or other treatments for croup.",
    conversationContext: "Child attends daycare, recent cold symptoms in household",
  });

  const interaction4 = await storage.createAiInteraction({
    childId: child4.id,
    patientId: patient3.id,
    parentConcern: "Lucas has been complaining of stomach pain around his belly button for the past 3 hours. He says it's getting worse and now he doesn't want to eat. What should I do?",
    aiResponse: "Abdominal pain in children requires careful assessment. The progression and location you describe warrant close attention:\n\nConcerning features:\n- Pain duration (3 hours and worsening)\n- Loss of appetite\n- Location (periumbilical)\n\nPossible causes range from benign (constipation, gas) to serious (appendicitis, intestinal issues).\n\nMonitor for:\n- Pain migration (especially to lower right abdomen)\n- Fever\n- Vomiting\n- Changes in bowel movements\n- Inability to find comfortable position\n- Tenderness when pressing on abdomen\n\nRECOMMENDATION: Given the worsening nature and duration, I recommend contacting your pediatrician or seeking medical evaluation. Abdominal pain in children that persists and worsens should be evaluated promptly.\n\nSeek emergency care immediately if:\n- Severe, constant pain\n- Rigid or very tender abdomen\n- Bloody stools or vomit\n- High fever\n- Child appears very ill or lethargic",
    conversationContext: "7-year-old male, active child, no recent illness",
  });

  console.log("Created AI interactions");

  // Create some provider reviews
  await storage.createProviderReview({
    interactionId: interaction1.id,
    providerName: "Dr. Jennifer Martinez",
    reviewDecision: "agree",
    providerNotes: "Appropriate assessment and guidance for viral URI. Home care recommendations are sound.",
  });

  await storage.createProviderReview({
    interactionId: interaction2.id,
    providerName: "Dr. James Thompson",
    reviewDecision: "agree_with_thoughts",
    providerNotes: "Good wound care instructions. Would add: ensure tetanus is current and consider follow-up if not healing in 5-7 days.",
  });

  await storage.createProviderReview({
    interactionId: interaction3.id,
    providerName: "Dr. Jennifer Martinez",
    reviewDecision: "needs_escalation",
    providerNotes: "Correct identification of croup. Given duration and breathing difficulties, this child needs immediate pediatric evaluation. May require oral steroids or epinephrine. Escalating for same-day appointment.",
  });

  console.log("Created provider reviews");
  console.log("Seeding complete!");
}

seed().catch(console.error);

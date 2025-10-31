# Architecture & Development Guide

Comprehensive guide to CareAgentDashboard's architecture, design patterns, and development practices.

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Design](#database-design)
5. [Data Flow](#data-flow)
6. [State Management](#state-management)
7. [Development Practices](#development-practices)
8. [Performance Considerations](#performance-considerations)

---

## High-Level Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────┐
│     Frontend (React + Vite)      │
│   - UI Components               │
│   - State Management (Query)    │
│   - Routing (Wouter)            │
└──────────────┬──────────────────┘
               │ HTTP REST API
┌──────────────▼──────────────────┐
│   Backend (Express + TypeScript) │
│   - API Routes & Handlers       │
│   - Business Logic              │
│   - Database Access Layer       │
└──────────────┬──────────────────┘
               │ SQL Queries
┌──────────────▼──────────────────┐
│   Database (PostgreSQL)          │
│   - Relational Data Model       │
│   - Persistent Storage          │
└─────────────────────────────────┘
```

### Key Design Principles

1. **Separation of Concerns**: Clear boundaries between frontend, backend, and database layers
2. **Type Safety**: End-to-end TypeScript ensures compile-time type checking
3. **API-Driven**: Single source of truth is the REST API
4. **Stateless Backend**: Each request is independent (except sessions)
5. **Client-Side Routing**: SPA navigation without page refreshes

---

## Frontend Architecture

### Directory Structure

```
client/src/
├── pages/              # Route components (full page views)
│   ├── Dashboard.tsx
│   ├── Patients.tsx
│   ├── PatientDetail.tsx
│   ├── Reviews.tsx
│   ├── ReviewWorkbench.tsx
│   ├── Escalations.tsx
│   ├── Messages.tsx
│   ├── Analytics.tsx
│   └── not-found.tsx
│
├── components/         # Reusable UI components
│   ├── ui/            # shadcn/ui components (60+)
│   ├── Layout.tsx     # Main layout wrapper
│   ├── ClaraChat.tsx  # AI chat component
│   ├── PatientCard.tsx
│   ├── ReviewBadge.tsx
│   ├── ReviewTimeline.tsx
│   └── ... other components
│
├── hooks/             # Custom React hooks
│   ├── use-toast.ts
│   └── ... custom hooks
│
├── lib/               # Utilities
│   ├── queryClient.ts # React Query configuration
│   └── utils.ts       # Helper functions
│
├── App.tsx            # Main router component
└── main.tsx           # Entry point
```

### Component Hierarchy

```
App
├── Router (Wouter)
│   ├── <Dashboard />
│   ├── <Patients />
│   ├── <PatientDetail />
│   ├── <Reviews />
│   ├── <ReviewWorkbench />
│   ├── <Escalations />
│   ├── <Messages />
│   └── <Analytics />
│
└── Layout
    ├── Sidebar (Navigation)
    ├── Header
    └── Main Content Area
```

### Key Technologies

| Technology | Purpose | Why Chosen |
|-----------|---------|-----------|
| React 18.3 | UI Framework | Modern, component-based, excellent ecosystem |
| TypeScript | Language | Type safety, better DX, error prevention |
| Vite | Build Tool | Fast dev server, optimized builds |
| React Query | State Management | Server state caching, automatic sync |
| Wouter | Routing | Lightweight, efficient SPA routing |
| Tailwind CSS | Styling | Utility-first, rapid UI development |
| shadcn/ui | Components | Pre-built accessible components |
| Framer Motion | Animations | Smooth, performant animations |

### React Query Usage

```typescript
// Dashboard.tsx example
const { data: stats, isLoading } = useQuery({
  queryKey: ["/api/stats"],
  refetchInterval: 30000,  // 30-second auto-refresh
});

const { mutate: submitReview } = useMutation({
  mutationFn: async (review) => apiRequest('/api/reviews', { method: 'POST', body: review }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/interactions"] })
});
```

**Key Concepts:**
- `queryKey`: Unique identifier for cached data
- `refetchInterval`: Auto-refresh time in milliseconds
- `invalidate`: Force re-fetch when data changes
- `mutationFn`: Async function that modifies data

### State Management Pattern

```
┌─────────────────────────────────────────┐
│   Server State (React Query Cache)      │
│   - API responses                       │
│   - Automatically synced                │
│   - Refetched periodically              │
└────────────┬────────────────────────────┘
             │ useQuery / useMutation
┌────────────▼────────────────────────────┐
│   Component State (useState)             │
│   - UI state (modals, forms)            │
│   - Local form inputs                   │
│   - Transient UI data                   │
└─────────────────────────────────────────┘
```

**Rule**: Avoid duplicating server data in component state. Use React Query as single source of truth.

### Form Handling

Uses `react-hook-form` for form state:

```typescript
const { register, handleSubmit, formState: { errors } } = useForm({
  defaultValues: {
    reviewDecision: "agree",
    providerNotes: ""
  }
});

const onSubmit = handleSubmit(async (data) => {
  await submitReview(data);
});
```

---

## Backend Architecture

### Directory Structure

```
server/
├── index.ts           # Express setup, middleware, server startup
├── routes.ts          # All API endpoints and handlers
├── storage.ts         # Data access layer (IStorage interface + DatabaseStorage class)
├── db.ts              # Database connection configuration
├── seed.ts            # Sample data seeding
└── seedMedical.ts     # Medical reference data
```

### Express Middleware Stack

```typescript
app.use(express.json())           // Parse JSON bodies
  .use((req, res, next) => {...}) // Logging middleware
  .use(registerRoutes)            // API routes
  .use(errorHandler)              // Global error handling
```

### Request-Response Flow

```
HTTP Request
    ↓
Express Middleware (parse, log)
    ↓
Route Handler (routes.ts)
    ↓
Validation (Zod schema)
    ↓
Storage Layer (storage.ts)
    ↓
Database Query (Drizzle ORM)
    ↓
Format Response
    ↓
HTTP Response
```

### Data Access Layer (Storage)

```typescript
// Abstraction: IStorage interface
export interface IStorage {
  // Patients
  getAllPatientsWithChildren(): Promise<PatientWithChildren[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;

  // AI Interactions
  getAllAiInteractionsWithDetails(): Promise<AiInteractionWithDetails[]>;
  createAiInteraction(interaction: InsertAiInteraction): Promise<AiInteraction>;

  // ... more methods
}

// Implementation: DatabaseStorage class
export class DatabaseStorage implements IStorage {
  async getAllPatientsWithChildren(): Promise<PatientWithChildren[]> {
    // Database query logic
  }

  // ... implementations
}
```

**Benefits:**
- Decouples routes from database implementation
- Easy to swap PostgreSQL for MongoDB, SQLite, etc.
- Testable without actual database
- Clear contract between layers

### Input Validation Pattern

Uses Zod for runtime validation:

```typescript
// schema.ts
export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
});

// routes.ts
app.post("/api/patients", async (req, res) => {
  try {
    const validatedData = insertPatientSchema.parse(req.body);
    const patient = await storage.createPatient(validatedData);
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ error: "Invalid patient data" });
  }
});
```

### Error Handling

Current pattern:
```typescript
try {
  // ... operation
  res.json(result);
} catch (error) {
  console.error("Error message:", error);
  res.status(500).json({ error: "User-friendly error" });
}
```

**Issue**: Generic error messages. Should distinguish between error types.

---

## Database Design

### Entity-Relationship Diagram

```
patients (1) ──→ (many) children
    ↓
    └──→ aiInteractions
         ├──→ providerReviews
         └──→ escalations
              └──→ messages

children ──→ medications
         ──→ allergies
         ──→ problemList
```

### Table Schemas

#### patients
Parent/caregiver information
```sql
- id (UUID, PK)
- name (TEXT)
- email (TEXT, UNIQUE)
- phone (TEXT)
- preferredPharmacy (TEXT)
- createdAt (TIMESTAMP)
```

#### children
Patient dependents
```sql
- id (UUID, PK)
- patientId (UUID, FK → patients)
- name (TEXT)
- dateOfBirth (TEXT)
- medicalRecordNumber (TEXT, UNIQUE)
- currentWeight (DECIMAL)
- createdAt (TIMESTAMP)
```

#### aiInteractions
Clara AI recommendations
```sql
- id (UUID, PK)
- childId (UUID, FK → children)
- patientId (UUID, FK → patients)
- parentConcern (TEXT)
- aiResponse (TEXT)
- urgencyLevel (ENUM: routine, moderate, urgent, critical)
- queuedAt (TIMESTAMP)
- reviewedAt (TIMESTAMP)
- createdAt (TIMESTAMP)
```

#### providerReviews
Provider decisions
```sql
- id (UUID, PK)
- interactionId (UUID, FK → aiInteractions)
- providerName (TEXT)
- reviewDecision (ENUM: agree, agree_with_thoughts, disagree, needs_escalation)
- providerNotes (TEXT)
- icd10Code (VARCHAR)
- snomedCode (VARCHAR)
- createdAt (TIMESTAMP)
```

#### escalations
Escalation tracking
```sql
- id (UUID, PK)
- interactionId (UUID, FK → aiInteractions)
- initiatedBy (TEXT: 'parent', 'provider', 'clara')
- status (ENUM: pending, texting, phone_call, video_call, resolved)
- severity (ENUM: routine, moderate, urgent, critical)
- reason (TEXT)
- createdAt (TIMESTAMP)
- resolvedAt (TIMESTAMP)
```

#### messages
Parent-provider communication
```sql
- id (UUID, PK)
- escalationId (UUID, FK → escalations)
- senderId (UUID)
- senderType (TEXT: 'parent' or 'provider')
- content (TEXT)
- isRead (BOOLEAN)
- createdAt (TIMESTAMP)
```

#### medications, allergies, problemList
Medical history tables (similar structure, all linked to children)

### Normalization

Database follows **3NF (Third Normal Form)**:
- ✅ No data duplication (normalized structure)
- ✅ Foreign key relationships maintain referential integrity
- ✅ All attributes depend on primary key

### Indexes

⚠️ **Issue**: No indexes defined in schema. Should add:

```sql
-- Essential indexes
CREATE INDEX idx_children_patient_id ON children(patient_id);
CREATE INDEX idx_ai_interactions_child_id ON ai_interactions(child_id);
CREATE INDEX idx_ai_interactions_patient_id ON ai_interactions(patient_id);
CREATE INDEX idx_provider_reviews_interaction_id ON provider_reviews(interaction_id);
CREATE INDEX idx_escalations_interaction_id ON escalations(interaction_id);
CREATE INDEX idx_messages_escalation_id ON messages(escalation_id);
CREATE INDEX idx_medications_child_id ON medications(child_id);
```

---

## Data Flow

### Typical User Workflow: Reviewing AI Recommendation

```
1. Provider opens Dashboard
   └→ Frontend: useQuery(["/api/stats"])
   └→ Backend: GET /api/stats
   └→ Database: SELECT COUNT(*) FROM aiInteractions...
   └→ Response: { reviewsPending: 5, ... }

2. Provider navigates to Reviews page
   └→ Frontend: useQuery(["/api/interactions/recent"])
   └→ Backend: GET /api/interactions/recent
   └→ Database: SELECT * FROM aiInteractions... LIMIT 10
   └→ Includes: child, patient, and reviews data

3. Provider clicks on review item
   └→ Frontend: Navigates to ReviewWorkbench
   └→ Shows interaction details, history, timeline

4. Provider submits review decision
   └→ Frontend: useMutation for POST /api/reviews
   └→ Backend: POST /api/reviews with validatedData
   └→ Zod validation: insertProviderReviewSchema.parse(req.body)
   └→ Database: INSERT INTO provider_reviews...
   └→ Response: { id, interactionId, reviewDecision, ... }
   └→ Frontend: queryClient.invalidateQueries() - refetch stats

5. Dashboard stats update automatically
   └→ React Query refetches /api/stats after 30 seconds
   └→ Or immediately if user navigates back to Dashboard
```

### Data Consistency

- **Optimistic Updates**: ❌ Not implemented. Updates are pessimistic (wait for server).
- **Conflict Resolution**: ❌ No handling for concurrent updates.
- **Eventual Consistency**: ✅ Refetch queries after mutations.

---

## State Management

### React Query Cache Structure

```typescript
// Query cache keys
queryKey: ["/api/stats"]                  // Single query
queryKey: ["/api/patients"]               // List query
queryKey: ["/api/interactions/recent"]    // Filtered query
queryKey: ["/api/interactions", patientId] // Parameterized query
```

### Cache Invalidation Strategies

```typescript
// Invalidate single query
queryClient.invalidateQueries({ queryKey: ["/api/stats"] });

// Invalidate all queries starting with /api/interactions
queryClient.invalidateQueries({ queryKey: ["/api/interactions"] });

// Invalidate everything
queryClient.invalidateQueries();
```

### Refetch Intervals

```
Dashboard Stats:   30 seconds (dashboad stats)
Patient List:      No auto-refetch
Interactions:      No auto-refetch (manual invalidation only)
Escalations:       No auto-refetch (manual invalidation only)
```

⚠️ **Issue**: 30-second interval is too aggressive for production. Consider:
- WebSocket for real-time updates
- Longer intervals (5 minutes for stats)
- User-triggered refresh buttons

---

## Development Practices

### Adding a New Feature

#### 1. Backend (Database → API)

```typescript
// Step 1: Update schema.ts
export const newTable = pgTable("new_table", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  // ... fields
});

// Step 2: Add relations
export const newTableRelations = relations(newTable, ({ one }) => ({
  // relationships
}));

// Step 3: Create Zod schema
export const insertNewTableSchema = createInsertSchema(newTable).omit({
  id: true,
  createdAt: true,
});

// Step 4: Add interface method in IStorage
interface IStorage {
  getNewTable(id: string): Promise<NewTable | undefined>;
  // ...
}

// Step 5: Implement in DatabaseStorage
class DatabaseStorage implements IStorage {
  async getNewTable(id: string) {
    return (await db.select().from(newTable).where(eq(newTable.id, id)))[0];
  }
}

// Step 6: Add API route in routes.ts
app.get("/api/new-table/:id", async (req, res) => {
  try {
    const item = await storage.getNewTable(req.params.id);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch" });
  }
});

// Step 7: Run migration
npm run db:push
```

#### 2. Frontend (API → Component)

```typescript
// Step 1: Create hooks for queries
const useNewTable = (id: string) => {
  return useQuery({
    queryKey: [`/api/new-table/${id}`],
    queryFn: async () => apiRequest(`/api/new-table/${id}`),
  });
};

// Step 2: Create component
export function NewTableComponent({ id }) {
  const { data, isLoading } = useNewTable(id);

  if (isLoading) return <Skeleton />;

  return <div>{/* render data */}</div>;
}

// Step 3: Add to route/page
export default function NewPage() {
  return <NewTableComponent id="..." />;
}

// Step 4: Add navigation link
// Update App.tsx and sidebar navigation
```

### TypeScript Best Practices

✅ **Do:**
```typescript
// Import types explicitly
import type { Patient, AiInteraction } from "@shared/schema";

// Use const assertions for literals
const DECISION_OPTIONS = ["agree", "disagree"] as const;

// Use discriminated unions
type Review =
  | { decision: "agree"; notes: string }
  | { decision: "disagree"; reason: string };

// Extract types from Zod schemas
type InsertPatient = z.infer<typeof insertPatientSchema>;
```

❌ **Don't:**
```typescript
// Avoid any
const data: any = response.data;

// Avoid implicit any
function processData(data) { ... }

// Avoid loose object types
const patient: Record<string, any> = { ... };
```

### Code Organization

Files should be:
- **Small**: <300 lines maximum
- **Focused**: One responsibility per file
- **Testable**: Pure functions without side effects
- **Typed**: Full type annotations

### Naming Conventions

```typescript
// Components: PascalCase
export function PatientCard() { }

// Files: Match component name
PatientCard.tsx

// Variables: camelCase
const patientList = [];
const isLoading = true;

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 30000;

// Functions: camelCase
function formatDate(date: Date) { }
const getPatient = async (id: string) => { }
```

---

## Performance Considerations

### Frontend Performance

**Bundle Size Optimization:**
- Vite handles code splitting automatically
- Tree-shaking removes unused code
- Tailwind CSS purges unused styles

**Rendering Optimization:**
- React.memo for expensive components
- Suspense boundaries for code splitting
- useCallback/useMemo for stable references

**Query Optimization:**
- React Query caches aggressively
- 30-second refetch prevents excessive API calls
- Mutations invalidate related queries only

### Backend Performance

**Database Optimization:**
- ❌ **N+1 Problem**: Multiple queries per list item
- ❌ **No Pagination**: Loads all records into memory
- ❌ **No Indexes**: Foreign key lookups are slow
- ❌ **No Aggregation**: Calculations in application code

**API Response Time:**
```
/api/stats       ~200ms (loops through all interactions)
/api/patients    ~500ms (N+1 queries for children)
/api/analytics   ~1000ms (complex in-memory calculations)
```

**Improvements Needed:**
1. Add database indexes
2. Implement pagination (limit/offset)
3. Use SQL aggregation (GROUP BY, COUNT, etc.)
4. Add query result caching
5. Implement query timeouts

### Monitoring

Currently: ❌ None

Recommended:
- Response time logging
- Error rate monitoring
- Database query profiling
- Frontend error tracking (Sentry)

---

## Configuration Files

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ESNext",        // Modern JavaScript
    "module": "ESNext",        // ES modules
    "jsx": "preserve",         // Vite handles JSX
    "moduleResolution": "bundler",  // Node-like resolution
    "resolveJsonModule": true, // Import JSON
    "paths": {                 // Path aliases
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  },
  "include": ["client/src", "server", "shared"]
}
```

### vite.config.ts

```typescript
export default defineConfig({
  root: "client",                    // Client directory
  build: {
    outDir: "../dist/public"        // Production output
  },
  resolve: {
    alias: {
      "@": "/src",
      "@shared": "/../shared"
    }
  }
});
```

### drizzle.config.ts

```typescript
export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
});
```

---

## Key Takeaways

1. **Monolithic Architecture**: Single codebase, easy to deploy
2. **Type-Safe**: End-to-end TypeScript ensures safety
3. **Clean Separation**: Frontend/Backend/Database layers
4. **React Query Pattern**: Excellent server state management
5. **Data Access Abstraction**: Easy to swap implementations
6. **Room for Optimization**: Performance improvements needed at scale

---

For questions about architecture decisions or implementation details, refer to:
- [API.md](./API.md) - Endpoint specifications
- [SECURITY.md](./SECURITY.md) - Security considerations
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production guidelines

# Contributing Guide

Guidelines for contributing to CareAgentDashboard development.

## Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/dochobbs/claradash_replit.git
cd claradash_replit
npm install
```

### 2. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 3. Set Up Development Environment

```bash
# Copy environment template
cp .env.example .env.local

# Set variables for local development
DATABASE_URL=postgresql://localhost:5432/claradash
AI_INTEGRATIONS_OPENAI_API_KEY=sk-test-key
PORT=5000
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Development Workflow

### Making Changes

1. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/patient-export
   ```

2. **Make your changes**
   - Keep commits small and focused
   - Write clear commit messages
   - Test changes locally

3. **Type check your code**
   ```bash
   npm run check
   ```

4. **Test your changes**
   - Manual testing required (see Testing section below)
   - Check database migrations work
   - Verify API responses are correct

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add patient export feature"
   ```

6. **Push to GitHub**
   ```bash
   git push origin feature/patient-export
   ```

7. **Open a Pull Request**
   - Write descriptive PR title and description
   - Reference any related issues (#123)
   - Request review from team members

### Code Standards

#### TypeScript

- Use strict type checking
- Export types from shared/schema.ts
- Avoid `any` type

```typescript
// ✅ Good
import type { Patient } from "@shared/schema";

function displayPatient(patient: Patient) {
  return <div>{patient.name}</div>;
}

// ❌ Bad
function displayPatient(patient: any) {
  return <div>{patient.name}</div>;
}
```

#### React Components

- Functional components only
- Use hooks for state and effects
- Memoize expensive components

```typescript
// ✅ Good
export function PatientCard({ patient }: { patient: Patient }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card>
      <CardHeader onClick={() => setExpanded(!expanded)}>
        {patient.name}
      </CardHeader>
      {expanded && <CardContent>{/* details */}</CardContent>}
    </Card>
  );
}

// ❌ Bad - class component
export class PatientCard extends React.Component {
  // ...
}
```

#### API Endpoints

- Use consistent naming conventions
- Validate all inputs with Zod
- Return consistent response formats

```typescript
// ✅ Good
app.post("/api/reviews", async (req, res) => {
  try {
    const validated = insertProviderReviewSchema.parse(req.body);
    const review = await storage.createProviderReview(validated);
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: "Invalid review data" });
  }
});
```

#### Database Queries

- Use Drizzle ORM, not raw SQL
- Leverage type safety
- Add indexes for performance

```typescript
// ✅ Good
const patients = await db.select().from(patients).limit(10);

// ❌ Bad - raw SQL
const patients = await db.query("SELECT * FROM patients LIMIT 10");
```

### Naming Conventions

```
Components:        PatientCard.tsx
Files:            match component name
Variables:        camelCase
Constants:        UPPER_SNAKE_CASE
Functions:        camelCase
Database tables:  snake_case
Database fields:  camelCase (in Drizzle)
API endpoints:    /api/resource-name
```

## Testing

### Manual Testing Checklist

For feature/bug fix, test:

- [ ] Feature works in Chrome
- [ ] Feature works in Firefox
- [ ] Feature works on mobile (iPhone/Android)
- [ ] No console errors
- [ ] No TypeScript errors (`npm run check`)
- [ ] API responses are correct
- [ ] Database changes persist after reload
- [ ] Error cases handled gracefully
- [ ] Loading states shown
- [ ] Form validation works

### API Testing

```bash
# Test endpoint
curl -X GET http://localhost:5000/api/patients

# Test with body
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","phone":"555-1234"}'
```

### Database Testing

```bash
# Connect to development database
psql postgresql://localhost:5432/claradash

# Run migrations
npm run db:push

# Check schema
\d patients
\d+ provider_reviews

# Test query
SELECT * FROM patients LIMIT 5;
```

### Recommended Automated Testing

When adding tests, use:

**Unit Tests:**
```typescript
// utils.test.ts
import { formatDate } from "@/lib/utils";

describe("formatDate", () => {
  it("formats date correctly", () => {
    const result = formatDate(new Date("2024-10-30"));
    expect(result).toBe("Oct 30, 2024");
  });
});
```

**Integration Tests:**
```typescript
// routes.test.ts
import request from "supertest";
import { app } from "../server/index";

describe("GET /api/patients", () => {
  it("returns list of patients", async () => {
    const res = await request(app).get("/api/patients");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
```

## Database Migrations

### Adding a New Table

1. **Update schema.ts**
   ```typescript
   export const newTable = pgTable("new_table", {
     id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
     // ... fields
   });
   ```

2. **Add relations**
   ```typescript
   export const newTableRelations = relations(newTable, ({ one, many }) => ({
     // relationships
   }));
   ```

3. **Create Zod schema**
   ```typescript
   export const insertNewTableSchema = createInsertSchema(newTable);
   ```

4. **Generate and apply migration**
   ```bash
   npm run db:push
   ```

5. **Test in development**
   - Verify table created: `\d new_table`
   - Test inserts and queries
   - Verify all fields accessible

### Modifying Existing Table

1. **Update schema.ts**
   ```typescript
   export const patients = pgTable("patients", {
     // ... existing fields
     newField: text("new_field"), // New field
   });
   ```

2. **Apply migration**
   ```bash
   npm run db:push
   ```

3. **Update related code**
   - Update Drizzle queries
   - Update Zod schemas
   - Update React components

## Commit Guidelines

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation change
- `style`: Code style change (no logic)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Test addition/change
- `chore`: Build, dependency updates

### Examples

```
feat: add patient export functionality

- Add CSV export button on patient list
- Implement export generation service
- Add export audit logging

Closes #123
```

```
fix: resolve null reference in review page

The review timeline was failing when interaction had no reviews.
Added null check before rendering.

Fixes #456
```

## Pull Request Process

### Before Submitting

1. **Update from main**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Push changes**
   ```bash
   git push origin feature/your-feature
   ```

3. **Create PR on GitHub**
   - Use PR template (auto-populated)
   - Describe changes clearly
   - Link related issues

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing Done
- [ ] Tested locally
- [ ] No console errors
- [ ] TypeScript checks pass
- [ ] Database changes verified

## Related Issues
Closes #123
Relates to #456

## Screenshots (if UI change)
[screenshots]

## Checklist
- [ ] Code follows style guide
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] Documentation updated
```

### Review Process

1. **At least one review required** before merge
2. **Address review comments** by pushing new commits
3. **Resolve conversations** when addressed
4. **Rebase if needed** to keep history clean
5. **Squash commits** if requested (optional)

```bash
# Squash multiple commits
git rebase -i HEAD~3
# Then in editor, mark commits as 'squash'
```

6. **Merge to main**
   ```bash
   # Use "Squash and merge" or "Create a merge commit"
   # depending on preference
   ```

## Code Review Checklist

When reviewing PRs, check:

- [ ] Code follows style guide
- [ ] Changes solve the stated problem
- [ ] No unnecessary dependencies added
- [ ] Tests are adequate
- [ ] Documentation updated
- [ ] No performance regressions
- [ ] Security considerations addressed
- [ ] Backwards compatibility maintained

## Feature Development Example

Let's say you want to add a "provider notes field enhancement":

### Step 1: Create Branch
```bash
git checkout -b feature/enhanced-provider-notes
```

### Step 2: Update Schema
```typescript
// shared/schema.ts
export const providerReviews = pgTable("provider_reviews", {
  // ... existing fields
  notesTags: text("notes_tags"),  // New field
  confidenceScore: integer("confidence_score"),  // New field
});
```

### Step 3: Create API Endpoint
```typescript
// server/routes.ts
app.patch("/api/reviews/:id", authMiddleware, async (req, res) => {
  const validated = updateReviewSchema.parse(req.body);
  const review = await storage.updateReview(req.params.id, validated);
  res.json(review);
});
```

### Step 4: Implement in Storage Layer
```typescript
// server/storage.ts
async updateReview(id: string, data: Partial<ProviderReview>) {
  return await db
    .update(providerReviews)
    .set(data)
    .where(eq(providerReviews.id, id))
    .returning();
}
```

### Step 5: Create React Component
```typescript
// client/src/components/EnhancedReviewForm.tsx
export function EnhancedReviewForm({ review, onSave }: Props) {
  const { register, handleSubmit } = useForm({
    defaultValues: review
  });

  return (
    <form onSubmit={handleSubmit(onSave)}>
      <textarea {...register("providerNotes")} />
      <input {...register("notesTags")} />
      <input {...register("confidenceScore")} type="number" />
      <button type="submit">Save</button>
    </form>
  );
}
```

### Step 6: Test Everything
```bash
npm run check              # TypeScript
npm run db:push            # Migrations
npm run dev                # Test manually
```

### Step 7: Commit
```bash
git add .
git commit -m "feat: add provider notes enhancement with tags and confidence"
git push origin feature/enhanced-provider-notes
```

### Step 8: Create PR
- Describe the enhancement
- Add screenshots if UI change
- Request review

## Troubleshooting

### Port Already in Use

```bash
lsof -i :5000
kill -9 <PID>
```

### Database Migration Issues

```bash
# Reset migrations (development only!)
dropdb claradash
createdb claradash
npm run db:push
```

### TypeScript Errors

```bash
npm run check          # See all errors
npm run check -- --noEmit  # Check only, don't emit
```

### Dependency Issues

```bash
rm -rf node_modules package-lock.json
npm install
```

## Getting Help

- Check existing issues on GitHub
- Ask in pull request comments
- Reach out to maintainers
- Check documentation in `/docs`

## Code of Conduct

- Be respectful and professional
- Assume good intent
- Focus on code quality
- Help others learn and grow
- Report violations confidentially

---

**Thank you for contributing to CareAgentDashboard! 🎉**

Your efforts help make healthcare better for providers and patients.

# CareAgentDashboard

A modern, full-stack healthcare provider dashboard for managing pediatric patient care with AI-assisted clinical decision support (Clara). Built with React, TypeScript, Express, and PostgreSQL.

## Overview

CareAgentDashboard is a clinical decision support system that enables pediatric healthcare providers to:

- **Review AI Recommendations**: Evaluate Clara AI suggestions for patient concerns
- **Manage Patient Care**: Track patients and their medical histories
- **Handle Escalations**: Manage patient escalations with structured communication
- **View Analytics**: Monitor review outcomes and performance metrics
- **Coordinate Care**: Exchange messages with parents during escalations

## Features

### Dashboard
- Overview statistics (pending reviews, escalations, active patients)
- Recent reviews list with status indicators
- Quick action buttons for common tasks
- Time-based greeting and personalized welcome

### Patient Management
- Patient list with dependent children
- Detailed patient profiles with medical records
- Medication tracking (active/historical)
- Allergy documentation with severity levels
- Problem list with ICD-10 coding
- Contact information management

### Review Workbench
- Queue of pending AI recommendations
- Review timeline showing interaction history
- Decision options: Agree, Agree with Thoughts, Disagree, Escalate
- Provider notes and clinical coding support
- ICD-10 and SNOMED code integration

### Escalations
- Escalation tracking system
- Multiple escalation types: pending, texting, phone call, video call, resolved
- Message queue for parent-provider communication
- Escalation history and resolution tracking

### Analytics
- Review outcome charts (Agree, Agree with Thoughts, Disagree, Escalations)
- Time-based metrics (wait time, review time, escalation time)
- Performance statistics and trends

### AI Chat (Clara)
- Integrated AI assistant throughout the dashboard
- Floating chat interface
- Clinical decision support queries
- Medical information lookup

## Tech Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.6** - Type-safe JavaScript
- **Vite 5.4** - Fast build tool and dev server
- **Tailwind CSS 3.4** - Utility-first styling
- **shadcn/ui** - Pre-built accessible components
- **React Query (TanStack)** - Server state management
- **Wouter** - Lightweight routing
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization

### Backend
- **Express.js 4.21** - Web server framework
- **TypeScript 5.6** - Type-safe Node.js
- **Drizzle ORM 0.39** - SQL query builder and type-safe schema
- **Neon 0.10** - Serverless PostgreSQL
- **OpenAI API 6.7** - Clara AI integration
- **Zod 3.24** - Runtime schema validation

### Database
- **PostgreSQL 16** - Relational database (via Neon serverless)
- **Drizzle Kit** - Schema migrations

### Deployment
- **Replit** - Hosting platform
- **Docker** - Containerization (local PostgreSQL)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or Neon account for serverless)
- Git
- npm or yarn

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/dochobbs/claradash_replit.git
   cd claradash_replit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Required variables:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/careadash
   AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
   AI_INTEGRATIONS_OPENAI_API_KEY=sk-...
   PORT=5000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5000`

5. **Initialize sample data** (optional)
   - Click the "Initialize Sample Data" button on the Dashboard
   - Or POST to `/api/initialize-data`

### Database Setup

#### Local PostgreSQL (Docker)

```bash
# Start PostgreSQL container
docker run --name claradash-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=careadash \
  -p 5432:5432 \
  -d postgres:16

# Apply migrations
npm run db:push
```

#### Neon Serverless (Production)

1. Create a Neon account at https://neon.tech
2. Create a new PostgreSQL database
3. Copy the connection string to `.env`
4. Run migrations: `npm run db:push`

## Project Structure

```
├── client/                          # React frontend
│   ├── src/
│   │   ├── pages/                   # Route pages (Dashboard, Patients, etc.)
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn/ui components (60+)
│   │   │   └── *.tsx                # Custom business components
│   │   ├── hooks/                   # React custom hooks
│   │   ├── lib/                     # Utilities (query client, helpers)
│   │   ├── App.tsx                  # Main router
│   │   └── main.tsx                 # Entry point
│   ├── public/                      # Static assets
│   └── vite.config.ts               # Vite configuration
│
├── server/                          # Express backend
│   ├── index.ts                     # Server setup and middleware
│   ├── routes.ts                    # API endpoints
│   ├── storage.ts                   # Data access layer
│   ├── db.ts                        # Database connection
│   ├── seed.ts                      # Sample data seeding
│   └── seedMedical.ts               # Medical data seeding
│
├── shared/                          # Shared code
│   └── schema.ts                    # Drizzle ORM schema & Zod types
│
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── tailwind.config.ts               # Tailwind CSS config
├── drizzle.config.ts                # Drizzle ORM config
├── vite.config.ts                   # Vite bundler config
└── design_guidelines.md             # UI/UX guidelines
```

## Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Building
npm run build            # Build client and server for production

# Production
npm run start            # Start production server (requires build first)

# Utilities
npm run check            # Type check with TypeScript
npm run db:push          # Apply database migrations
```

## API Documentation

See [API.md](./docs/API.md) for complete API documentation including:
- All endpoints with request/response examples
- Authentication requirements
- Error codes and handling
- Rate limiting information

## Architecture & Development

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed information about:
- Project architecture and design patterns
- Component structure
- Data flow
- State management approach
- Database schema and relationships

## Security Guidelines

**⚠️ IMPORTANT**: This application handles sensitive patient health information (PHI).

See [SECURITY.md](./docs/SECURITY.md) for:
- Authentication and authorization requirements
- Data protection and encryption guidelines
- HIPAA compliance notes
- Security best practices
- Audit logging requirements

**Current Status**: This is a development/demo application. Do not use with real patient data without implementing the security measures documented in SECURITY.md.

## Deployment

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for:
- Deploying to Replit
- Deploying to other platforms (Vercel, Railway, Heroku)
- Environment configuration
- Database setup for production
- Monitoring and error tracking setup

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `patients` | Parent/caregiver information |
| `children` | Patient dependents with medical records |
| `ai_interactions` | Clara AI recommendations |
| `provider_reviews` | Provider decisions on recommendations |
| `escalations` | Escalation tracking |
| `messages` | Parent-provider communication |
| `medications` | Active and historical medications |
| `allergies` | Documented allergies |
| `problem_list` | Clinical diagnoses |

See [docs/SCHEMA.md](./docs/SCHEMA.md) for detailed schema documentation.

## Key Enums

- **review_decision**: agree, agree_with_thoughts, disagree, needs_escalation
- **urgency_level**: routine, moderate, urgent, critical
- **escalation_status**: pending, texting, phone_call, video_call, resolved

## Testing

Currently, no automated tests are included. We recommend adding:

- Unit tests with Jest
- Integration tests for API endpoints
- End-to-end tests with Playwright
- Database tests with test fixtures

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for testing guidelines.

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -m "Add feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for detailed guidelines.

## Performance Considerations

- React Query caches queries with 30-second refetch intervals
- Tailwind CSS provides optimized CSS output
- Images should be optimized before deployment
- Database queries use Drizzle ORM for optimal SQL generation

See [PERFORMANCE.md](./docs/PERFORMANCE.md) for optimization guidelines.

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres -d careadash

# Verify DATABASE_URL format
echo $DATABASE_URL
```

### Port Already in Use
```bash
# Use a different port
PORT=5001 npm run dev
```

### Vite Cache Issues
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub: https://github.com/dochobbs/claradash_replit/issues
- Check existing documentation in `/docs`
- Review design guidelines in `design_guidelines.md`

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and updates.

---

**Built for healthcare providers. Designed for clinical excellence.**

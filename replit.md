# Vital Provider Dashboard

## Overview
A Bauhaus-inspired web dashboard for medical providers to review and document AI-assisted clinical interactions. Designed with Vital's philosophy: "Designed for care, built for trust." This application serves as both an EMR (Electronic Medical Record) system and an active workspace for evaluating pediatric AI consultations.

## Purpose
- **Primary Goal**: Enable medical providers to review AI interactions between parents and a clinical AI agent
- **Secondary Goal**: Document all provider reviews for software and provider performance evaluation
- **Target Users**: Medical providers (pediatricians, nurses, clinical staff)

## Current State
The MVP implementation includes:
- ✅ Full-stack application with React + Express + PostgreSQL
- ✅ Database schema for patients, children, AI interactions, and provider reviews
- ✅ Dashboard with statistics and recent interactions
- ✅ Patient management with search and detailed profiles
- ✅ Review workbench with pending/reviewed interaction tabs
- ✅ Provider review submission with decision options (agree, agree with thoughts, disagree, needs escalation)
- ✅ EMR-style timeline showing interaction history
- ✅ Professional clinical UI design

## Architecture

### Database Schema
- **patients**: Parent/guardian information (name, email, phone)
- **children**: Child patient records (linked to parents, includes MRN and DOB)
- **ai_interactions**: Conversations between parents and AI (concern, response, context)
- **provider_reviews**: Clinical assessments by medical providers (decision, notes, timestamp)

### Key Relationships
```
patients (1) ─── (many) children
patients (1) ─── (many) ai_interactions
children (1) ─── (many) ai_interactions
ai_interactions (1) ─── (many) provider_reviews
```

### Review Decision Types (Enforced via PostgreSQL Enum)
1. **agree**: AI response is appropriate and accurate
2. **agree_with_thoughts**: Generally good with additional considerations
3. **disagree**: AI response needs correction or alternative approach
4. **needs_escalation**: Requires immediate medical attention or specialist review

## Project Structure
```
├── client/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Layout.tsx              # Main layout with sidebar navigation
│   │   │   ├── PatientCard.tsx         # Patient info card
│   │   │   ├── ReviewBadge.tsx         # Review decision status badge
│   │   │   ├── ReviewTimeline.tsx      # Chronological interaction history
│   │   │   ├── ReviewSubmissionForm.tsx # Provider review form
│   │   │   └── StatCard.tsx            # Dashboard statistics card
│   │   ├── pages/          # Main application pages
│   │   │   ├── Dashboard.tsx           # Main dashboard with stats
│   │   │   ├── Patients.tsx            # Patient list with search
│   │   │   ├── PatientDetail.tsx       # Individual patient profile
│   │   │   ├── Reviews.tsx             # Review workbench
│   │   │   └── Analytics.tsx           # Future analytics (placeholder)
│   │   └── lib/            # Utilities
│   │       └── queryClient.ts          # TanStack Query configuration
├── server/
│   ├── db.ts              # Database connection (Drizzle + Neon)
│   ├── storage.ts         # Database operations (CRUD interface)
│   ├── routes.ts          # API endpoints
│   └── seed.ts            # Sample data generation
├── shared/
│   └── schema.ts          # Shared database schema and types
└── design_guidelines.md   # UI/UX design specifications
```

## Technology Stack
- **Frontend**: React, TypeScript, Wouter (routing), TanStack Query (data fetching)
- **UI Library**: shadcn/ui + Radix UI + Tailwind CSS
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Validation**: Zod

## API Endpoints

### Statistics
- `GET /api/stats` - Dashboard statistics (pending reviews, escalations, active patients, avg response time)

### Patients
- `GET /api/patients` - List all patients with stats
- `GET /api/patients/:id` - Get patient with children
- `POST /api/patients` - Create new patient

### Children
- `POST /api/children` - Create new child record

### AI Interactions
- `GET /api/interactions` - All interactions with details
- `GET /api/interactions/recent` - 10 most recent interactions
- `GET /api/interactions/:patientId` - All interactions for a patient
- `POST /api/interactions` - Create new interaction

### Provider Reviews
- `POST /api/reviews` - Submit provider review

## User Preferences
- **Design Priority**: Clean, professional clinical interface with high information density
- **Focus**: Minimal, efficient, task-oriented dashboard
- **No Authentication**: Not implemented yet (planned for future)
- **No Escalation Actions**: Not implemented yet (planned for future)
- **No Text Messaging**: Not implemented yet (planned for future)

## Recent Changes (October 27, 2025)

### Initial Implementation
1. Implemented complete database schema with Drizzle ORM
2. Added PostgreSQL enum for reviewDecision to enforce valid values
3. Built all frontend components following clinical design guidelines
4. Created comprehensive API layer with validation
5. Added seed data for testing and development
6. Fixed TanStack Query implementation to properly handle dynamic routes
7. Added data-testid attributes for E2E testing support
8. **Vital Branding Integration**:
   - Updated color palette to Vital's yellow/coral/neutral scheme
   - Switched to Geist typography (Google Fonts)
   - Added Vital wave mark logo and wordmark to sidebar
   - Ensured WCAG AA compliance (dark text on bright yellow/coral accents)
   - Updated ReviewBadge with Vital color semantics (yellow=agree, teal=agree with thoughts, coral=needs escalation)
   - Applied Bauhaus minimalism principles throughout UI

### UX Improvements (Completed Today)
1. **Fixed Critical Navigation Bug**: ReviewWorkbench page now properly displays sidebar navigation by wrapping component in Layout
2. **Dashboard Redesign**: Eliminated redundancy with distinct action cards and yellow primary buttons
3. **Enhanced Metrics**: Added agrees/disagrees counts to dashboard for better review outcome visibility
4. **Provider Identity**: Replaced Vital logo with Dr. Sarah Chen's avatar (initials "SC") in sidebar
5. **Fixed Transparency Issues**: Applied CSS overrides with !important to ensure solid backgrounds on all dropdowns and popups
6. **Clickable Phone Numbers**: All phone numbers now use tel: protocol for direct SMS/calling functionality
7. **Patient List Hierarchy**: Patient cards now display child names as primary with parent info as secondary
8. **Monospace Typography**: Extended monospace font usage to all technical data (MRN, ICD-10 codes, timestamps, IDs)
9. **Status Legend**: Added color-coded legend on Patients page clarifying urgency levels (green=Active, amber=Review Pending, red=Escalated)
10. **Route Enhancement**: Added /review-workbench as alternate route to ReviewWorkbench component

## Running the Project
```bash
# Start development server (frontend + backend)
npm run dev

# Push database schema changes
npm run db:push

# Seed database with sample data
npx tsx server/seed.ts
```

## Future Enhancements (Not in MVP)
1. Provider authentication and authorization
2. Escalation workflow with notifications
3. Analytics dashboard for performance metrics
4. Text messaging integration for provider-parent communication
5. Search and filtering for reviews
6. Export functionality for compliance/audit reporting
7. Real-time updates via WebSockets

## Design Philosophy
Following Carbon Design System and Material Design principles adapted for clinical workflows:
- Information density prioritized over visual flourish
- Scannable layouts for rapid decision-making
- Professional, trustworthy aesthetic
- Minimal clicks, maximum context visibility
- Proper color contrast and accessibility (WCAG 2.1 AA)

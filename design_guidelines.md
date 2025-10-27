# Design Guidelines: Vital Provider Dashboard

## Design Approach

**Selected Approach:** Bauhaus-Inspired Functional Design

This dashboard follows **Vital's Bauhaus-inspired design philosophy**: "Designed for care, built for trust." Drawing from the Bauhaus movement's emphasis on clarity, precision, and utility, the design strips away the ornamental and unnecessary, prioritizing function over flash.

**Key Design Principles:**
1. **Information Hierarchy First:** Critical medical data must be immediately scannable
2. **Cognitive Load Reduction:** Clean layouts that support rapid decision-making
3. **Clinical Credibility:** Professional, trustworthy aesthetic appropriate for healthcare
4. **Workflow Efficiency:** Minimize clicks, maximize context visibility

---

## Core Design Elements

### A. Typography

**Font Family (Vital Brand):**
- Primary: Geist (via Google Fonts CDN) - Designed for clarity, holds up in small sizes, reads smoothly in longer blocks
- Monospace: Geist Mono (for IDs, timestamps, codes)

**Type Scale:**
- Page Headers: text-2xl (24px), font-semibold
- Section Headers: text-lg (18px), font-semibold  
- Body Text: text-sm (14px), font-normal
- Labels/Metadata: text-xs (12px), font-medium, uppercase tracking-wide
- Patient/Provider Names: text-base (16px), font-medium
- Timestamps/IDs: text-xs (12px), font-mono

**Hierarchy Rules:**
- Medical provider actions (reviews) use font-medium for emphasis
- AI interaction summaries use font-normal
- Critical status indicators use font-semibold
- All-caps labels for field names (e.g., "REVIEWED BY", "STATUS")

### B. Layout System

**Spacing Units:** Tailwind primitives of **2, 4, 6, and 8** (p-2, h-8, gap-6, mt-4)

**Grid Structure:**
- Sidebar navigation: Fixed 64px width (w-16) for icon-only nav
- Main content area: max-w-7xl with px-6
- Card layouts: gap-4 between cards
- Section padding: py-6 px-4 for cards, py-8 for page sections
- List items: py-3 px-4 for review entries

**Layout Patterns:**
- Two-column dashboard: Sidebar (navigation) + Main content area
- Three-column detail view: Patient summary (25%) + Review timeline (50%) + Actions panel (25%)
- Stack on mobile: All columns collapse to single column below md breakpoint

### C. Component Library

#### **Navigation**
- Icon-only vertical sidebar with tooltips on hover
- Icons: Home, Patients, Reviews, Analytics (Font Awesome via CDN)
- Active state: subtle left border accent
- Fixed position, full height

#### **Patient Profile Cards**
- Compact header: Patient name, DOB, MRN (Medical Record Number)
- Status badges: Active, Review Pending, Escalated
- Quick stats: Total interactions, Last review date
- Click to expand full profile
- Border-l-4 for status color coding (no color specification, just structure)

#### **Review Timeline**
- Chronological list, most recent first
- Each entry contains:
  - Timestamp (font-mono, text-xs)
  - AI Interaction summary (collapsed by default, expand to full)
  - Provider name + review decision badge
  - Optional provider notes section
- Expandable/collapsible accordion pattern
- Dividers between entries using border-b

#### **Review Decision Badges**
- Pill-shaped: rounded-full px-3 py-1 text-xs font-semibold
- Types: Agree, Agree w/ Thoughts, Disagree, Needs Escalation
- Each type has distinct border style (to be colored later)

#### **Action Panels**
- Sticky positioning on longer pages
- Quick action buttons: New Review, Export Record, Print
- Contextual information cards (Provider on call, Escalation queue count)

#### **Data Tables** (for analytics/review lists)
- Compact row height: py-2
- Sticky header: position-sticky top-0
- Zebra striping with subtle background differentiation
- Sortable columns (chevron icon indicators)
- Row hover states for interaction feedback

#### **Forms** (for review submission)
- Single-column layout, max-w-2xl
- Label above input pattern
- Radio buttons for review decisions (large click targets)
- Textarea for provider notes: min-h-32
- Submit button: prominent, full-width on mobile

#### **Empty States**
- Centered content with icon (from Font Awesome)
- Descriptive text: "No reviews pending"
- CTA button where appropriate

### D. Interactions & States

**Micro-interactions:**
- Card hover: subtle shadow elevation increase
- Button press: transform scale-95
- Checkbox/radio: smooth transition on check
- Accordion expand: height transition, duration-200

**Loading States:**
- Skeleton screens for data tables
- Spinner for action buttons after click
- Progress indicator for bulk operations

**Focus States:**
- High-contrast focus rings: ring-2 ring-offset-2
- Keyboard navigation clearly visible
- Skip-to-content link for accessibility

---

## Page-Specific Layouts

### Dashboard Home
- Top stats bar: 4 columns (lg:grid-cols-4, md:grid-cols-2)
  - Reviews pending, Escalations, Avg response time, Active patients
- Recent reviews list: max 10 entries
- Quick filters: Status dropdown, Date range picker
- No hero image (data-first interface)

### Patient Detail View
Three-panel layout (desktop):
- **Left panel (w-1/4):** Patient demographics, contact info, insurance (if applicable)
- **Center panel (w-1/2):** Review timeline with full interaction history
- **Right panel (w-1/4):** Quick actions, current status, assigned provider

Stack vertically on mobile.

### Review Submission Interface
- Modal overlay OR dedicated page (engineer's choice based on workflow)
- AI interaction displayed in read-only card at top
- Review form below with clear decision options
- Auto-save draft functionality (visual indicator)

---

## Images

**No hero images** - This is a clinical data interface where information density takes priority over visual marketing elements.

**Icons Only:**
- Status indicators (checkmark, alert triangle, info circle)
- Navigation icons (dashboard, user, clipboard)
- Action buttons (edit, delete, expand)
- All via Font Awesome CDN

---

## Accessibility

- WCAG 2.1 AA minimum contrast (will be verified with color implementation)
- All interactive elements keyboard accessible
- ARIA labels for icon-only buttons
- Form inputs have associated labels (visible or aria-label)
- Table headers properly scoped
- Status information conveyed beyond color alone (text + icon)

---

## Technical Notes

- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Use CSS Grid for page layouts, Flexbox for component internals
- Sticky positioning for navigation and table headers
- Print stylesheet considerations for EMR export
- Session timeout warning for HIPAA compliance

This design creates a professional, efficient clinical workspace that prioritizes provider productivity and medical data integrity.
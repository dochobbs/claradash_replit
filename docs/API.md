# API Documentation

Complete reference for CareAgentDashboard REST API endpoints.

## Base URL

```
http://localhost:5000/api
```

## Authentication

⚠️ **Current Status**: No authentication is currently implemented. This is a security issue that must be addressed before production use.

All endpoints are currently public and unprotected.

## Response Format

### Success Response
```json
{
  "data": {},
  "status": "success"
}
```

### Error Response
```json
{
  "error": "Error message description",
  "status": "error"
}
```

## Endpoints

### Statistics & Analytics

#### Get Dashboard Statistics
```
GET /api/stats
```

Returns overview statistics for the dashboard.

**Response:**
```json
{
  "reviewsPending": 5,
  "escalations": 2,
  "activePatients": 15,
  "avgResponseTime": "23m",
  "agreesCount": 42,
  "disagreesCount": 8
}
```

**Use Case**: Dashboard overview cards
**Refetch Interval**: 30 seconds (configurable)

---

#### Get Analytics Data
```
GET /api/analytics
```

Returns data for analytics charts and metrics.

**Response:**
```json
{
  "reviewOutcomes": [
    { "name": "Agree", "value": 42, "color": "#FFD54F" },
    { "name": "Agree with Thoughts", "value": 18, "color": "#26A69A" },
    { "name": "Disagree", "value": 8, "color": "#FF6B6B" },
    { "name": "Needs Escalation", "value": 5, "color": "#EF5350" }
  ],
  "timeMetrics": [
    {
      "name": "Mon",
      "waitTime": 12,
      "reviewTime": 8,
      "escalationTime": 35
    }
  ],
  "stats": {
    "totalReviews": 73,
    "avgWaitTime": 15,
    "avgReviewTime": 8,
    "avgEscalationTime": 45
  }
}
```

**Use Case**: Analytics page charts
**Note**: Time metrics are currently simulated

---

#### Get Badge Counts
```
GET /api/stats/badges
```

Returns count data for sidebar badges.

**Response:**
```json
{
  "reviewsPending": 5,
  "escalationsActive": 2,
  "messagesUnread": 3
}
```

**Use Case**: Sidebar badge updates
**Refetch Interval**: 30 seconds

---

### Patients

#### List All Patients
```
GET /api/patients
```

Returns all patients with their children and status information.

**Query Parameters:**
- `limit` (optional): Number of results to return (default: all)
- `offset` (optional): Number of results to skip for pagination

**Response:**
```json
[
  {
    "id": "pat-1",
    "name": "Sarah Johnson",
    "email": "sarah.johnson@email.com",
    "phone": "415-555-0123",
    "preferredPharmacy": "CVS Pharmacy #4521",
    "children": [
      {
        "id": "child-1",
        "name": "Emma Johnson",
        "dateOfBirth": "2019-05-15",
        "medicalRecordNumber": "MRN-2019-0515"
      }
    ],
    "interactionCount": 3,
    "lastReviewDate": "2024-10-30T14:32:00Z",
    "status": "active"
  }
]
```

**Status Values**: "active", "review_pending", "escalated"

---

#### Get Patient Details
```
GET /api/patients/:id
```

Returns detailed information for a specific patient.

**Parameters:**
- `id` (required): Patient ID (UUID)

**Response:**
```json
{
  "id": "pat-1",
  "name": "Sarah Johnson",
  "email": "sarah.johnson@email.com",
  "phone": "415-555-0123",
  "preferredPharmacy": "CVS Pharmacy #4521",
  "createdAt": "2024-10-20T10:00:00Z",
  "children": [
    {
      "id": "child-1",
      "name": "Emma Johnson",
      "dateOfBirth": "2019-05-15",
      "medicalRecordNumber": "MRN-2019-0515",
      "currentWeight": 60.5
    }
  ]
}
```

**Error Codes:**
- `404 Not Found`: Patient does not exist

---

#### Create Patient
```
POST /api/patients
```

Creates a new patient record.

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john.smith@email.com",
  "phone": "415-555-0999",
  "preferredPharmacy": "Walgreens #123"
}
```

**Response:** `201 Created`
```json
{
  "id": "pat-new",
  "name": "John Smith",
  "email": "john.smith@email.com",
  "phone": "415-555-0999",
  "preferredPharmacy": "Walgreens #123",
  "createdAt": "2024-10-30T15:00:00Z"
}
```

**Error Codes:**
- `400 Bad Request`: Invalid data or missing required fields
- `409 Conflict`: Email already exists (emails are unique)

---

### Children (Dependents)

#### Create Child
```
POST /api/children
```

Adds a child/dependent to a patient record.

**Request Body:**
```json
{
  "patientId": "pat-1",
  "name": "Emma Johnson",
  "dateOfBirth": "2019-05-15",
  "medicalRecordNumber": "MRN-2019-0515",
  "currentWeight": 60.5
}
```

**Response:** `201 Created`
```json
{
  "id": "child-1",
  "patientId": "pat-1",
  "name": "Emma Johnson",
  "dateOfBirth": "2019-05-15",
  "medicalRecordNumber": "MRN-2019-0515",
  "currentWeight": "60.50",
  "createdAt": "2024-10-30T15:00:00Z"
}
```

**Error Codes:**
- `400 Bad Request`: Invalid data
- `409 Conflict`: Medical record number already exists (MRN is unique)

---

#### Get Child Medical Data
```
GET /api/children/:id/medical
```

Returns medical information for a child.

**Parameters:**
- `id` (required): Child ID (UUID)

**Response:**
```json
{
  "medications": [
    {
      "id": "med-1",
      "name": "Amoxicillin",
      "dosage": "250mg",
      "frequency": "Every 8 hours",
      "startDate": "2024-10-25",
      "endDate": "2024-11-01",
      "active": true
    }
  ],
  "allergies": [
    {
      "id": "allergy-1",
      "allergen": "Penicillin",
      "reaction": "Rash",
      "severity": "moderate"
    }
  ],
  "problemList": [
    {
      "id": "prob-1",
      "condition": "Acute otitis media",
      "icd10Code": "H66.001",
      "status": "active",
      "onsetDate": "2024-10-25"
    }
  ]
}
```

---

### AI Interactions

#### List AI Interactions
```
GET /api/interactions
```

Returns all AI interactions awaiting or completed reviews.

**Response:**
```json
[
  {
    "id": "int-1",
    "childId": "child-1",
    "patientId": "pat-1",
    "parentConcern": "Emma has had a persistent cough for 3 days...",
    "aiResponse": "Based on symptoms: likely viral upper respiratory infection...",
    "urgencyLevel": "routine",
    "reviews": [
      {
        "id": "rev-1",
        "reviewDecision": "agree",
        "providerName": "Dr. Chen",
        "providerNotes": "Appropriate triage advice for viral URI..."
      }
    ]
  }
]
```

---

#### Get Recent Interactions
```
GET /api/interactions/recent
```

Returns the most recent AI interactions (default: 10).

**Query Parameters:**
- `limit` (optional): Number of results to return (default: 10)

**Response:** Array of interaction objects (same schema as `/api/interactions`)

---

#### Get Patient Interactions
```
GET /api/interactions/:patientId
```

Returns all AI interactions for a specific patient.

**Parameters:**
- `patientId` (required): Patient ID (UUID)

**Response:** Array of interaction objects

---

#### Create AI Interaction
```
POST /api/interactions
```

Creates a new AI interaction (typically from Clara after a parent query).

**Request Body:**
```json
{
  "childId": "child-1",
  "patientId": "pat-1",
  "parentConcern": "Child has fever of 101.5°F and complains of ear pain",
  "aiResponse": "Symptoms consistent with possible otitis media...",
  "urgencyLevel": "moderate",
  "aiSummary": "Possible acute otitis media, recommend evaluation",
  "claraRecommendations": "Schedule appointment within 24 hours"
}
```

**Response:** `201 Created`
```json
{
  "id": "int-new",
  "childId": "child-1",
  "patientId": "pat-1",
  "parentConcern": "Child has fever...",
  "aiResponse": "Symptoms consistent...",
  "urgencyLevel": "moderate",
  "createdAt": "2024-10-30T15:00:00Z",
  "queuedAt": "2024-10-30T15:00:00Z"
}
```

**Urgency Levels**: "routine", "moderate", "urgent", "critical"

---

### Provider Reviews

#### Create Review
```
POST /api/reviews
```

Submits a provider's review/decision on an AI interaction.

**Request Body:**
```json
{
  "interactionId": "int-1",
  "providerName": "Dr. Sarah Chen",
  "reviewDecision": "agree_with_thoughts",
  "providerNotes": "Agree with assessment. Patient has history of recurrent otitis, should follow up in 48 hours.",
  "icd10Code": "H66.001",
  "snomedCode": "79341005"
}
```

**Response:** `201 Created`
```json
{
  "id": "rev-1",
  "interactionId": "int-1",
  "providerName": "Dr. Sarah Chen",
  "reviewDecision": "agree_with_thoughts",
  "providerNotes": "Agree with assessment...",
  "icd10Code": "H66.001",
  "snomedCode": "79341005",
  "createdAt": "2024-10-30T15:30:00Z"
}
```

**Decision Options:**
- `agree`: Provider fully agrees with AI recommendation
- `agree_with_thoughts`: Provider agrees but has additional notes
- `disagree`: Provider disagrees with recommendation
- `needs_escalation`: Requires escalation to specialist/higher level

**Error Codes:**
- `400 Bad Request`: Invalid decision type or missing required fields

---

### Escalations

#### List Escalations
```
GET /api/escalations
```

Returns all active and recent escalations.

**Response:**
```json
[
  {
    "id": "esc-1",
    "interactionId": "int-2",
    "initiatedBy": "provider",
    "status": "phone_call",
    "severity": "urgent",
    "reason": "Child fever not responding to home management",
    "createdAt": "2024-10-30T14:00:00Z",
    "resolvedAt": null,
    "messages": [
      {
        "id": "msg-1",
        "senderId": "pat-1",
        "senderType": "parent",
        "content": "We've been managing her at home with Tylenol every 4 hours",
        "createdAt": "2024-10-30T14:15:00Z"
      }
    ]
  }
]
```

---

#### Update Escalation
```
PATCH /api/escalations/:id
```

Updates escalation status and details.

**Parameters:**
- `id` (required): Escalation ID (UUID)

**Request Body:**
```json
{
  "status": "resolved",
  "resolvedAt": "2024-10-30T16:00:00Z"
}
```

**Status Options**: "pending", "texting", "phone_call", "video_call", "resolved"

**Response:**
```json
{
  "id": "esc-1",
  "status": "resolved",
  "resolvedAt": "2024-10-30T16:00:00Z"
}
```

---

### Messages

#### Create Message
```
POST /api/messages
```

Sends a message during an escalation.

**Request Body:**
```json
{
  "escalationId": "esc-1",
  "senderId": "pat-1",
  "senderType": "parent",
  "content": "Thank you for your advice. Emma's fever has come down to 99.2°F"
}
```

**Response:** `201 Created`
```json
{
  "id": "msg-2",
  "escalationId": "esc-1",
  "senderId": "pat-1",
  "senderType": "parent",
  "content": "Thank you for your advice...",
  "createdAt": "2024-10-30T16:15:00Z",
  "isRead": false
}
```

**Sender Type**: "parent" | "provider"

---

### Data Initialization

#### Initialize Sample Data
```
POST /api/initialize-data
```

Populates the database with sample data for development/testing.

**Security Note**: This endpoint should be removed or protected in production.

**Response:**
```json
{
  "message": "Sample data initialized successfully",
  "stats": {
    "patients": 3,
    "children": 3,
    "interactions": 3,
    "reviews": 2
  }
}
```

**Error Codes:**
- `400 Bad Request`: Database already contains data (prevents duplicates)

---

### Clara AI Chat

#### Send Chat Message
```
POST /api/clara/chat
```

Sends a message to Clara AI assistant and receives a response.

**Request Body:**
```json
{
  "message": "What are the red flags for meningitis in a 5-year-old?"
}
```

**Response:**
```json
{
  "response": "Red flags for meningitis in children include: high fever with stiff neck, severe headache, sensitivity to light, petechial rash, altered mental status, and poor feeding. Any combination warrants immediate medical evaluation..."
}
```

**Rate Limiting**: None currently (should be added)
**Model**: gpt-4.1-mini via OpenAI API

**Error Codes:**
- `400 Bad Request`: Message is required
- `500 Internal Server Error`: AI service unavailable

---

## Error Handling

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid data or validation error |
| 404 | Not Found - Resource does not exist |
| 409 | Conflict - Resource already exists (e.g., duplicate email) |
| 500 | Internal Server Error - Server error occurred |

### Error Response Format

```json
{
  "error": "Descriptive error message"
}
```

---

## Rate Limiting

⚠️ **Current Status**: No rate limiting is currently implemented. Recommended limits:

- `/api/stats*`: 1 request per 10 seconds per IP
- `/api/patients`: 100 requests per hour per IP
- `/api/clara/chat`: 10 requests per minute per provider
- All other endpoints: 100 requests per minute per IP

---

## Pagination

⚠️ **Current Status**: Pagination is not yet implemented. Recommended:

```
GET /api/patients?limit=20&offset=0
GET /api/interactions?limit=50&offset=100
```

---

## Caching

Currently, caching is handled client-side via React Query with:
- 30-second refetch interval for stats
- Full cache invalidation on mutations

Recommended additions:
- Redis caching for analytics data
- ETag support for client caching
- Cache invalidation strategies

---

## Versioning

Current API version: v1 (implicit)

Recommended practice: Add `/api/v1/` prefix to all endpoints for future compatibility.

---

## Testing API Endpoints

### Using cURL

```bash
# Get dashboard stats
curl http://localhost:5000/api/stats

# Create a patient
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-0123"
  }'

# Get patient details
curl http://localhost:5000/api/patients/pat-1
```

### Using Postman

Import collection from: (Not yet created - add Postman export in future)

---

## Changelog

### v1.0.0 (Current)
- Initial API release
- All core endpoints implemented
- No authentication
- No rate limiting
- No pagination

---

## Security Considerations

### ⚠️ Critical Issues

1. **No Authentication**: All endpoints are public
2. **No Authorization**: No role-based access control
3. **No Audit Logging**: Data access is not logged
4. **HIPAA Non-Compliant**: Patient health data is unencrypted and unprotected

### Before Production Use

See [SECURITY.md](./SECURITY.md) for required security implementations.

---

## Support

For API questions or issues:
- Check [API.md](./API.md) for endpoint documentation
- Review example requests in this document
- Check server logs for detailed error information
- Open an issue on GitHub

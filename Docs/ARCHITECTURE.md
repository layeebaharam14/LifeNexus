# LIFENEXUS --- System Architecture

## 1. Architecture Goal

LIFENEXUS should transform unstructured personal files into a
structured, connected personal memory system.

High-level pipeline:

``` text
User
 ↓
Web UI
 ↓
Authentication
 ↓
Upload / Import
 ↓
File Processing
 ↓
Text / Image Extraction
 ↓
AI Understanding
 ↓
Entities + Events + Relationships
 ↓
Personal Knowledge Store
 ↓
 ┌───────────────┬────────────────┬────────────────┐
 ↓               ↓                ↓
Search          Graph          Timeline
 ↓               ↓                ↓
Answer          Explore         Remember
```

------------------------------------------------------------------------

## 2. High-Level Application Flow

``` text
Landing
  ↓
Authentication
  ↓
Dashboard
  ↓
Import
  ↓
Processing Queue
  ↓
Knowledge Extraction
  ↓
Knowledge Graph + Timeline
  ↓
Search / Insights
```

------------------------------------------------------------------------

## 3. Recommended MVP Technology Stack

The exact stack can be adjusted to the team's fastest tools, but the
recommended web MVP is:

### Frontend

-   React
-   Vite
-   TypeScript
-   Tailwind CSS or equivalent styling system
-   React Router
-   A graph visualization library
-   A chart/timeline visualization approach

### Backend

-   Node.js
-   Express
-   TypeScript where practical

### Database

For speed, use one of:

-   MongoDB
-   PostgreSQL

Recommended for a fast MVP:

**MongoDB** if storing flexible extracted entities/metadata.

### AI / Processing

-   LLM API for extraction and question answering.
-   OCR for image/scanned content.
-   PDF text extraction for digital PDFs.

The AI provider should be abstracted behind a service layer so it can be
replaced later.

### Deployment

Choose the fastest stable deployment available to the team.

Potential structure:

-   Frontend → Vercel/Render/static host
-   Backend → Render or equivalent
-   Database → managed database

The deployment provider is not part of the product concept and can be
changed without changing the architecture.

------------------------------------------------------------------------

## 4. Logical Components

### 4.1 Authentication Service

Responsibilities:

-   Registration
-   Login
-   Session/token handling
-   Logout
-   User isolation

Every user-owned record must contain a user identifier.

------------------------------------------------------------------------

### 4.2 File Ingestion Service

Responsibilities:

-   Receive upload.
-   Validate file type.
-   Store file metadata.
-   Create processing record.
-   Send file to processing pipeline.

Example metadata:

``` text
documentId
userId
fileName
fileType
uploadedAt
processingStatus
sourceType
```

------------------------------------------------------------------------

### 4.3 Extraction Service

Different sources require different extraction paths.

``` text
PDF
 ↓
PDF text extraction
 ↓
Text

Image
 ↓
OCR
 ↓
Text

TXT
 ↓
Direct read
 ↓
Text
```

The system should preserve both:

-   Original source
-   Extracted text

------------------------------------------------------------------------

## 5. AI Understanding Pipeline

``` text
Extracted text
      ↓
Document classification
      ↓
Entity extraction
      ↓
Event extraction
      ↓
Relationship extraction
      ↓
Temporal normalization
      ↓
Structured knowledge
```

### Entities

Examples:

-   Laptop
-   User
-   Company
-   College
-   Certificate
-   Invoice
-   Warranty
-   Hotel
-   Flight

### Events

Examples:

-   purchased
-   repaired
-   received
-   attended
-   travelled
-   completed
-   subscribed
-   renewed

### Relationships

Examples:

``` text
Invoice → describes → Laptop purchase

Warranty → covers → Laptop

Repair receipt → refers_to → Laptop

Certificate → awarded_to → User

Travel ticket → represents → Trip
```

------------------------------------------------------------------------

## 6. Personal Knowledge Graph

A graph can be represented conceptually as:

``` text
Node
{
  id,
  userId,
  type,
  name,
  attributes,
  sourceIds
}

Edge
{
  id,
  userId,
  fromNode,
  toNode,
  relationship,
  confidence,
  sourceIds
}
```

The `userId` boundary is essential for data isolation.

------------------------------------------------------------------------

## 7. Timeline Model

A timeline event can contain:

``` text
{
  id,
  userId,
  title,
  description,
  date,
  datePrecision,
  entityIds,
  sourceIds,
  eventType
}
```

`datePrecision` can distinguish:

-   exact date
-   month
-   year
-   approximate/unknown

This prevents false precision.

------------------------------------------------------------------------

## 8. Search Architecture

User:

> "Everything related to my laptop."

Pipeline:

``` text
Query
 ↓
Query understanding
 ↓
Entity identification
 ↓
Knowledge graph lookup
 ↓
Document retrieval
 ↓
Relevant context
 ↓
LLM answer generation
 ↓
Source mapping
 ↓
UI response
```

The answer should be generated from retrieved user-owned context.

------------------------------------------------------------------------

## 9. Retrieval Strategy

For the MVP, use a hybrid approach:

### Structured retrieval

Search:

-   entity names
-   dates
-   document types
-   amounts
-   relationships

### Semantic retrieval

Use embeddings/vector search if available.

### Source retrieval

Return the original document/source identifiers.

The system should avoid answering from unsupported general knowledge
when the user asks about their personal data.

------------------------------------------------------------------------

## 10. Suggested Data Model

### User

``` text
User
 ├── id
 ├── name
 ├── email
 ├── passwordHash / authProviderId
 └── createdAt
```

### Document

``` text
Document
 ├── id
 ├── userId
 ├── fileName
 ├── mimeType
 ├── storagePath
 ├── extractedText
 ├── processingStatus
 └── createdAt
```

### Entity

``` text
Entity
 ├── id
 ├── userId
 ├── type
 ├── name
 ├── attributes
 └── sourceIds
```

### Relationship

``` text
Relationship
 ├── id
 ├── userId
 ├── sourceEntityId
 ├── targetEntityId
 ├── type
 ├── confidence
 └── sourceIds
```

### TimelineEvent

``` text
TimelineEvent
 ├── id
 ├── userId
 ├── title
 ├── description
 ├── date
 ├── eventType
 └── sourceIds
```

------------------------------------------------------------------------

## 11. Recommended Project Structure

``` text
lifenexus/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── auth/
│   │   │   ├── ingestion/
│   │   │   ├── extraction/
│   │   │   ├── ai/
│   │   │   ├── graph/
│   │   │   └── search/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── config/
│   └── ...
│
├── sample-data/
│
├── docs/
│
├── README.md
└── .gitignore
```

Do not create unnecessary folders. Keep the architecture understandable.

------------------------------------------------------------------------

## 12. Security and Privacy

Minimum requirements:

-   Never expose one user's records to another user.
-   Authenticate protected routes.
-   Never commit API keys.
-   Use environment variables.
-   Validate uploads.
-   Restrict file size and accepted types.
-   Avoid logging raw personal documents.
-   Use synthetic demo data.
-   Clearly communicate what the prototype stores.
-   Do not expose uploaded files through public URLs unless intended.

------------------------------------------------------------------------

## 13. AI Reliability

AI-generated relationships are not automatically facts.

Store:

-   Source document IDs
-   Evidence snippets where possible
-   Confidence values
-   Date precision
-   Extraction status

UI wording should distinguish:

**Source-backed fact**

from

**AI-derived relationship**

Example:

> "This warranty appears to be associated with the laptop based on the
> matching serial number."

rather than:

> "This warranty definitely belongs to the laptop."

------------------------------------------------------------------------

## 14. Performance Strategy for the Hackathon

Do not build a heavy distributed architecture.

For the MVP:

``` text
Frontend
   ↓
Single backend
   ↓
Database
   ↓
AI service
```

Process files sequentially or with a small queue.

Cache extracted information.

Do not repeatedly send the same document to the AI service.

------------------------------------------------------------------------

## 15. Architecture for Future Local AI

The AI service should be abstracted:

``` text
AIService
   ├── CloudLLMProvider
   └── LocalLLMProvider (future)
```

This keeps LIFENEXUS compatible with a future privacy-first/offline
version.

------------------------------------------------------------------------

## 16. Deployment Architecture

``` text
Browser
   ↓ HTTPS
Frontend Host
   ↓ API
Backend Host
   ↓
Database
   ↓
AI Provider
```

Uploaded files should be stored using an appropriate storage layer, with
access controlled by user identity.

------------------------------------------------------------------------

## 17. Failure Handling

If AI extraction fails:

``` text
Upload
 ↓
Extraction succeeds
 ↓
AI fails
 ↓
Document remains accessible
 ↓
Status = "Needs processing"
 ↓
Retry
```

Never make the entire user's workspace unusable because one file failed.

------------------------------------------------------------------------

## 18. Architecture Principle

The most important architecture principle is:

> **One personal data layer, multiple experiences.**

Life Search, Life Graph, Timeline and Insights should all read from the
same underlying knowledge model.

Do not build four independent systems.

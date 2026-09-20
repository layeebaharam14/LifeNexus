# LIFENEXUS --- Memory Architecture & AI Context

## 1. Purpose

This file defines how LIFENEXUS should represent, store, retrieve and
reason over a user's personal information.

The central concept is:

> **LIFENEXUS is a Personal Memory Engine, not merely a document
> chatbot.**

------------------------------------------------------------------------

# 2. What Is a Memory?

A memory is a useful piece of information extracted from or derived from
the user's digital material.

Examples:

-   A laptop was purchased.
-   A warranty expires in March 2027.
-   A certificate was received.
-   A trip occurred.
-   A subscription was started.
-   A project was completed.
-   A repair happened.
-   A person attended an event.

A memory should have provenance.

------------------------------------------------------------------------

# 3. Memory Types

## 3.1 Entity Memory

Represents a persistent thing.

Examples:

``` text
Laptop
Certificate
Person
Company
College
Subscription
Insurance
Project
Place
```

------------------------------------------------------------------------

## 3.2 Event Memory

Represents something that happened.

Examples:

``` text
Purchased laptop
Received certificate
Started internship
Completed project
Travelled to location
Repaired device
Renewed insurance
```

------------------------------------------------------------------------

## 3.3 Document Memory

Represents a source artifact.

Examples:

``` text
Invoice.pdf
Warranty.pdf
IMG_3847.jpg
Certificate.pdf
Ticket.png
```

------------------------------------------------------------------------

## 3.4 Temporal Memory

Represents when something happened.

Store:

-   exact date when known
-   month when only month is known
-   year when only year is known
-   date range when appropriate
-   unknown when unavailable

Never invent precision.

------------------------------------------------------------------------

## 3.5 Relationship Memory

Represents connections.

Examples:

``` text
Laptop
 ├── purchased_by → User
 ├── documented_by → Invoice
 ├── covered_by → Warranty
 └── repaired_by → Service Center
```

------------------------------------------------------------------------

# 4. Memory Record

Conceptual structure:

``` json
{
  "id": "memory_001",
  "userId": "user_001",
  "type": "event",
  "title": "Laptop purchased",
  "date": "2026-03-14",
  "datePrecision": "exact",
  "entities": ["Laptop", "User"],
  "sourceIds": ["invoice_001"],
  "evidence": "Laptop model ... purchased on ...",
  "confidence": 0.96
}
```

------------------------------------------------------------------------

# 5. Source of Truth

The original document/source is the evidence layer.

The memory graph is a structured interpretation of that evidence.

Therefore:

``` text
Original source
      ↓
Extraction
      ↓
Structured memory
      ↓
Graph / Timeline / Search
```

If there is disagreement:

**Original source wins.**

------------------------------------------------------------------------

# 6. Memory Creation Pipeline

``` text
File
 ↓
Text/OCR extraction
 ↓
Document classification
 ↓
Entity extraction
 ↓
Event extraction
 ↓
Temporal extraction
 ↓
Relationship extraction
 ↓
Normalization
 ↓
Deduplication
 ↓
Memory graph
```

------------------------------------------------------------------------

# 7. Entity Normalization

Different documents may refer to the same object differently.

Example:

``` text
ASUS Vivobook
Asus laptop
Vivobook
My laptop
```

The system should attempt to resolve them into the same entity when
sufficient evidence exists.

Possible signals:

-   serial number
-   model number
-   matching dates
-   matching owner
-   matching organization
-   semantic similarity

Do not merge entities solely because names are vaguely similar.

------------------------------------------------------------------------

# 8. Relationship Discovery

The system should discover relationships not explicitly organized by the
user.

Example:

### Source 1

``` text
Invoice
Serial number: ABC123
```

### Source 2

``` text
Warranty
Serial number: ABC123
```

### Source 3

``` text
Repair receipt
Device serial: ABC123
```

The system can infer:

``` text
Invoice ───┐
Warranty ──┼──→ Laptop ABC123
Repair ────┘
```

This is one of the primary LIFENEXUS differentiators.

------------------------------------------------------------------------

# 9. Confidence

Relationships should carry confidence.

Example:

``` text
0.98
Exact serial number match

0.91
Exact product + owner + purchase period

0.73
Semantic similarity + matching organization

0.42
Weak name similarity
```

Low-confidence relationships should not be presented as unquestionable
facts.

------------------------------------------------------------------------

# 10. Life Search Memory Flow

User asks:

> "Everything related to my laptop."

### Step 1

Identify target entity:

``` text
Laptop
```

### Step 2

Retrieve connected entities.

### Step 3

Retrieve source documents.

### Step 4

Retrieve relevant timeline events.

### Step 5

Generate concise answer.

### Step 6

Attach sources.

### Step 7

Offer:

**View Life Graph**

**View Timeline**

------------------------------------------------------------------------

# 11. Timeline Memory Flow

All events are normalized into a chronological representation.

Example:

``` text
March 2025
Certificate received

July 2025
Internship started

December 2025
Hackathon attended

March 2026
Laptop purchased
```

The timeline can be filtered by:

-   year
-   category
-   person
-   project
-   place
-   topic

------------------------------------------------------------------------

# 12. Memory Categories

Useful categories:

### Personal

-   People
-   Places
-   Important events

### Financial

-   Purchases
-   Bills
-   Subscriptions
-   Payments

### Education

-   Courses
-   Certificates
-   Exams
-   Projects
-   Internships

### Work

-   Projects
-   Employers
-   Documents
-   Milestones

### Travel

-   Flights
-   Hotels
-   Destinations
-   Dates

### Assets

-   Laptop
-   Phone
-   Vehicle
-   Appliances
-   Warranty

### Administrative

-   IDs
-   Insurance
-   Renewals
-   Contracts

------------------------------------------------------------------------

# 13. Memory Insights

The system can generate derived insights.

Examples:

### Upcoming

> "Your laptop warranty appears to expire in March 2027."

### Recurrence

> "Three subscription payments appear to repeat monthly."

### Milestone

> "You completed four certifications in 2025."

### Connection

> "These three documents appear to refer to the same laptop."

Insights must always be grounded in available data.

------------------------------------------------------------------------

# 14. Memory Search vs Chatbot

LIFENEXUS should NOT behave like a generic chatbot.

A generic chatbot:

``` text
Question
 ↓
LLM
 ↓
Text
```

LIFENEXUS:

``` text
Question
 ↓
Memory retrieval
 ↓
Knowledge graph
 ↓
Source documents
 ↓
Timeline
 ↓
LLM reasoning
 ↓
Source-backed answer
```

The graph and evidence layer are essential.

------------------------------------------------------------------------

# 15. Memory Privacy

Memory is personal.

Rules:

-   Each memory belongs to one user.
-   Source documents belong to that user.
-   Graph nodes are user-scoped.
-   Search is user-scoped.
-   Timeline is user-scoped.
-   Do not expose raw memories in logs.
-   Do not use real sensitive personal data for the public demo.

------------------------------------------------------------------------

# 16. Memory Deletion

If a user deletes a source document:

The system should ideally:

``` text
Delete source
 ↓
Identify dependent memories
 ↓
Remove or mark unsupported memories
 ↓
Update graph
 ↓
Update timeline
```

For the MVP, at minimum remove the source from the user's accessible
workspace.

------------------------------------------------------------------------

# 17. Memory Evolution

LIFENEXUS should eventually support:

``` text
New information
     ↓
Existing memory
     ↓
New evidence
     ↓
Update confidence
     ↓
Update relationships
     ↓
Update timeline
```

Example:

Old:

> Laptop warranty expires 2027.

New repair document:

> Warranty extended to 2028.

The system should update the memory rather than create contradictory
duplicates.

------------------------------------------------------------------------

# 18. Duplicate Detection

Potential duplicate documents:

-   same invoice uploaded twice
-   same screenshot in multiple folders
-   duplicate PDF

Use:

-   file hash
-   metadata
-   content similarity

Do not automatically delete duplicates in the MVP.

Mark them as possible duplicates if necessary.

------------------------------------------------------------------------

# 19. AI Context Rules

When sending context to an LLM:

Include only relevant information.

Example:

For:

> "When does my laptop warranty expire?"

Do not send the user's entire personal archive.

Retrieve:

-   laptop entity
-   warranty entity
-   relevant source
-   relevant date

This improves:

-   privacy
-   speed
-   cost
-   answer quality

------------------------------------------------------------------------

# 20. Explainability

Every major answer should allow:

**"Where did this come from?"**

Example:

> **Warranty expires March 2027.**

Sources:

-   `Laptop_Warranty.pdf`
-   Page 2
-   Extracted text: relevant clause

This makes the system more trustworthy.

------------------------------------------------------------------------

# 21. Memory Graph as the Core

The core relationship is:

``` text
Documents
   ↓
Memories
   ↓
Entities + Events + Relationships
   ↓
Personal Knowledge Graph
   ↓
 ┌───────────┬───────────┬───────────┐
 ↓           ↓           ↓
Search      Timeline    Insights
```

The UI can evolve.

The memory layer remains the foundation.

------------------------------------------------------------------------

# 22. Future Memory Features

Possible future capabilities:

-   Voice memory capture
-   Camera-based memory ingestion
-   Automatic photo/event grouping
-   Calendar integration
-   Email integration
-   Cloud-drive integration
-   Local/on-device AI
-   Semantic image understanding
-   Personal memory reminders
-   Family memory spaces
-   Cross-device memory synchronization
-   User-controlled memory editing
-   Memory confidence visualization

------------------------------------------------------------------------

# 23. Core Memory Principle

> **LIFENEXUS should remember connections, not just files.**

A file is an artifact.

A memory is the meaning extracted from that artifact.

A connected memory becomes useful knowledge.

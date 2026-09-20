# LIFENEXUS --- Product Requirements Document (PRD)

**Tagline:** *Everything you've done. Connected.*\
**Hackathon:** HACKDAY 1.0 --- Tech for a Better Tomorrow\
**Challenge Type:** Open Innovation\
**Build Window:** 20 September 2026, 9:00 AM--5:00 PM IST\
**MVP Goal:** Deliver a functional, polished prototype within the 8-hour
build window.

------------------------------------------------------------------------

## 1. Product Overview

LIFENEXUS is a **Personal Memory Engine** that turns a user's scattered
digital traces into a connected, searchable representation of their
life.

People accumulate photos, PDFs, receipts, notes, certificates, tickets,
warranties, bills, screenshots and other files across different places.
Important context becomes difficult to find, relationships between files
are rarely recorded, and meaningful life milestones are buried in
digital clutter.

LIFENEXUS allows a user to import these materials and uses AI to extract
entities, dates, events, amounts, relationships and useful metadata. It
then presents the information through:

1.  **Life Search** --- natural-language search across the user's
    personal information.
2.  **Life Graph** --- relationships between people, objects, documents,
    events and dates.
3.  **Life Timeline** --- a chronological reconstruction of meaningful
    events.
4.  **Personal Insights** --- useful cross-document discoveries such as
    upcoming expirations, recurring subscriptions, spending patterns and
    connected records.

The product is designed as a **privacy-conscious personal knowledge
system**, not simply another chatbot.

------------------------------------------------------------------------

## 2. Problem Statement

### The problem

Modern personal information is fragmented across:

-   Photos
-   Screenshots
-   PDFs
-   Receipts
-   Bills
-   Emails or exported email records
-   Notes
-   Certificates
-   Tickets
-   Warranties
-   Service records
-   Project files
-   Other personal documents

Users can often remember that they have information somewhere, but not
where it is, what it is connected to, or when it became relevant.

This creates three problems:

### 2.1 Retrieval problem

Finding one useful piece of information may require searching several
applications and folders.

### 2.2 Context problem

A document often has relationships to other documents that the user
never explicitly recorded.

Example:

A laptop invoice, warranty, repair receipt and service email may all
refer to the same laptop, but they exist as separate files.

### 2.3 Memory problem

Digital information accumulates faster than humans can organize it.
Important milestones and experiences can disappear into an enormous
archive.

------------------------------------------------------------------------

## 3. Product Vision

> **Give every person a searchable, connected memory of their own
> digital life.**

LIFENEXUS transforms unstructured digital traces into a structured
personal memory layer.

The long-term vision is:

**Import → Understand → Connect → Remember → Search → Discover**

------------------------------------------------------------------------

## 4. Theme Alignment --- Tech for a Better Tomorrow

LIFENEXUS directly supports the hackathon theme by addressing a growing
modern problem: digital information overload.

The project uses technology to make tomorrow easier by organizing
today's scattered information.

### Impact

-   Less time spent searching for personal information.
-   Easier access to warranties, bills, certificates and important
    dates.
-   Better awareness of personal milestones and achievements.
-   Easier discovery of relationships between seemingly unrelated
    records.
-   Better continuity of personal knowledge over time.
-   A foundation for privacy-conscious personal information management.

The key message:

> **Your digital life shouldn't become a pile of forgotten files.**

------------------------------------------------------------------------

## 5. Goals

### Primary goals

1.  Allow users to securely access their own LIFENEXUS workspace.
2.  Import multiple types of personal files.
3.  Extract useful information from documents and images.
4.  Automatically identify entities, events and relationships.
5.  Build a Personal Knowledge Graph.
6.  Provide natural-language Life Search.
7.  Build an automatically generated Life Timeline.
8.  Surface useful cross-document insights.
9.  Provide clear source references for generated answers.
10. Deliver a clean, responsive and impressive user experience.

### Secondary goals

-   Demonstrate privacy-conscious architecture.
-   Make the system explain where information came from.
-   Make the same underlying data useful through multiple views.
-   Keep the MVP extensible for future offline/local AI support.

------------------------------------------------------------------------

## 6. Non-Goals for the 8-Hour MVP

Do **not** attempt to build:

-   Full email-provider synchronization.
-   Full social-media integration.
-   Production-grade banking integrations.
-   Automatic access to private cloud accounts without explicit
    integration.
-   A general-purpose AI agent that can perform arbitrary actions.
-   Perfect OCR for every language and document type.
-   A production-scale recommendation engine.
-   Complex multi-tenant enterprise administration.
-   Advanced biometric authentication.
-   A complete mobile application.

These can be future extensions.

------------------------------------------------------------------------

## 7. Target Users

### Primary

**Students and young professionals**

They have:

-   Certificates
-   Project files
-   Receipts
-   Travel tickets
-   Notes
-   Screenshots
-   Internship records
-   Course documents
-   Personal purchases

### Secondary

**General individuals**

Anyone who wants to search and understand their digital information.

### Future

-   Families
-   Freelancers
-   Researchers
-   Professionals
-   Small teams
-   Personal knowledge-management users

------------------------------------------------------------------------

## 8. User Personas

### Persona A --- Student

Has hundreds of screenshots, certificates, project files and receipts.

Need:

> "When did I complete my first AI project?"

### Persona B --- Young professional

Has invoices, warranties, subscriptions and work-related records.

Need:

> "Show everything related to my laptop."

### Persona C --- General user

Has many documents but does not maintain a structured archive.

Need:

> "Which important things expire next month?"

------------------------------------------------------------------------

## 9. Core Features

### 9.1 Authentication

Simple account creation and login.

Purpose:

-   Isolate each user's workspace.
-   Protect personal information.
-   Establish the product's privacy-first model.

MVP:

-   Register
-   Login
-   Logout
-   Authenticated workspace

Avoid complex authentication providers unless setup is already
available.

------------------------------------------------------------------------

### 9.2 Personal Workspace

After authentication, the user sees:

-   Overview
-   Search
-   Timeline
-   Life Graph
-   Documents
-   Insights
-   Profile/Privacy

------------------------------------------------------------------------

### 9.3 Universal Import

Users can upload:

-   PDF
-   TXT
-   DOC/DOCX where supported
-   JPG/JPEG
-   PNG
-   Screenshots
-   Receipts
-   Certificates
-   Tickets
-   Warranty documents

Each uploaded item becomes a source record.

------------------------------------------------------------------------

### 9.4 Document Understanding

For each file, extract where possible:

-   Title
-   Document type
-   People
-   Organizations
-   Products
-   Places
-   Dates
-   Amounts
-   Contact information
-   Events
-   Identifiers
-   Important phrases
-   Relationships

The system must preserve the original file/source reference.

------------------------------------------------------------------------

### 9.5 Life Search

Natural-language queries such as:

-   "Everything related to my laptop."
-   "When did I last buy electronics?"
-   "What subscriptions am I paying for?"
-   "When does my insurance expire?"
-   "Show my travel spending last year."
-   "When did I start working on AI?"
-   "What certificates did I receive in 2025?"

Answers should contain:

1.  Direct answer.
2.  Relevant entities/events.
3.  Source documents.
4.  Dates/amounts when available.
5.  Confidence or uncertainty when useful.

------------------------------------------------------------------------

### 9.6 Life Graph

Visual graph of connected entities.

Example:

``` text
                 LAPTOP
                    |
       +------------+-------------+
       |            |             |
    Invoice      Warranty       Repair
       |            |             |
   ₹68,000       Mar 2027      Jul 2026
```

Nodes may represent:

-   Person
-   Product
-   Document
-   Organization
-   Place
-   Event
-   Date
-   Transaction
-   Certificate
-   Warranty

Edges represent relationships such as:

-   purchased
-   belongs_to
-   repaired
-   covered_by
-   occurred_on
-   related_to
-   paid_for
-   received
-   attended

------------------------------------------------------------------------

### 9.7 Life Timeline

Automatically group important events chronologically.

Example:

``` text
2025
 ├── Internship started
 ├── Hackathon attended
 └── Certification received

2026
 ├── AI project started
 ├── Laptop repaired
 └── New certification
```

Timeline events should link back to their source documents.

------------------------------------------------------------------------

### 9.8 Personal Insights

Useful derived information:

-   Upcoming warranty expirations
-   Upcoming certificate/ID expirations where represented in source data
-   Recurring subscriptions
-   Repeated purchases
-   Spending categories
-   Major milestones
-   Frequently referenced objects
-   Travel history
-   Learning milestones

Insights must be presented as **derived from available data**, not as
unsupported facts.

------------------------------------------------------------------------

### 9.9 Source Traceability

Every important answer should be traceable to source material.

Example:

> Laptop warranty expires in March 2027.\
> **Source:** Laptop_Warranty.pdf

This is important for trust.

------------------------------------------------------------------------

### 9.10 Privacy Center

MVP-level controls:

-   View imported item count
-   Delete a document
-   Clear workspace
-   Export data where feasible
-   Show what information is stored

------------------------------------------------------------------------

## 10. Example End-to-End User Flow

``` text
Landing Page
     ↓
Register / Login
     ↓
Personal Workspace
     ↓
Upload files
     ↓
Extraction + AI processing
     ↓
Entities + Events + Relationships
     ↓
Personal Knowledge Graph
     ↓
 ┌───────────────┬────────────────┬────────────────┐
 ↓               ↓                ↓
Life Search    Life Graph      Life Timeline
 ↓               ↓                ↓
Answers       Connections       Life Story
     \            |              /
      \           |             /
          Personal Insights
```

------------------------------------------------------------------------

## 11. Example Demo Dataset

For the hackathon demo, use **fictional/synthetic data**, not real
sensitive personal records.

Example:

1.  Laptop invoice
2.  Laptop warranty
3.  Laptop repair receipt
4.  Laptop service email export
5.  College certificate
6.  Internship certificate
7.  Flight ticket
8.  Hotel booking
9.  Grocery receipt
10. Subscription invoice
11. Hackathon certificate
12. Project document
13. Personal note
14. Course completion certificate
15. ID/insurance renewal notice

The files should intentionally contain cross-references so LIFENEXUS can
discover relationships.

------------------------------------------------------------------------

## 12. Success Criteria

A successful MVP should demonstrate:

-   Authentication works.
-   Files can be imported.
-   Files are processed.
-   Useful entities/events are extracted.
-   Relationships are created.
-   Natural-language search works.
-   Life Graph renders.
-   Life Timeline renders.
-   Answers show source references.
-   UI is responsive.
-   Application can be deployed.
-   GitHub repository is organized.
-   PPT can explain the project quickly.

------------------------------------------------------------------------

## 13. Hackathon Demo Story

The demo should begin with a messy set of unrelated files.

Then:

> "These files look unrelated. LIFENEXUS doesn't require the user to
> organize them manually."

Upload/process.

Ask:

> **"Tell me everything you know about my laptop."**

Show:

-   Invoice
-   Purchase date
-   Price
-   Warranty
-   Repair
-   Service record

Then switch to Timeline:

> **"Show me what happened."**

Then ask:

> **"What important things need my attention next month?"**

Show derived upcoming items.

Final message:

> **LIFENEXUS --- Everything you've done. Connected.**

------------------------------------------------------------------------

## 14. Future Scope

-   Local/on-device AI.
-   Direct email integration with permission.
-   Cloud-drive connectors with explicit user authorization.
-   Mobile camera ingestion.
-   Voice queries.
-   Automatic daily memory capture.
-   Semantic photo search.
-   Family/shared memory spaces.
-   Calendar integration.
-   Advanced temporal reasoning.
-   Personal knowledge graph editing.
-   Stronger privacy controls and encryption.
-   Cross-device synchronization.

------------------------------------------------------------------------

## 15. Hackathon Constraints

The hackathon provides:

-   8-hour build window.
-   AI tools allowed.
-   GitHub repository required.
-   Deployed link if available.
-   PPT required.

Therefore:

**Working MVP \> excessive feature count.**

The project must prioritize a reliable core experience over ambitious
unfinished integrations.

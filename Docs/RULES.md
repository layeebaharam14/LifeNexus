# LIFENEXUS --- Development Rules

## 1. Purpose

This document defines the rules that must be followed while building
LIFENEXUS.

The goal is to keep the project:

-   Consistent
-   Fast to develop
-   Maintainable
-   Secure
-   Demonstrable
-   Easy to extend

------------------------------------------------------------------------

# 2. General Principles

### Rule 1 --- MVP first

Always implement the smallest working version first.

Priority:

``` text
Working core
   ↓
Correct behavior
   ↓
Good UX
   ↓
Visual polish
   ↓
Nice-to-have features
```

Never sacrifice a working core feature for a flashy secondary feature.

------------------------------------------------------------------------

### Rule 2 --- Do not build unnecessary complexity

If a simple implementation solves the problem, use the simple
implementation.

Avoid unnecessary:

-   microservices
-   queues
-   abstractions
-   dependencies
-   third-party integrations

unless they clearly improve the MVP.

------------------------------------------------------------------------

### Rule 3 --- User data belongs to the user

Every personal-data record must be associated with the authenticated
user.

Never use global personal-data collections without a user boundary.

------------------------------------------------------------------------

### Rule 4 --- Source before assumption

For personal-data answers:

**Retrieved source \> AI assumption**

If information cannot be found, say that it was not found.

Do not invent dates, prices, relationships or events.

------------------------------------------------------------------------

# 3. Technology and Coding Standards

## Frontend

-   Use TypeScript where practical.
-   Prefer reusable components.
-   Keep components focused.
-   Avoid huge components containing the entire application.
-   Keep API calls in service/helper modules.
-   Keep secrets out of frontend code.
-   Use semantic HTML.
-   Ensure responsive layouts.

## Backend

-   Keep routes thin.
-   Put business logic into services.
-   Validate incoming data.
-   Handle errors consistently.
-   Protect authenticated routes.
-   Do not expose stack traces to users.

------------------------------------------------------------------------

# 4. Naming Conventions

### Files

Use descriptive names:

``` text
LifeTimeline.tsx
SearchResults.tsx
documentService.ts
authController.ts
```

Avoid:

``` text
abc.ts
test2.ts
newfile.ts
finalfinal.ts
```

### Variables

Use meaningful names:

``` text
documentId
timelineEvent
sourceDocument
```

Avoid:

``` text
x
data1
temp2
```

------------------------------------------------------------------------

# 5. API Rules

Use predictable REST-style routes where practical.

Example:

``` text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout

GET    /api/documents
POST   /api/documents
DELETE /api/documents/:id

GET    /api/timeline
GET    /api/graph

POST   /api/search
GET    /api/insights
```

Authenticated endpoints must verify the user's identity.

------------------------------------------------------------------------

# 6. AI Rules

## Rule 1

AI must work from retrieved user context for personal-data questions.

## Rule 2

Do not claim unsupported information.

## Rule 3

Preserve source references.

## Rule 4

Prefer structured extraction over asking an LLM to return uncontrolled
prose.

Example structured output:

``` json
{
  "entities": [],
  "events": [],
  "relationships": [],
  "dates": [],
  "amounts": []
}
```

## Rule 5

Keep AI prompts versioned or centralized.

Do not scatter long prompt strings across components.

------------------------------------------------------------------------

# 7. File Handling Rules

Allowed MVP formats:

-   PDF
-   TXT
-   PNG
-   JPG/JPEG

Additional formats may be added only if time permits.

Always validate:

-   MIME type
-   file extension
-   file size

Never trust the filename alone.

------------------------------------------------------------------------

# 8. Privacy Rules

### Never:

-   Commit API keys.
-   Commit real personal documents.
-   Log passwords.
-   Log raw document contents unnecessarily.
-   Put sensitive data in public demo URLs.
-   Use real private medical/banking documents for demonstration.

### Always:

-   Use `.env`.
-   Use synthetic demo data.
-   Protect authenticated routes.
-   Delete test data when no longer needed.

------------------------------------------------------------------------

# 9. Database Rules

Every user-owned model must include:

``` text
userId
```

Queries must filter by the authenticated user's ID.

Bad:

``` text
find all documents
```

Good:

``` text
find documents where userId = authenticatedUserId
```

------------------------------------------------------------------------

# 10. UI Rules

The UI must be:

-   Clean
-   Minimal
-   Responsive
-   Accessible
-   Consistent
-   Easy to understand

Avoid:

-   excessive gradients
-   excessive glassmorphism
-   huge animations
-   crowded dashboards
-   unnecessary popups
-   tiny text

The visual identity should use the LIFENEXUS orange/peach theme defined
in `design.md`.

------------------------------------------------------------------------

# 11. Graph Rules

The graph must communicate relationships clearly.

Do not display hundreds of nodes in the default view.

Start with:

-   selected entity
-   directly related nodes
-   expandable relationships

Provide filtering where possible.

------------------------------------------------------------------------

# 12. Timeline Rules

Timeline entries must have:

-   Date or date range
-   Title
-   Short description
-   Source
-   Related entities where useful

Do not fabricate exact dates when only a month/year is available.

------------------------------------------------------------------------

# 13. Search Rules

Search should support natural language.

Examples:

``` text
Everything related to my laptop
```

``` text
What important things expire next month?
```

``` text
When did I start working on AI?
```

``` text
How much did I spend on travel?
```

Search results should prioritize source-backed information.

------------------------------------------------------------------------

# 14. Error Handling

Every major operation needs a user-friendly error state.

Example:

``` text
We couldn't process this file.

Try:
• Checking the file format
• Uploading a smaller file
• Retrying the processing
```

Never show raw backend errors to the user.

------------------------------------------------------------------------

# 15. Loading States

Use clear loading states for:

-   Login
-   Upload
-   Processing
-   Search
-   Graph loading
-   Timeline generation

Avoid making the application appear frozen.

------------------------------------------------------------------------

# 16. Git Rules

Commit meaningful changes.

Examples:

``` text
feat: add authentication
feat: add document upload
feat: add entity extraction
feat: add life graph
feat: add timeline
fix: isolate documents by user
style: refine dashboard UI
```

Avoid:

``` text
update
changes
final
final2
works
```

------------------------------------------------------------------------

# 17. Environment Rules

Use:

``` text
.env
```

for secrets.

Commit:

``` text
.env.example
```

with placeholders.

Never commit:

``` text
API_KEY=real_key_here
```

------------------------------------------------------------------------

# 18. Dependency Rules

Before adding a package, ask:

1.  Is it necessary?
2.  Can existing code solve this?
3.  Is it stable?
4.  Does it increase build risk?

During the hackathon, avoid unnecessary dependency churn.

------------------------------------------------------------------------

# 19. Development Workflow

For every feature:

``` text
Understand
 ↓
Plan
 ↓
Implement
 ↓
Test
 ↓
Integrate
 ↓
Commit
```

Do not build five features simultaneously and debug everything at the
end.

------------------------------------------------------------------------

# 20. Hackathon Time Rules

### 9:00--9:30

Requirements + architecture.

### 9:30--11:00

Project setup + authentication + core UI.

### 11:00--12:30

Upload + extraction.

### 12:30--2:00

Knowledge model + AI extraction.

### 2:00--3:15

Search + graph/timeline.

### 3:15--4:00

Insights + polish.

### 4:00--4:30

Testing + deployment.

### 4:30--5:00

PPT + README + final checks.

### 5:00--5:30

Submission.

------------------------------------------------------------------------

# 21. Scope Control Rule

At any point ask:

> **Does this improve the core LIFENEXUS experience?**

If no, defer it.

------------------------------------------------------------------------

# 22. Demo Rule

The demo must show transformation:

``` text
Messy files
   ↓
LIFENEXUS
   ↓
Connected knowledge
   ↓
Search
   ↓
Graph
   ↓
Timeline
   ↓
Insight
```

Do not spend the demo explaining code.

Show the result.

------------------------------------------------------------------------

# 23. Submission Rule

Before submission verify:

-   GitHub repository works.
-   README exists.
-   Deployed link works if available.
-   No secrets committed.
-   Demo data works.
-   Main flow works from a fresh session.
-   PPT is complete.
-   Project title is **LIFENEXUS**.
-   Tagline is **Everything you've done. Connected.**

------------------------------------------------------------------------

# 24. Golden Rule

> **Build less. Connect better. Explain clearly.**

LIFENEXUS wins its identity through the relationships it discovers, not
through the number of screens it contains.

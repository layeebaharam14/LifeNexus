# LIFENEXUS --- Design System

## 1. Design Direction

### Brand

**LIFENEXUS**

**Tagline:** *Everything you've done. Connected.*

The design should feel:

-   Intelligent
-   Warm
-   Personal
-   Premium
-   Calm
-   Modern
-   Trustworthy
-   Human

It should NOT look like another generic AI SaaS dashboard.

------------------------------------------------------------------------

# 2. Visual Concept

The core visual metaphor is:

> **Warm memory + connected information**

Use a distinctive **orange / peach / apricot** family rather than the
overused blue/purple AI gradient.

The interface should use color as an accent and identity, not as
decoration everywhere.

------------------------------------------------------------------------

# 3. Color Palette

## Primary

### Nexus Orange

`#F47A45`

Used for:

-   Primary actions
-   Active states
-   Key highlights
-   Important graph nodes

### Soft Peach

`#FFD2BE`

Used for:

-   Secondary surfaces
-   Selected states
-   Soft backgrounds

### Apricot

`#FFB07C`

Used for:

-   Gradient transitions
-   Cards
-   Timeline accents

### Warm Cream

`#FFF8F3`

Main application background.

### Deep Cocoa

`#2A211D`

Primary text.

### Muted Brown

`#756862`

Secondary text.

### Border

`#E9DDD6`

Subtle borders.

### Success

Use a restrained green such as `#3D8B68`.

### Warning

Use a warm amber such as `#D79532`.

### Error

Use a muted red such as `#C65A55`.

------------------------------------------------------------------------

# 4. Signature Gradient

Primary brand gradient:

``` text
#F47A45 → #FFB07C → #FFD2BE
```

Use this selectively.

Good places:

-   Hero visual
-   Primary CTA background
-   Graph highlights
-   Timeline emphasis
-   Empty-state illustrations

Do NOT put the gradient behind every card.

------------------------------------------------------------------------

# 5. Overall Layout

The application should feel spacious.

Desktop:

``` text
┌────────────────────────────────────────────────────┐
│ Logo      Search                  Notifications User│
├────────────┬───────────────────────────────────────┤
│            │                                       │
│ Overview   │                                       │
│ Search     │           Main Workspace             │
│ Timeline   │                                       │
│ Life Graph │                                       │
│ Documents  │                                       │
│ Insights   │                                       │
│            │                                       │
└────────────┴───────────────────────────────────────┘
```

Mobile:

Use a bottom navigation or compact navigation.

------------------------------------------------------------------------

# 6. Dashboard

The dashboard should immediately communicate:

> **"LIFENEXUS understands your digital life."**

Suggested cards:

### Memory

`124 connected items`

### Timeline

`18 important events`

### Relationships

`67 discovered connections`

### Attention

`4 upcoming items`

Then:

**Ask your life**

A prominent search box:

> "What would you like to remember?"

------------------------------------------------------------------------

# 7. Search Experience

Search should feel like a conversation with a **memory engine**, not a
generic chatbot.

Example:

``` text
┌───────────────────────────────────────────┐
│ What would you like to remember?       🔍 │
└───────────────────────────────────────────┘

Everything related to my laptop
```

Answer layout:

### Direct answer

Short, clear answer.

### Connected information

Cards for:

-   Purchase
-   Warranty
-   Repair
-   Service

### Sources

Clickable source documents.

### Explore graph

CTA:

**View connection map →**

------------------------------------------------------------------------

# 8. Life Graph Design

Use a dark or warm-neutral graph canvas to make nodes stand out, but do
not make the entire application dark.

Center node:

**LAPTOP**

Connected nodes:

-   Invoice
-   Warranty
-   Repair
-   Service
-   Purchase

Node colors should be subtle variations of the brand palette.

Relationship labels should remain readable.

------------------------------------------------------------------------

# 9. Timeline Design

Timeline should be elegant and chronological.

Example:

``` text
2026
 │
 ● March
 │  Laptop purchased
 │  ₹68,000
 │
 ● July
 │  Repair completed
 │
 ● August
 │  Service follow-up
```

Use orange for the timeline spine or key events.

------------------------------------------------------------------------

# 10. Cards

Cards should have:

-   12--18px radius
-   subtle border
-   very light shadow
-   generous internal spacing

Avoid overly rounded "bubble" UI.

Cards should feel like organized pieces of memory.

------------------------------------------------------------------------

# 11. Typography

Recommended:

### Primary font

**Inter**

Alternative:

**Plus Jakarta Sans**

Use one primary font family consistently.

### Scale

-   Hero: 48--64px
-   Page title: 30--36px
-   Section title: 20--24px
-   Body: 14--16px
-   Supporting text: 12--14px

Avoid excessive font sizes.

------------------------------------------------------------------------

# 12. Iconography

Use one consistent icon library.

Suggested:

-   Lucide
-   Phosphor

Icons should be:

-   Simple
-   Thin/medium weight
-   Consistent

Avoid mixing multiple icon styles.

------------------------------------------------------------------------

# 13. Buttons

### Primary

Orange filled.

Example:

**Upload memories**

### Secondary

Warm neutral outline.

Example:

**Explore timeline**

### Destructive

Muted red.

Example:

**Delete document**

Buttons should have clear labels.

------------------------------------------------------------------------

# 14. Upload Experience

The upload screen should feel inviting:

``` text
        + Add to your memory

Drop files here
or
Choose files

PDF • JPG • PNG • TXT
```

After upload:

``` text
Invoice.pdf
✓ Processed

Warranty.pdf
⟳ Understanding...

Photo.jpg
✓ Connected
```

------------------------------------------------------------------------

# 15. Processing Experience

Avoid a generic spinner.

Show meaningful stages:

``` text
Reading document       ✓
Understanding content  ✓
Finding entities       ✓
Connecting memories    ⟳
Building timeline      ○
```

This makes the AI pipeline understandable.

------------------------------------------------------------------------

# 16. Empty States

Do not use:

> "No data found."

Use meaningful language.

Example:

> **Your memory starts here.**
>
> Upload a few documents, receipts or photos and LIFENEXUS will begin
> connecting the dots.

CTA:

**Add your first memory**

------------------------------------------------------------------------

# 17. Authentication Screens

Keep authentication minimal.

Use the same warm brand identity.

Do not make login look like a generic enterprise portal.

Possible visual:

A subtle connected-node illustration using orange/peach accents.

------------------------------------------------------------------------

# 18. Privacy Center

Use a calm, trustworthy layout.

Example:

**Your memory is yours.**

Show:

-   Documents stored
-   Entities created
-   Timeline events
-   Data controls

Actions:

-   Export
-   Delete selected
-   Clear workspace

------------------------------------------------------------------------

# 19. Motion

Use subtle motion only.

Examples:

-   Graph nodes gently appear.
-   Timeline items fade/slide in.
-   Search results reveal progressively.
-   Upload processing states transition smoothly.

Avoid:

-   constant floating animations
-   excessive particle effects
-   long transitions

Recommended duration:

**150--300ms** for normal UI interactions.

------------------------------------------------------------------------

# 20. Responsive Design

Must work on:

-   Desktop
-   Laptop
-   Tablet
-   Mobile

Prioritize desktop for the hackathon demo but do not allow horizontal
overflow on mobile.

------------------------------------------------------------------------

# 21. Accessibility

-   Good contrast.
-   Keyboard-accessible controls.
-   Visible focus states.
-   Descriptive labels.
-   Do not rely on color alone.
-   Accessible form errors.

------------------------------------------------------------------------

# 22. Visual Identity Rule

Avoid the typical:

``` text
Blue + Purple
Glassmorphism
Neon AI
Huge gradients
```

Instead:

``` text
Warm orange
Peach
Cream
Cocoa
Soft shadows
Editorial spacing
Connected-data visualizations
```

The product should feel like:

> **A premium digital memory journal powered by serious technology.**

------------------------------------------------------------------------

# 23. Design Principle

> **The technology should feel powerful; the interface should feel
> calm.**

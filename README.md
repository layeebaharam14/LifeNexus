# LIFENEXUS

> *"Everything you've done. Connected."*

**Hackathon Challenge:** HACKDAY 1.0 — Tech for a Better Tomorrow  
**Project Type:** Personal Knowledge Graph & Memory Engine  

---

## 🌟 Overview

**LIFENEXUS** transforms scattered personal digital traces (PDFs, receipts, invoices, screenshots, photos, notes, emails, certificates, warranties, tickets, bills) into a connected, searchable **Personal Knowledge Graph** and **Life Timeline**.

Instead of acting as a naive document chatbot, LIFENEXUS is powered by a **Personal Memory Engine** that extracts entities, events, relationships, dates, amounts, and source evidence, unlocking four core experiences from a single personal data layer:

1. **Life Search** — Natural-language query answering strictly grounded in personal evidence, complete with clickable source citations.
2. **Life Graph** — Interactive visual knowledge network connecting people, assets, documents, warranties, and events.
3. **Life Timeline** — Chronological reconstruction of milestones, career achievements, and life events with date precision indicators.
4. **Life Insights** — Proactive, data-backed intelligence surfacing upcoming warranty expirations, recurring subscriptions, and cross-document connections.

---

## 🏗️ System Architecture

```
[ Ingested Files: PDFs, Images, TXT ]
                 │
                 ▼
┌─────────────────────────────────┐
│ Ingestion & Extraction Engine   │  (Multer, pdf-parse, OCR)
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ AI Memory & Relationship Engine │  (Structured JSON Entity/Event Extractor)
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ Personal Knowledge Store (DB)   │  (Entities, Edges, Timeline Events, Memories)
└────────┬───────┬───────┬────────┘
         │       │       │
         ▼       ▼       ▼
    [ Search ] [ Graph ] [ Timeline ] [ Insights ]
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm / yarn
- MongoDB instance (Local or Atlas)
- Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/layeebaharam14/LifeNexus.git
   cd LifeNexus
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Populate your GEMINI_API_KEY and MONGODB_URI in .env
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the application:**
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Privacy & Data Sovereignty

LIFENEXUS is built with strict multi-tenant user isolation. Every record and file is cryptographically isolated by `userId`. Users maintain complete ownership with instant workspace purge capabilities.

---

## 📄 License
MIT License

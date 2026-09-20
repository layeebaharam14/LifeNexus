# LIFENEXUS

<div align="center">

> *"Everything you've done. Connected."*

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
[![Render](https://img.shields.io/badge/Render-Live%20Demo-46E3B7.svg?logo=render&logoColor=white)](https://lifenexus-pouw.onrender.com/)
[![Demo Video](https://img.shields.io/badge/Demo%20Video-Watch%20Walkthrough-red.svg?logo=google-drive&logoColor=white)](https://drive.google.com/file/d/1e5qKOygComl3sJWTskR7U-ILEV9Xulqd/view)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-cyan.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20In--Memory-forestgreen.svg)](https://www.mongodb.com/)

**HACKDAY 1.0 Challenge Entry** · *Tech for a Better Tomorrow*  
**Category:** Personal Knowledge Graph & Connected Memory Engine

</div>

---

## 🔗 Live Application & Demo Video

> [!TIP]
> **Production Live URL:**  
> **👉 [https://lifenexus-pouw.onrender.com/](https://lifenexus-pouw.onrender.com/)**  
> 
> *Full single-app production deployment running on Render (Unified Express API + React Vite Client + In-Memory / MongoDB Atlas Storage).*

> [!NOTE]
> **Demo Video Walkthrough:**  
> **🎬 [Watch LIFENEXUS Video Demonstration](https://drive.google.com/file/d/1e5qKOygComl3sJWTskR7U-ILEV9Xulqd/view)**  
> 
> *Complete walkthrough demonstrating document ingestion, entity & relationship extraction, interactive knowledge graph exploration, and grounded life search.*

---

## 🌟 Executive Summary

Digital life is fundamentally fragmented. Over years of living, studying, and working, our essential records—invoices, warranty receipts, medical bills, flight tickets, course certifications, rental agreements, repair sheets, and project notes—are scattered across download folders, emails, messaging apps, and phone galleries.

Traditional storage solutions (Google Drive, Dropbox) are passive filing cabinets. Document chatbots (naive RAG) answer isolated questions without understanding chronological context or persistent relationships.

**LIFENEXUS is a Personal Memory Engine.** It ingests raw personal files, extracts structured facts, and synthesizes them into an interconnected **Personal Knowledge Graph** and chronological **Life Timeline**—grounded in real evidence, privacy-first, and completely user-owned.

---

## 🚀 Core Features

| Feature | Description |
| :--- | :--- |
| 🔍 **Life Search** | Natural-language query answering strictly grounded in personal records. Ask *"Where did I buy my laptop?"* or *"When does my warranty expire?"* and receive direct answers with clickable source provenance. |
| 🕸️ **Life Graph** | Interactive force-directed knowledge graph visualizing the network of people, organizations, products, places, and events connecting your life. |
| ⏳ **Life Timeline** | Chronological reconstruction of milestones, purchases, career achievements, and travel itineraries with date-precision indicators. |
| 💡 **Life Insights** | Proactive, data-backed intelligence surfacing upcoming warranty expirations, active subscriptions, and cross-document patterns. |
| 🔒 **Privacy Center** | Multi-tenant cryptographic data isolation. View live file storage and memory counts, download raw JSON data, or trigger a full workspace purge with zero residue. |
| ⚡ **Resilient Engine** | Zero hard dependency on cloud AI. Seamlessly uses Google Gemini (`gemini-3.6-flash`) when configured, and automatically falls back to an offline deterministic semantic extractor if API keys are unset or network fails. |

---

## 🏗️ Architecture & Data Pipeline

```
[ Ingested Files: PDFs, Images, TXT ]
                 │
                 ▼
┌─────────────────────────────────┐
│ Ingestion & Content Extraction  │  (Multer, pdf-parse, OCR fallback)
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ AI Memory & Relationship Engine │  (Gemini 3.6 Flash / Local Deterministic Extractor)
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ Personal Knowledge Store        │  (Entities, Edges, Timeline Events, Memories)
│ (MongoDB Atlas / In-Memory)     │
└────────┬───────┬───────┬────────┘
         │       │       │
         ▼       ▼       ▼
    [ Search ] [ Graph ] [ Timeline ] [ Insights ]
```

---

## 📂 Pre-Loaded Synthetic Demo Dataset

LIFENEXUS includes a cross-connected, 14-document synthetic dataset in [`sample-data/`](sample-data/) centered on a fictional persona (**Alex Morgan**) to immediately test and demonstrate graph connectivity:

1. `invoices/laptop_invoice.txt` — ASUS Vivobook 15 OLED purchase from Croma Indiranagar.
2. `warranties/laptop_warranty.txt` — ASUS Premium Care 2-year warranty certificate.
3. `repairs/laptop_repair_receipt.txt` — F1 Info Solutions job sheet for display cable repair.
4. `repairs/service_completion_email.txt` — Authorized service center pickup notification email.
5. `certificates/ai_internship_certificate.txt` — NexusAITech Labs 3-month AI internship certificate.
6. `certificates/college_degree_certificate.txt` — Bangalore Institute of Technology B.E. Degree.
7. `certificates/course_completion_certificate.txt` — DeepLearning.AI Knowledge Graphs Specialization.
8. `certificates/hackathon_winner_certificate.txt` — HACKDAY 2025 1st Place award in Hyderabad.
9. `travel/flight_ticket.txt` — IndiGo roundtrip flights (Bangalore ⇄ Hyderabad).
10. `travel/hotel_booking_hyderabad.txt` — Lemon Tree Premier Hyderabad hotel booking.
11. `invoices/grocery_supermarket_receipt.txt` — Nature's Basket Indiranagar grocery invoice.
12. `subscriptions/cloud_subscription_invoice.txt` — CloudNexus developer tier monthly invoice.
13. `renewals/health_insurance_renewal.txt` — Star Health Young Star Comprehensive renewal notice.
14. `notes/personal_project_notes.txt` — Personal journal tying all career & tech milestones together.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, React Router 6, Lucide Icons, React Force Graph 2D.
- **Styling**: Vanilla CSS design system with curated warm peach/nexus orange palette.
- **Backend**: Node.js, Express, TypeScript, Multer, PDF-Parse, Tesseract OCR.
- **AI / Understanding**: Google Gemini API (`@google/generative-ai`, `gemini-3.6-flash`) with resilient offline semantic parser fallback.
- **Database**: MongoDB Atlas with Mongoose (plus auto-activating in-memory fallback store).
- **Security**: JWT authentication, bcryptjs password hashing, per-user cryptographic data isolation.

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- *(Optional)* MongoDB connection string (LIFENEXUS automatically runs in-memory if MongoDB is absent)

---

### Option A: Run as Single Unified Application (Recommended)
Compile the React frontend and run both UI and REST API from a single Node.js process:

```bash
# 1. Clone the repository
git clone https://github.com/layeebaharam14/LifeNexus.git
cd LifeNexus

# 2. Install all dependencies
npm run install:all

# 3. Build frontend and backend bundles
npm run build

# 4. Start the unified production server
npm start
```

👉 Open **`http://localhost:5000`** in your browser. Both the React UI and the API are served from this single address.

---

### Option B: Run in Development Mode (With Hot Reloading)

```bash
# Terminal 1: Backend API (Port 5000)
cd backend
npm install
npm run dev

# Terminal 2: Frontend UI (Port 5173)
cd frontend
npm install
npm run dev
```

👉 Open **`http://localhost:5173`** in your browser. (Vite automatically proxies `/api` requests to port 5000).

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory (see [`backend/.env.example`](backend/.env.example) for template):

```env
# Server
PORT=5000
NODE_ENV=production

# Security & CORS
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173

# Database (Optional: omit to use auto in-memory storage)
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/lifenexus?retryWrites=true&w=majority

# AI / Semantic Engine (Optional: omit to use offline deterministic extractor)
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.6-flash
```

---

## 🌐 Production Deployment

LIFENEXUS is ready for single-app or decoupled cloud deployment:

- **Single-App Hosting (Render / Railway / Fly.io)**: Build frontend and backend, then run `npm start` on Node.js.
- **Decoupled Hosting (Vercel + Render + Atlas)**: Deploy `frontend/` to Vercel and `backend/` to Render.
- See the complete step-by-step instructions in [**Docs/DEPLOYMENT.md**](Docs/DEPLOYMENT.md).

---

## 🔒 Privacy & Data Sovereignty

- **User Isolation**: All database queries strictly enforce `userId` scoping. User A can never query or view User B's documents, graph, or memories.
- **Zero Third-Party Leaks**: Document processing runs securely in-process; when using the local fallback, zero tokens leave the server.
- **Instant Workspace Purge**: Users can delete individual records or execute an authenticated instant workspace purge (`DELETE /api/privacy/purge`), deleting all files, graph nodes, relationships, and timeline events permanently.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Built with ❤️ for <b>HACKDAY 1.0</b> · <i>Tech for a Better Tomorrow</i>
</div>

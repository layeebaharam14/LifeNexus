# LIFENEXUS — Production Deployment Guide

This guide provides step-by-step instructions for deploying **LIFENEXUS** to production:
- **Frontend**: [Vercel](https://vercel.com)
- **Backend**: [Render](https://render.com)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas)

---

## Architecture Overview

```
[ User Browser ]
       │
       ▼ (HTTPS)
[ Vercel: React + Vite SPA ]
       │
       ▼ (REST API over HTTPS + CORS)
[ Render: Node.js / Express API ]
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
[ MongoDB Atlas (Cloud Database) ]   [ Local Filesystem (./uploads) ]
(Users, Entities, Graph, Timeline)   (Ephemeral document disk storage)
```

---

## 1. Database Setup: MongoDB Atlas

1. Log in to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free **M0 Cluster**.
2. Under **Database Access**, create a database user (e.g., `lifenexus_admin`) with password authentication.
3. Under **Network Access**, add an IP Access Entry:
   - For Render cloud connectivity, add `0.0.0.0/0` (Allow access from anywhere).
4. In your Cluster dashboard, click **Connect** → **Drivers** (Node.js) and copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/lifenexus?retryWrites=true&w=majority
   ```
   *(Replace `<username>` and `<password>` with your database user credentials).*

---

## 2. Backend Deployment: Render

1. Log in to [Render](https://render.com) and click **New +** → **Web Service**.
2. Connect your GitHub repository (`LifeNexus`).
3. Configure the service settings:
   - **Name**: `lifenexus-backend` (or your preferred name)
   - **Region**: Choose the closest region (e.g., Singapore, Frankfurt, Oregon)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. Add the following **Environment Variables** in the Render Dashboard:

| Variable Name | Example / Recommended Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations |
| `PORT` | `10000` | Render assigns `$PORT` automatically; Express respects this |
| `FRONTEND_URL` | `https://lifenexus.vercel.app` | Allowed CORS origin (your deployed Vercel URL) |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
| `JWT_SECRET` | *(Random 32+ character string)* | Secret for signing user authentication tokens |
| `JWT_EXPIRES_IN` | `7d` | Token validity period |
| `UPLOAD_DIR` | `./uploads` | Local directory for temporary file processing |
| `MAX_FILE_SIZE_MB` | `15` | Maximum upload size limit per file |
| `GEMINI_API_KEY` | *(Optional / Empty)* | Leave empty for offline fallback, or provide Google AI key |
| `GEMINI_MODEL` | `gemini-3.6-flash` | Gemini model version |

5. Click **Deploy Web Service**. Once deployed, Render will provide a public URL:
   `https://lifenexus-backend.onrender.com`

---

## 3. Frontend Deployment: Vercel

1. Log in to [Vercel](https://vercel.com) and click **Add New...** → **Project**.
2. Import your GitHub repository (`LifeNexus`).
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and select `frontend`
   - **Build Command**: `npm run build` (defaults to `tsc -b && vite build`)
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://lifenexus-backend.onrender.com/api` | Points frontend to deployed Render API |

5. Click **Deploy**.
6. Vercel will build and assign your domain: `https://your-project.vercel.app`.

> **Note on Client-Side Routing:**  
> The repository includes [frontend/vercel.json](file:///c:/Users/Layeeba%20Haram/OneDrive/Desktop/LifeNexus/frontend/vercel.json) with rewrite rules (`/(.*) -> /index.html`), ensuring direct URLs and page refreshes on `/app/*`, `/login`, and `/register` resolve correctly without 404s.

---

## 4. Connecting Frontend and Backend (CORS Loop)

To prevent cross-origin issues:
1. Once your Vercel URL is live (e.g. `https://lifenexus-app.vercel.app`), go back to your **Render Dashboard** → **Environment**.
2. Set `FRONTEND_URL` to your exact Vercel URL:
   ```
   FRONTEND_URL=https://lifenexus-app.vercel.app
   ```
3. Save changes. Render will automatically re-deploy with updated CORS settings.

---

## 5. Storage Architecture & Limitations

> [!IMPORTANT]
> **Ephemeral Storage Limitation on Render Free Tier:**  
> - On Render Free web services, the local container filesystem is **ephemeral**. Any physical files saved to `./uploads` are discarded whenever the container restarts or re-deploys.
> - **What IS persistent:** All document metadata, extracted text, knowledge graph entities, relationships, timeline events, user accounts, and privacy data are stored in **MongoDB Atlas** and will persist across all restarts.
> - **Production Recommendation:** For enterprise long-term storage of original raw binary files (PDFs/images), attach a Render Persistent Disk (on paid plans) or connect S3-compatible cloud object storage (AWS S3 or Cloudflare R2).

---

## 6. Post-Deployment Verification Checklist

- [ ] Visit `https://your-backend.onrender.com/api/health` → Expect `{"success": true, "status": "healthy"}`
- [ ] Visit `https://your-frontend.vercel.app` → App loads with orange/peach theme
- [ ] Register a new test user account
- [ ] Upload a test document from `sample-data/`
- [ ] Verify Life Search, Life Graph, Life Timeline, and Life Insights load with persistent Atlas records
- [ ] Refresh any internal page (e.g. `/app/documents`) to verify Vercel SPA routing

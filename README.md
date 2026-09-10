# Sahyog (CoGig) — Cooperative Gig Services Platform
> 100% Worker-Owned & Federated Digital Marketplace for Urban and Household Services

---

## ⚠️ Important Note for Windows Users

**Do not double-click `frontend/index.html` to run the React application.**

Modern web applications built with **React 19**, **Vite**, and **TypeScript** use ES modules, dynamic client-side routing, and API proxies. Web browsers automatically block scripts when loaded through raw disk file paths (`file://` protocol) due to browser security restrictions (CORS).

The application **must** be run through the local development server or production preview server as described below.

---

## How to Run Sahyog Locally

### Option A: One-Click Startup (Recommended for Windows)

In the root directory (`d:\CoGig`), simply double-click:
```text
start-app.bat
```
*(This automatically checks dependencies, starts both the backend API and frontend Vite server, and opens your browser to http://localhost:5173)*

Alternatively, you can launch each server independently:
- **Backend Only**: Double-click `start-backend.bat`
- **Frontend Only**: Double-click `start-frontend.bat` (available in the root or in `frontend/`)

---

### Option B: Terminal / Command Line

#### 1. Start Backend API

```bash
cd backend
npm install
npm run start:dev
```
Backend API will be running at:
```text
http://localhost:3000/api
```

#### 2. Start Frontend Web App

In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend development server will be running at:
```text
http://localhost:5173
```

#### 3. Open in Browser

Navigate to:
```text
http://localhost:5173
```

---

## Production Build & Preview Testing

To test the optimized production build:

```bash
cd frontend
npm run build
npm run preview
```
The production preview server will be available at:
```text
http://localhost:4173
```

---

## Demo Reviewer Accounts

All demo accounts use the standard password: **`Demo@123`**

| Role | Email | Features |
| :--- | :--- | :--- |
| **Customer** | `customer@demo.com` | Service catalog, transparent fair-wage pricing, direct booking, escrow payment & rating |
| **Worker** | `worker@demo.com` | Real-time gig requests, duty toggle (Online/Offline), OTP verification, welfare fund balance |
| **Admin** | `admin@demo.com` | Cooperative oversight, worker verification, welfare treasury, dispute tribunals, AI demand analytics |

---

## Technology Stack

- **Frontend**: React 19, Vite 8, TypeScript, Tailwind CSS v4, React Router 7, Leaflet / React-Leaflet, Axios, Recharts
- **Backend**: NestJS, Prisma ORM, SQLite / PostgreSQL (Pglite), JWT Authentication, Passport
- **Platform Principles**: 80-90% direct wage payout, democratic cooperative governance, accident & welfare fund

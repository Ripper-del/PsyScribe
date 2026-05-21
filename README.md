<p align="center">
  <h1 align="center">PsyScribe</h1>
  <p align="center">AI-powered clinical note generation platform for psychologists</p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3FCF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Gemini-AI-4285F4?logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white" alt="Stripe" />
</p>

---

## About

**PsyScribe** is a web platform designed for psychologists and therapists. It uses Google Gemini AI to automatically generate structured SOAP notes (Subjective, Objective, Assessment, Plan) from session transcripts or raw notes — saving hours of documentation work.

### Key Features

- **AI-Powered SOAP Generation** — paste your session transcript and get structured clinical notes in seconds
- **Client Management** — full CRM for managing your client base with profiles and session history
- **Session Workspace** — dedicated workspace for conducting and documenting therapy sessions
- **Subscription System** — Stripe-powered PRO plan with automated activation via webhooks
- **Auth & Security** — Supabase-based authentication with protected routes
- **Modern UI** — dark-themed, premium design with smooth animations

---

## Tech Stack

| Layer        | Technology                              |
| ------------ | --------------------------------------- |
| **Frontend** | React 19, React Router 7, Vite 8        |
| **Backend**  | Node.js, Express 5                      |
| **AI**       | Google Gemini API                       |
| **Database** | Supabase (PostgreSQL + Auth)            |
| **Payments** | Stripe (Checkout + Webhooks)            |
| **Hosting**  | Vercel (frontend), Docker (backend)     |

---

## Project Structure

```
PsyScribe-Proj/
├── psyscribe-app/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx       # Public landing page
│   │   │   ├── AuthPage.jsx          # Login / Sign-up
│   │   │   ├── Dashboard.jsx         # Main dashboard
│   │   │   ├── SessionWorkspace.jsx  # AI session workspace
│   │   │   ├── Clients.jsx           # Client list
│   │   │   ├── ClientProfile.jsx     # Individual client profile
│   │   │   ├── Settings.jsx          # User settings & billing
│   │   │   └── PrivacyPolicy.jsx     # Privacy policy page
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx    # Auth guard
│   │   ├── App.jsx                   # Router & layout
│   │   ├── App.css                   # Global styles
│   │   └── supabaseClient.js         # Supabase init
│   ├── docker-compose.yml
│   └── vercel.json
│
├── psyscribe-backend/          # Backend (Express)
│   ├── server.js               # API routes (AI, Stripe, webhooks)
│   ├── Dockerfile
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/Ripper-del/PsyScribe.git
cd PsyScribe
```

### 2. Setup the backend

```bash
cd psyscribe-backend
npm install
```

Create a `.env` file:

```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
npm start
```

### 3. Setup the frontend

```bash
cd psyscribe-app
npm install
```

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000
```

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Endpoints

| Method | Route                          | Description                        |
| ------ | ------------------------------ | ---------------------------------- |
| POST   | `/api/generate-soap`           | Generate SOAP notes via Gemini AI  |
| POST   | `/api/create-checkout-session` | Create a Stripe checkout session   |
| POST   | `/api/webhook`                 | Stripe webhook for payment events  |

---

## Deployment

- **Frontend** — deployed on Vercel with `vercel.json` SPA config
- **Backend** — containerized with Docker, deployable to any cloud provider

---

## License

This project is proprietary. All rights reserved.

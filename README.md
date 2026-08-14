# 🎓 Sohopathi (সহপাঠী)
### AI-Powered Personalized Study Companion for RUET Students
**Hackathon: Reimagine Learning at RUET**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-blue?logo=postgresql)](https://postgresql.org)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5_Flash-orange?logo=google)](https://ai.google.dev)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)](https://docker.com)

---

## 🚀 What is Sohopathi?

Sohopathi is an AI-powered study assistant that turns your own course materials (PDFs, handnotes, slide images) into a personalized tutor. It uses **RAG (Retrieval-Augmented Generation)** to answer questions grounded strictly in your uploaded content — no hallucinations, no irrelevant answers.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **Smart Upload** | Upload PDFs or handnote images — AI extracts all text automatically |
| 💬 **Grounded Chat** | Ask questions; AI answers ONLY from your course material (RAG) |
| 🧠 **AI Quiz Generation** | Auto-generates MCQ quizzes from your material with topic labels |
| 📊 **Weakness Detection** | Tracks quiz performance to identify your weak topics per course |
| 💡 **Explain Simpler** | One-click to get a struggling topic explained with analogies |
| 💾 **Chat Persistence** | Chat history saved locally, survives page refreshes |

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                     │
│  Pages: Home · Upload · Chat · Quiz · Dashboard            │
│  State: Redux Toolkit + localStorage persistence           │
│  UI: Tailwind CSS v4 · lucide-react · sonner toasts        │
│                    localhost:3000                          │
└──────────────────────┬─────────────────────────────────────┘
                       │ Axios REST API
┌──────────────────────▼─────────────────────────────────────┐
│                   BACKEND (Express.js)                     │
│  Routes: /upload · /chat · /quiz · /dashboard · /explain  │
│  Middleware: helmet · cors · compression · rate-limit      │
│  Logging: Winston + Loki · Metrics: prom-client            │
│                    localhost:5000                          │
└────────────┬───────────────────────┬───────────────────────┘
             │                       │
┌────────────▼──────────┐  ┌─────────▼───────────────────────┐
│  PostgreSQL Database  │  │     Google Gemini 2.5 Flash      │
│  (Prisma ORM)         │  │  · Chat (RAG grounded Q&A)       │
│  · Course chunks      │  │  · Quiz MCQ generation           │
│  · Quiz sessions      │  │  · PDF + Image OCR               │
│  · Answer tracking    │  │  · Explain simpler (analogies)   │
└───────────────────────┘  │  · Auto-retry on 503 errors      │
                           └─────────────────────────────────┘
```

---

## 📁 Project Structure

```
Hacathon/
├── README.md
└── SohoPathi/
    ├── docker-compose.yml          # Full stack orchestration
    ├── prometheus.yml              # Metrics scrape config
    ├── datasources.yml             # Grafana datasource config
    ├── run_local.bat               # One-click local dev script (Windows)
    ├── nginx/                      # Reverse proxy config
    │
    ├── client/                     # ─── FRONTEND (Next.js App Router) ───
    │   ├── Dockerfile
    │   ├── next.config.mjs         # Next.js config (optimizePackageImports)
    │   ├── package.json
    │   ├── app/                    # Next.js App Router pages
    │   │   ├── layout.js           # Root layout (Navbar + Providers + Toaster)
    │   │   ├── page.js             # Landing page (hero + feature cards)
    │   │   ├── globals.css         # Global styles + CSS variables + animations
    │   │   ├── chat/
    │   │   │   └── page.js         # RAG chat interface with course selector
    │   │   ├── upload/
    │   │   │   └── page.js         # File upload (PDF + Image) + course list
    │   │   ├── quiz/
    │   │   │   └── page.js         # AI quiz session (MCQ flow)
    │   │   └── dashboard/
    │   │       └── page.js         # Performance analytics + weak topic list
    │   ├── components/             # Reusable React components
    │   │   ├── Navbar.jsx          # Sticky nav with active route highlight
    │   │   ├── Providers.jsx       # Redux Provider wrapper
    │   │   ├── FileUploader.jsx    # Drag-and-drop upload (PDF + Image)
    │   │   ├── ChatWindow.jsx      # Chat UI with message bubbles + input
    │   │   ├── ChatMessage.jsx     # Single message bubble (user/assistant)
    │   │   ├── QuizCard.jsx        # MCQ question card with options
    │   │   ├── QuizResult.jsx      # Quiz summary + score + topic breakdown
    │   │   ├── TopicBar.jsx        # Visual bar for topic accuracy
    │   │   └── ExplainModal.jsx    # Modal for "Explain Simpler" responses
    │   └── lib/
    │       ├── store.js            # Redux store (course + chat + quiz slices)
    │       ├── api.js              # Axios API client functions
    │       └── utils.js            # cn() utility (clsx + tailwind-merge)
    │
    └── server/                     # ─── BACKEND (Node.js + Express) ───
        ├── Dockerfile
        ├── package.json
        ├── .env                    # DATABASE_URL, GEMINI_API_KEY, PORT
        ├── prisma/
        │   ├── schema.prisma       # DB schema: Course, Chunk, Quiz, Answer
        │   ├── migrations/         # Migration history
        │   └── seed.js             # (optional) seed data
        └── src/
            ├── server.js           # Express app entry point + route mounting
            ├── prismaClient.js     # Prisma + pg adapter initialization
            ├── routes/
            │   ├── upload.js       # POST /api/upload — PDF/Image → chunks
            │   ├── chat.js         # POST /api/chat — RAG Q&A
            │   ├── quiz.js         # POST /api/generate-quiz — MCQ generation
            │   ├── answer.js       # POST /api/submit-answer — save answers
            │   ├── dashboard.js    # GET /api/dashboard — analytics & weak topics
            │   └── explain.js      # POST /api/explain — simplified explanation
            ├── services/
            │   ├── geminiService.js  # Gemini 2.5 Flash (chat/quiz/OCR/explain + retry)
            │   ├── pdfService.js     # PDF text extraction via pdf-parse
            │   ├── ragService.js     # Chunk retrieval for RAG context building
            │   └── quizService.js    # Quiz session management
            ├── middleware/
            │   └── errorHandler.js  # Global error middleware
            └── utils/
                └── chunker.js       # Text chunking utility (word-limit based)
```

---

## ⚙️ Tech Stack

### Frontend
| Tech | Version | Purpose |
|------|---------|---------|
| Next.js | 16.2 | React framework (App Router) |
| React | 19 | UI library |
| Tailwind CSS | 4 | Utility-first styling |
| Redux Toolkit | 2.x | Global state management |
| Axios | 1.x | HTTP client |
| lucide-react | latest | Icons |
| sonner | latest | Toast notifications |

### Backend
| Tech | Version | Purpose |
|------|---------|---------|
| Node.js | 24 | Runtime |
| Express.js | 5.x | HTTP server framework |
| Prisma | 7.x | ORM for PostgreSQL |
| pdf-parse | 1.1.1 | PDF text extraction |
| multer | 2.x | File upload handling |
| Winston | 3.x | Structured logging |
| prom-client | 15.x | Prometheus metrics |

### Infrastructure
| Tech | Purpose |
|------|---------|
| PostgreSQL | Primary database |
| Docker Compose | Full-stack containerization |
| Nginx | Reverse proxy |
| Prometheus | Metrics collection |
| Grafana | Metrics visualization & dashboards |
| Loki | Log aggregation |

---

## 🛠️ Local Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ (running locally)
- Google Gemini API key → [Get one here](https://aistudio.google.com/app/apikey)

### 1. Clone & Install
```bash
git clone https://github.com/AhsanMosharof/SohoPathi.git
cd SohoPathi

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 2. Configure Environment

**`server/.env`**
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/test_db?schema=public"
GEMINI_API_KEY="your_gemini_api_key_here"
PORT=5000
```

**`client/.env`** (if needed)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Setup Database
```bash
cd server
npx prisma db push        # Create tables from schema
npx prisma generate       # Generate Prisma client
```

### 4. Run Development Servers
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |

---

## 🐳 Docker Deployment (One Command)

```bash
# From the SohoPathi/ directory
docker-compose up --build -d
```

This starts:
- Next.js frontend (port 3000)
- Express backend (port 5000)
- PostgreSQL database (port 5432)
- Prometheus (port 9090)
- Grafana dashboard (port 3001)
- Loki log aggregator

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload PDF/Image, extract & chunk text |
| `GET` | `/api/upload/courses` | List all uploaded courses |
| `POST` | `/api/chat` | RAG-based Q&A (requires courseId + question) |
| `POST` | `/api/generate-quiz` | Generate MCQ quiz from course material |
| `POST` | `/api/submit-answer` | Submit quiz answer, track performance |
| `GET` | `/api/dashboard` | Get analytics + weak topic report |
| `POST` | `/api/explain` | Get simplified explanation for a topic |

---

## 👥 Team

Built for the **"Reimagine Learning at RUET"** Hackathon.

---

## 📄 License

MIT License

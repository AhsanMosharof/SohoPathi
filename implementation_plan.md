# Sohopathi — Full Implementation Plan

> **Goal:** "Sohopathi" — AI-powered RUET Study Companion — পুরো project build করা
> **Tech Stack:** Frontend → Next.js 16 + Tailwind CSS 4 | Backend → Node.js + Express + Prisma + PostgreSQL | AI → Gemini 2.5 Flash

---

## Existing Codebase Summary

`3tier-docker-master/` ফোল্ডারে already একটা boilerplate আছে:

| Component | Status |
|---|---|
| `client/` — Next.js 16, Tailwind 4, Redux Toolkit, shadcn/ui, Axios, Zod, React Hook Form | ✅ Scaffolded |
| `docker-compose.yml` — PostgreSQL 16, server, client, Prometheus, Loki, Grafana | ✅ Ready |
| `server/` folder — Express API with 6 routes, 4 services, middleware | ✅ Built |
| Prisma schema — Course, Chunk, Quiz, QuizQuestion, AnswerLog models | ✅ Built |
| AI integration (Gemini) — geminiService.js with chat, quiz, explain | ✅ Built |
| Frontend pages — Landing, Upload, Chat, Quiz, Dashboard | ✅ Built |
| Frontend components — Navbar, FileUploader, ChatWindow, ChatMessage, QuizCard, QuizResult, TopicBar, ExplainModal | ✅ Built |
| Lib utilities — utils.js, api.js, store.js (Redux) | ✅ Built |
| Design system — Dark mode, glassmorphism, animations, gradients | ✅ Built |

---

## Project Structure (Final)

```
hackathon/3tier-docker-master/
├── client/                          # Next.js 16 Frontend
│   ├── app/
│   │   ├── layout.js                # Root layout (font, providers, navbar)
│   │   ├── globals.css              # Tailwind + custom design tokens
│   │   ├── page.js                  # Landing / Home page
│   │   ├── upload/
│   │   │   └── page.js              # PDF Upload page
│   │   ├── chat/
│   │   │   └── page.js              # AI Chat page (RAG Q&A)
│   │   ├── quiz/
│   │   │   └── page.js              # Quiz page (MCQ)
│   │   └── dashboard/
│   │       └── page.js              # Weak-topic Dashboard
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components (Button, Card, Dialog, etc.)
│   │   ├── Navbar.jsx               # Navigation bar
│   │   ├── FileUploader.jsx         # Drag-and-drop PDF upload
│   │   ├── ChatWindow.jsx           # Chat message list + input
│   │   ├── ChatMessage.jsx          # Individual chat bubble
│   │   ├── QuizCard.jsx             # MCQ question card
│   │   ├── QuizResult.jsx           # Quiz result summary
│   │   ├── TopicBar.jsx             # Accuracy bar per topic
│   │   └── ExplainModal.jsx         # "Explain again, simpler" modal
│   ├── lib/
│   │   ├── utils.js                 # cn() helper (shadcn)
│   │   ├── api.js                   # Axios instance + API functions
│   │   └── store.js                 # Redux store setup
│   └── package.json
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── index.js                 # Express app entry point
│   │   ├── routes/
│   │   │   ├── upload.js            # POST /api/upload
│   │   │   ├── chat.js              # POST /api/chat
│   │   │   ├── quiz.js              # POST /api/generate-quiz
│   │   │   ├── answer.js            # POST /api/submit-answer
│   │   │   ├── explain.js           # POST /api/explain
│   │   │   └── dashboard.js         # GET  /api/dashboard/:studentId
│   │   ├── services/
│   │   │   ├── pdfService.js        # PDF parsing + chunking
│   │   │   ├── ragService.js        # Retrieval (keyword/embedding)
│   │   │   ├── geminiService.js     # Gemini API wrapper
│   │   │   └── quizService.js       # Quiz generation + scoring
│   │   ├── middleware/
│   │   │   └── errorHandler.js      # Global error handler
│   │   └── utils/
│   │       └── chunker.js           # Text splitting utility
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   └── seed.js                  # Optional seed data
│   ├── Dockerfile
│   ├── package.json
│   └── .env                         # GEMINI_API_KEY, DATABASE_URL
│
└── docker-compose.yml               # Updated with server config
```

---

## Phase 1: Backend Setup (Server + Database)

### 1.1 Server Scaffold

**`server/package.json`**
```json
{
  "name": "sohopathi-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js",
    "db:generate": "npx prisma generate",
    "db:push": "npx prisma db push",
    "db:migrate": "npx prisma migrate dev",
    "db:seed": "node prisma/seed.js"
  }
}
```

**Dependencies:**
- `express`, `cors`, `dotenv`, `multer` — API server essentials
- `pdf-parse` — PDF text extraction
- `@google/genai` — Gemini API SDK
- `@prisma/client` — Database ORM
- `prisma` (devDep) — Schema management

**`server/.env`**
```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://postgres:postgres@db:5432/test_db
PORT=5000
```

---

### 1.2 Prisma Schema

**`server/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Course {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  chunks    Chunk[]
  quizzes   Quiz[]
}

model Chunk {
  id       String @id @default(cuid())
  courseId  String
  course   Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  text     String
  index    Int
}

model Quiz {
  id        String         @id @default(cuid())
  courseId   String
  course    Course         @relation(fields: [courseId], references: [id], onDelete: Cascade)
  createdAt DateTime       @default(now())
  questions QuizQuestion[]
}

model QuizQuestion {
  id           String      @id @default(cuid())
  quizId       String
  quiz         Quiz        @relation(fields: [quizId], references: [id], onDelete: Cascade)
  question     String
  options      String[]
  correctIndex Int
  topic        String
  answers      AnswerLog[]
}

model AnswerLog {
  id         String       @id @default(cuid())
  studentId  String
  questionId String
  question   QuizQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  selected   Int
  correct    Boolean
  topic      String
  createdAt  DateTime     @default(now())

  @@index([studentId, topic])
}
```

**Design Decisions:**
- `Chunk` — PDF text ~500-word pieces, linked to Course
- `QuizQuestion` — Gemini-generated MCQs with topic tags
- `AnswerLog` — Per-student tracking, topic denormalized for fast dashboard queries
- No full auth — `studentId` simple string (hackathon scope)

---

### 1.3 Backend API Routes

#### `POST /api/upload`
- Accept PDF via multer + `courseName` string
- Extract text with `pdf-parse`, chunk into ~500-word pieces
- Save to `Chunk` table via Prisma
- Response: `{ courseId, chunkCount }`

#### `POST /api/chat`
- RAG-based Q&A
- Retrieve top-k relevant chunks (keyword overlap scoring)
- Send to Gemini: "Answer ONLY from context, cite source, say honestly if not found"
- Request: `{ courseId, question }`
- Response: `{ answer, sources[] }`

#### `POST /api/generate-quiz`
- Generate 5–10 MCQs from course material via Gemini
- Use `responseMimeType: "application/json"` for structured output
- Save questions to DB with topic tags
- Request: `{ courseId }`
- Response: `{ quizId, questions[] }`

#### `POST /api/submit-answer`
- Log student's answer, check correctness
- Request: `{ studentId, questionId, selected }`
- Response: `{ correct, correctIndex }`

#### `GET /api/dashboard/:studentId`
- Weak-topic aggregation (deterministic, no AI)
- Group AnswerLog by topic → accuracy per topic → sort ascending
- Response: `{ weakTopics: [{ topic, accuracy, total, correct }] }`

#### `POST /api/explain`
- "Explain again, simpler" — Gemini re-explains weak topic
- Retrieves course chunks + simplified explanation prompt
- Request: `{ courseId, topic }`
- Response: `{ explanation }`

---

### 1.4 Services

**`pdfService.js`**
- `extractText(buffer)` — pdf-parse wrapper
- `chunkText(text, wordLimit=500)` — Sliding window text splitter

**`ragService.js`**
- `retrieveChunks(courseId, question, k=4)` — Keyword overlap scoring (TF-based)
- Tokenize question → score each chunk by term overlap → return top-k

**`geminiService.js`**
- Singleton `GoogleGenAI` instance using `gemini-2.5-flash`
- `chatWithContext(context, question)` — Grounded Q&A
- `generateQuiz(material)` — Structured JSON quiz generation
- `explainSimpler(context, topic)` — Simplified re-explanation

**`quizService.js`**
- `createQuiz(courseId, questions)` — Save quiz + questions to DB
- `checkAnswer(questionId, selected)` — Verify correctness

---

## Phase 2: Frontend (Next.js Pages + Components)

### 2.1 Layout & Design System

**`app/layout.js`** — Update:
- Metadata: title="Sohopathi — AI Study Companion"
- Google Font (Inter/Outfit)
- Redux Provider wrapper
- `<Navbar />` component
- `<Toaster />` from sonner for notifications

**`app/globals.css`** — Update:
- Dark mode default with deep indigo/violet/emerald theme
- Glassmorphism utility classes
- Smooth transitions & micro-animations
- Custom gradient accent colors

---

### 2.2 Pages

#### Landing Page — `app/page.js`
- Hero section: App name, tagline, animated gradient background
- Feature cards showing Upload → Chat → Quiz → Dashboard flow
- CTA button → navigate to `/upload`

#### PDF Upload — `app/upload/page.js`
- Course name input (React Hook Form + Zod validation)
- Drag-and-drop PDF upload zone with progress indicator
- Upload history list (courses already uploaded)
- On success → navigate to `/chat?courseId=xxx`

#### AI Chat — `app/chat/page.js`
- Course selector dropdown (if multiple courses)
- Chat message list with auto-scroll
- User bubbles + AI response with cited sources
- Input box + send button
- "Generate Quiz" CTA button

#### Quiz — `app/quiz/page.js`
- MCQ question cards (one at a time)
- Option selection with immediate green/red feedback
- Progress indicator (question 3/5)
- Results summary → link to Dashboard

#### Dashboard — `app/dashboard/page.js`
- Topic accuracy bars sorted weakest-first (red → yellow → green)
- Per-topic stats: accuracy %, total questions, correct/wrong
- "Explain Again" button per weak topic → ExplainModal
- Overall accuracy summary card

---

### 2.3 Components

| Component | Description |
|---|---|
| `Navbar.jsx` | Logo + nav links (Upload, Chat, Quiz, Dashboard), active highlighting, mobile hamburger |
| `FileUploader.jsx` | Drag-and-drop zone, PDF validation, upload progress bar, sonner toasts |
| `ChatWindow.jsx` | Message list container, auto-scroll, typing animation, source citations |
| `ChatMessage.jsx` | User/AI message styling, markdown rendering (react-markdown), source badges |
| `QuizCard.jsx` | Question + topic badge, 4 option buttons, correct/wrong animation |
| `QuizResult.jsx` | Score summary (3/5), per-topic breakdown, CTA buttons |
| `TopicBar.jsx` | Horizontal accuracy bar with gradient, topic name + %, click → explain |
| `ExplainModal.jsx` | Radix Dialog modal, topic header, AI simplified explanation, loading state |

---

### 2.4 API Client & State

**`lib/api.js`**
```js
// Axios instance
const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
});

// Functions
export const uploadPDF = (formData) => API.post("/upload", formData);
export const sendChat = (courseId, question) => API.post("/chat", { courseId, question });
export const generateQuiz = (courseId) => API.post("/generate-quiz", { courseId });
export const submitAnswer = (studentId, questionId, selected) => API.post("/submit-answer", { studentId, questionId, selected });
export const getDashboard = (studentId) => API.get(`/dashboard/${studentId}`);
export const explainTopic = (courseId, topic) => API.post("/explain", { courseId, topic });
```

**`lib/store.js`** — Redux slices:
- `courseSlice` — uploaded courses list
- `chatSlice` — chat messages array
- `quizSlice` — quiz questions + answers

---

## Phase 3: Docker & Deployment

### Server Dockerfile
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 5000
CMD ["node", "src/index.js"]
```

### Docker Compose Update
- Ensure `server` service build context → `./server`
- `DATABASE_URL` environment variable properly set
- Prisma migration on startup

---

## Build Order (Step-by-step)

| Step | Task | Est. Time |
|------|-------|-----------|
| 1 | Server scaffold — `package.json`, install deps, `.env` | 5 min |
| 2 | Prisma schema + `db push` | 10 min |
| 3 | PDF upload route — `pdfService`, `upload.js` | 15 min |
| 4 | RAG service — `ragService`, `chat.js` | 15 min |
| 5 | Gemini integration — `geminiService.js` | 10 min |
| 6 | Quiz generation — `quiz.js`, `quizService.js` | 15 min |
| 7 | Answer submission + Dashboard — `answer.js`, `dashboard.js` | 10 min |
| 8 | Explain endpoint — `explain.js` | 5 min |
| 9 | Frontend — `globals.css` + design tokens | 10 min |
| 10 | Frontend — Landing page + Navbar | 15 min |
| 11 | Frontend — Upload page + FileUploader | 20 min |
| 12 | Frontend — Chat page + ChatWindow/ChatMessage | 25 min |
| 13 | Frontend — Quiz page + QuizCard/QuizResult | 20 min |
| 14 | Frontend — Dashboard + TopicBar + ExplainModal | 20 min |
| 15 | API client + Redux integration | 10 min |
| 16 | Docker + test full flow | 15 min |
| **Total** | | **~3.5 hrs** |

---

## Verification Checklist

- [ ] Upload a real PDF → chunks saved in DB
- [ ] Ask a question in chat → grounded answer with citations
- [ ] Generate quiz → MCQ JSON with topic tags
- [ ] Answer questions (some wrong) → AnswerLog entries created
- [ ] Dashboard → weak topics sorted correctly (lowest accuracy first)
- [ ] Click "Explain Again" → simplified explanation displayed
- [ ] Full Docker Compose up → all services connected and working

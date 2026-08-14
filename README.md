# Sohopathi — Your RUET Study Companion

> সহপাঠী (Sohopathi) = "classmate" in Bengali. Feel free to rename — see "Alternative names" at the bottom.

**Tagline:** Upload your course materials, and let AI turn them into a personal tutor that knows exactly what you're weak at.

Built for the **Reimagine Learning at RUET** hackathon challenge.

---

## 1. The Problem

RUET students juggle course PDFs, slide decks, handwritten notes, WhatsApp/Messenger groups, and question banks scattered across drives and group chats. When exam season hits, two things are broken:

1. **Finding the answer inside your own materials is slow.** You know it's in some slide deck from week 6, but you don't remember which one — so you re-read everything instead of asking a direct question.
2. **Practice is generic, not personal.** Question banks are the same for everyone. Nothing tells *you specifically* which topics you're actually weak in, so revision time gets spent re-studying what you already know instead of what you don't.

## 2. The Solution

**Sohopathi** is a single, focused AI loop:

```
Upload course material (PDF/slides/notes)
        │
        ▼
 Chat with an AI tutor that answers ONLY from your material
 (with the source section cited, no hallucinated content)
        │
        ▼
 Generate a practice quiz automatically from the same material
        │
        ▼
 Student answers → system scores it → tags weak topics
        │
        ▼
 Personalized dashboard: "Focus on: Osmotic Pressure, Bode Plots"
 + one-click "explain this topic again, simpler" button
```

Nothing here requires touching notices, deadlines, or collaboration — it's deliberately narrow so it's a **real, working, demoable product** instead of an LMS skeleton.

## 3. How AI (Gemini) Is Used — and why it matters

| Feature | Gemini's job | Why it's essential (not decorative) |
|---|---|---|
| Course Q&A | Answers grounded strictly in retrieved chunks of the uploaded material (RAG) | Without grounding, students get generic textbook answers that may not match their teacher's specific notes/emphasis — the whole value is "answers *from my class*" |
| Quiz generation | Reads the material and produces structured MCQ/short-answer questions with correct answers + topic tags, returned as JSON | Manually writing practice questions is the single most time-consuming exam-prep task; this automates it from material the student already has |
| Weak-topic detection | Not Gemini directly — deterministic scoring — but Gemini tags each generated question with a topic label, which is what makes weak-topic aggregation possible | Turns raw right/wrong data into a meaningful, topic-level insight |
| "Explain again, simpler" | Re-explains a specific weak topic using a simpler-language prompt, still grounded in the same material | This is the personalization moment — same content, adapted to the student who's struggling with it |

This uses `gemini-2.5-flash` (fast + cheap, good enough for RAG QA and structured JSON generation) via the Gemini API / Google AI Studio.

---

## 4. Architecture

```
┌─────────────────┐      ┌──────────────────────┐      ┌─────────────┐
│  React frontend  │ ───▶ │  Backend API (Node)   │ ───▶ │  Gemini API │
│  (Vite + Tailwind)│      │  - /upload            │      │ (Google AI  │
│                  │ ◀─── │  - /chat               │ ◀─── │  Studio key)│
│  - Upload UI      │      │  - /generate-quiz      │      └─────────────┘
│  - Chat UI         │      │  - /submit-answer      │
│  - Quiz UI          │      │  - /dashboard           │
│  - Dashboard         │      └──────────────────────┘
└─────────────────┘                │
                                    ▼
                          ┌───────────────────┐
                          │  In-memory / SQLite │
                          │  - chunks + embeddings
                          │  - quiz questions
                          │  - answer log (per topic)
                          └───────────────────┘
```

Keep the backend as a thin proxy — **never call the Gemini API directly from the browser**, since that exposes your API key. A minimal Express server (or Next.js API routes) is enough.

---

## 5. Step-by-Step Build Guide

### Step 0 — Prerequisites (10 min)
- Node.js 18+ installed
- A free **Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey)
- Git + GitHub repo created (judges need repo access)

### Step 1 — Scaffold the project (10 min)
```bash
npm create vite@latest sohopathi-frontend -- --template react
cd sohopathi-frontend
npm install
npm install tailwindcss @tailwindcss/vite axios react-markdown
```
Set up a separate minimal backend:
```bash
mkdir sohopathi-backend && cd sohopathi-backend
npm init -y
npm install express cors dotenv multer pdf-parse @google/genai better-sqlite3
```
Create a `.env` in the backend with:
```
GEMINI_API_KEY=your_key_here
```

### Step 2 — PDF ingestion + chunking (30 min)
Backend `/upload` route:
1. Accept a PDF via `multer`.
2. Extract text with `pdf-parse`.
3. Split text into ~500-word chunks (simple sliding window is fine — don't overengineer this in 3 hours).
4. Store chunks in SQLite (or even just an in-memory array for a hackathon) with a `courseId` and `chunkId`.

```js
import pdf from "pdf-parse";

app.post("/upload", upload.single("file"), async (req, res) => {
  const data = await pdf(req.file.buffer);
  const chunks = chunkText(data.text, 500); // your helper
  saveChunks(req.body.courseId, chunks);
  res.json({ chunkCount: chunks.length });
});
```

### Step 3 — Retrieval ("RAG-lite") (30 min)
For a 3-hour build, skip a vector DB. Two good-enough options:
- **Keyword overlap scoring** (fast to build, works fine for hackathon-scale demos): score each chunk by term overlap with the user's question, take the top 3-5.
- **Gemini embeddings** (`text-embedding-004`) if you have time: embed chunks once at upload, embed the query, cosine-similarity rank. More impressive to judges, ~20 extra minutes of work.

```js
async function retrieveChunks(courseId, question, k = 4) {
  const chunks = getChunks(courseId);
  // simple scoring, or embedding cosine similarity — pick one
  return topKByRelevance(chunks, question, k);
}
```

### Step 4 — Course Q&A chat endpoint (30 min)
```js
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post("/chat", async (req, res) => {
  const { courseId, question } = req.body;
  const context = (await retrieveChunks(courseId, question))
    .map(c => c.text).join("\n---\n");

  const prompt = `You are a study assistant for a RUET course.
Answer the student's question using ONLY the context below.
If the answer isn't in the context, say so honestly — do not guess.
Cite which part of the material you used.

Context:
${context}

Question: ${question}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  res.json({ answer: response.text });
});
```

**Grounding is the whole point** — the "answer only from context, say so if not found" instruction is what separates this from a generic chatbot wrapper.

### Step 5 — Quiz generation (30 min)
```js
app.post("/generate-quiz", async (req, res) => {
  const { courseId } = req.body;
  const material = getAllChunksText(courseId); // or a relevant subset

  const prompt = `Based on this course material, generate 5 multiple-choice
practice questions. Return ONLY valid JSON, no markdown fences, in this shape:
[{"question": "...", "options": ["A","B","C","D"], "correctIndex": 0, "topic": "short topic label"}]

Material:
${material}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });
  res.json(JSON.parse(response.text));
});
```
Using `responseMimeType: "application/json"` (Gemini's structured output mode) avoids the classic "markdown fence around JSON" parsing headache.

### Step 6 — Score answers + track weak topics (20 min)
```js
app.post("/submit-answer", (req, res) => {
  const { studentId, topic, correct } = req.body;
  logAnswer(studentId, topic, correct); // insert into SQLite
  res.json({ ok: true });
});

app.get("/dashboard/:studentId", (req, res) => {
  const rows = getAnswerLog(req.params.studentId);
  const byTopic = groupBy(rows, "topic");
  const weakTopics = Object.entries(byTopic)
    .map(([topic, answers]) => ({
      topic,
      accuracy: answers.filter(a => a.correct).length / answers.length,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
  res.json({ weakTopics });
});
```
This part is deliberately **not** AI — it's plain aggregation. Judges like seeing you know when *not* to use AI too.

### Step 7 — "Explain again, simpler" (15 min)
Reuse the `/chat` endpoint with a modified prompt when the user clicks a weak topic:
```
Explain "{topic}" from this course material in the simplest way possible,
using an analogy a first-year student would understand. Context: {chunks}
```

### Step 8 — Frontend (60–90 min)
Four screens, kept minimal:
1. **Upload** — drag-and-drop PDF, course name input.
2. **Chat** — message list + input box, cite the retrieved snippet under the answer.
3. **Quiz** — question cards, select an option, immediate right/wrong + explanation.
4. **Dashboard** — sorted list of topics by accuracy (red → green), with an "explain again" button per weak topic.

Keep styling simple and clean (Tailwind defaults are fine) — polish loses to *working* every time in a 3-hour window.

### Step 9 — Deploy (20 min)
- **Frontend:** Vercel (`vercel deploy`) or Netlify — fastest for a Vite app.
- **Backend:** Google Cloud Run (matches the suggested stack and is genuinely fast to deploy):
```bash
gcloud run deploy sohopathi-backend --source . --allow-unauthenticated --set-env-vars GEMINI_API_KEY=your_key
```
Or Render/Railway if you want zero-config simplicity instead.

### Step 10 — Record the demo video (15 min)
Script it tightly for the 2-minute cap:
1. (0:00–0:15) State the problem in one sentence.
2. (0:15–0:45) Upload a real course PDF, ask it a question, show the grounded answer.
3. (0:45–1:30) Generate a quiz, answer a couple wrong on purpose.
4. (1:30–2:00) Show the dashboard surfacing the weak topic, click "explain again."

A plain screen recording is explicitly fine per the rules — don't spend time editing.

---

## 6. Submission Checklist (Devpost)

- [ ] **Project Name:** Sohopathi (or your chosen name)
- [ ] **Tagline:** one sentence (see top of this doc)
- [ ] **Description:** problem / solution / how it works / AI usage (Sections 1–3 above, trimmed)
- [ ] **Demo video:** ≤ 2 min, screen recording is enough
- [ ] **GitHub repo:** public, or explicitly shared with judges
- [ ] **Built With:** e.g. `React, Vite, Tailwind CSS, Node.js, Express, Gemini API (gemini-2.5-flash), SQLite, Google Cloud Run`
- [ ] **Gemini Usage:** paste/trim Section 3's table into prose
- [ ] **Live Demo URL:** Vercel/Cloud Run link if deployed in time

---

## 7. If you have extra time (stretch ideas, in priority order)

1. **Real embeddings retrieval** instead of keyword overlap — more technically impressive, ~20 min.
2. **Multi-course support** — course selector dropdown, minimal extra work since `courseId` is already threaded through.
3. **Spaced-repetition style quiz** — resurface weak-topic questions more often.
4. **Assignment hint mode** — same grounded-chat endpoint, but with a system prompt that gives hints/explanations instead of direct answers (matches the "AI Assignment Assistant" example from the brief).

Resist adding more than one of these — a judge remembers one thing done well far more than five things done half-way.

## Alternative project names
- **RUET Sensei**
- **StudyLoop RUET**
- **Poroshuna** (পড়াশোনা — "studies")
- **ClassMate AI**

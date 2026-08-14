# Sohopathi — Your RUET Study Companion

> সহপাঠী (Sohopathi) = "classmate" in Bengali.

**Tagline:** Upload your course materials, and let AI turn them into a personal tutor that knows exactly what you're weak at. 
Built for the **Reimagine Learning at RUET** hackathon challenge.

## 🚀 The Problem

RUET students juggle course PDFs, slide decks, handwritten notes, WhatsApp/Messenger groups, and question banks scattered across drives and group chats. When exam season hits, two things are broken:

1. **Finding the answer inside your own materials is slow.** You know it's in some slide deck from week 6, but you don't remember which one — so you re-read everything instead of asking a direct question.
2. **Practice is generic, not personal.** Question banks are the same for everyone. Nothing tells *you specifically* which topics you're actually weak in, so revision time gets spent re-studying what you already know instead of what you don't.

## 💡 The Solution

**Sohopathi** is a single, focused AI loop:

1. **Upload** course material (PDF/slides/notes)
2. **Chat** with an AI tutor that answers ONLY from your material (with the source section cited, no hallucinated content)
3. **Generate** a practice quiz automatically from the same material
4. **Answer & Score**: Student answers → system scores it → tags weak topics
5. **Personalized Dashboard**: Get actionable insights ("Focus on: Osmotic Pressure") + a one-click "explain this topic again, simpler" button

## 🛠️ Tech Stack & Architecture

This project is built using modern full-stack technologies and containerized for easy deployment and scalability.

### Core Stack
- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** PostgreSQL with Prisma ORM
- **AI Integration:** Google Gemini API (`gemini-2.5-flash`) for RAG (Retrieval-Augmented Generation) and structured quiz generation.

### DevOps & Monitoring
- **Containerization:** Docker & Docker Compose
- **Logging:** Grafana Loki
- **Metrics:** Prometheus
- **Dashboards:** Grafana

### System Architecture
The application runs as a multi-container Docker application:
*   `client`: Next.js frontend (Port 3000)
*   `server`: Node.js API backend (Port 5000)
*   `db`: PostgreSQL database (Port 5432)
*   `prometheus`: Metrics scraping (Port 9090)
*   `loki`: Log aggregation (Port 3100)
*   `grafana`: Observability dashboard (Port 3001)

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose (optional, for full stack deployment)
- A [Google Gemini API Key](https://aistudio.google.com/apikey)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/AhsanMosharof/SohoPathi.git
   cd SohoPathi
   ```

2. **Environment Variables**
   Set up your `.env` files in both `client` and `server` directories based on the provided `.env.example` files.
   - For `server/.env`, ensure you add your `GEMINI_API_KEY` and set the `DATABASE_URL`.

3. **Running the application (Without Docker)**
   We provide a handy batch script to run the local development servers for both frontend and backend on Windows.
   - Ensure your local PostgreSQL database is running on `localhost:5432`.
   - Run the script inside the `SohoPathi` folder:
     ```cmd
     run_local.bat
     ```
   - The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:5000`.

### Running with Docker Compose (Recommended)

To start the entire application stack including the database and monitoring tools:

```bash
cd SohoPathi
docker-compose up --build -d
```

**Services will be available at:**
- Frontend App: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Grafana Dashboard: `http://localhost:3001` (Default credentials: `admin` / `admin`)
- Prometheus: `http://localhost:9090`

To stop the services:
```bash
docker-compose down
```

## 🤖 How AI (Gemini) Is Used

| Feature | Gemini's job | Why it matters |
|---|---|---|
| Course Q&A | Answers grounded strictly in retrieved chunks of the uploaded material (RAG) | Ensures students get answers from their teacher's specific notes, not generic textbook answers. |
| Quiz generation | Reads the material and produces structured MCQ/short-answer questions with correct answers + topic tags | Automates the single most time-consuming exam-prep task directly from the student's material. |
| Weak-topic detection | Tags each generated question with a topic label | Turns raw right/wrong data into meaningful, topic-level insights for targeted study. |
| "Explain again, simpler" | Re-explains a specific weak topic using a simpler-language prompt | Personalizes learning by adapting the same content for the struggling student. |

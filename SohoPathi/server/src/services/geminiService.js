/**
 * Gemini AI Service — Wrapper for Google Gemini 2.5 Flash
 */
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Grounded Q&A — answer ONLY from the provided context
 */
async function chatWithContext(context, question) {
  const prompt = `You are "Sohopathi" (সহপাঠী), an AI study assistant for RUET students.
Answer the student's question using ONLY the context below.
If the answer isn't in the context, say so honestly — do not guess or hallucinate.
Cite which part of the material you used.
Use clear, simple language. You may use Bengali words if it helps explain concepts.

Context:
${context}

Question: ${question}

Answer:`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
}

/**
 * Generate MCQ quiz from course material — returns structured JSON
 */
async function generateQuiz(material, numQuestions = 5) {
  const prompt = `Based on this course material, generate ${numQuestions} multiple-choice practice questions.
Each question must have exactly 4 options (A, B, C, D).
Each question must have a "topic" label (a short 2-4 word topic name from the material).
Make the questions challenging but fair — test understanding, not memorization.

Return ONLY valid JSON array in this exact shape:
[{"question": "...", "options": ["A option", "B option", "C option", "D option"], "correctIndex": 0, "topic": "short topic label"}]

Material:
${material}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  return JSON.parse(response.text);
}

/**
 * Explain a topic in simpler language, grounded in course material
 */
async function explainSimpler(context, topic) {
  const prompt = `You are "Sohopathi" (সহপাঠী), an AI study assistant for RUET students.
The student is struggling with the topic "${topic}".
Explain this topic from the course material in the simplest way possible.
Use analogies, examples, and step-by-step explanations that a first-year student would understand.
You may use Bengali words or references familiar to Bangladeshi students if it helps.

Course Material Context:
${context}

Explain "${topic}" simply:`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
}

module.exports = { chatWithContext, generateQuiz, explainSimpler };

import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  timeout: 60000, // 60s for AI responses
});

// PDF Upload
export const uploadPDF = (formData) => API.post("/upload", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});

// Get all courses
export const getCourses = () => API.get("/upload/courses");

// RAG Chat
export const sendChat = (courseId, question) =>
  API.post("/chat", { courseId, question });

// Generate Quiz
export const generateQuiz = (courseId) =>
  API.post("/generate-quiz", { courseId });

// Submit Answer
export const submitAnswer = (studentId, questionId, selected) =>
  API.post("/submit-answer", { studentId, questionId, selected });

// Dashboard
export const getDashboard = (studentId) =>
  API.get(`/dashboard/${studentId}`);

// Explain topic
export const explainTopic = (courseId, topic) =>
  API.post("/explain", { courseId, topic });

export default API;

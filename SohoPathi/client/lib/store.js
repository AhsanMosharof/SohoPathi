"use client";

import { configureStore, createSlice } from "@reduxjs/toolkit";

// Load chat messages from localStorage (safe for SSR)
function loadMessages() {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("sohopathi_chat_messages");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Save chat messages to localStorage (safe for SSR)
function saveMessages(messages) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("sohopathi_chat_messages", JSON.stringify(messages));
  } catch {}
}

// Course slice
const courseSlice = createSlice({
  name: "course",
  initialState: {
    courses: [],
    activeCourseId: null,
  },
  reducers: {
    setCourses: (state, action) => {
      state.courses = action.payload;
    },
    addCourse: (state, action) => {
      state.courses.unshift(action.payload);
    },
    setActiveCourse: (state, action) => {
      state.activeCourseId = action.payload;
    },
  },
});

// Chat slice — initialized from localStorage
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    loading: false,
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      saveMessages(state.messages);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      saveMessages([]);
    },
    loadPersistedMessages: (state) => {
      state.messages = loadMessages();
    },
  },
});

// Quiz slice
const quizSlice = createSlice({
  name: "quiz",
  initialState: {
    quizId: null,
    questions: [],
    currentIndex: 0,
    answers: [],
    completed: false,
  },
  reducers: {
    setQuiz: (state, action) => {
      state.quizId = action.payload.quizId;
      state.questions = action.payload.questions;
      state.currentIndex = 0;
      state.answers = [];
      state.completed = false;
    },
    addAnswer: (state, action) => {
      state.answers.push(action.payload);
    },
    nextQuestion: (state) => {
      if (state.currentIndex < state.questions.length - 1) {
        state.currentIndex += 1;
      } else {
        state.completed = true;
      }
    },
    resetQuiz: (state) => {
      state.quizId = null;
      state.questions = [];
      state.currentIndex = 0;
      state.answers = [];
      state.completed = false;
    },
  },
});

export const { setCourses, addCourse, setActiveCourse } = courseSlice.actions;
export const { addMessage, setLoading, clearMessages, loadPersistedMessages } = chatSlice.actions;
export const { setQuiz, addAnswer, nextQuestion, resetQuiz } = quizSlice.actions;

const store = configureStore({
  reducer: {
    course: courseSlice.reducer,
    chat: chatSlice.reducer,
    quiz: quizSlice.reducer,
  },
});

export default store;

"use client";

import { configureStore, createSlice } from "@reduxjs/toolkit";

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

// Chat slice
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    loading: false,
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
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
export const { addMessage, setLoading, clearMessages } = chatSlice.actions;
export const { setQuiz, addAnswer, nextQuestion, resetQuiz } = quizSlice.actions;

const store = configureStore({
  reducer: {
    course: courseSlice.reducer,
    chat: chatSlice.reducer,
    quiz: quizSlice.reducer,
  },
});

export default store;

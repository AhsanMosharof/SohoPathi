/**
 * Quiz Route — POST /api/generate-quiz
 * Generate MCQ questions from course material using Gemini
 */
const express = require('express');
const { getAllChunksText } = require('../services/ragService');
const { generateQuiz } = require('../services/geminiService');
const { createQuiz } = require('../services/quizService');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, error: 'courseId is required' });
    }

    // Get all course material
    const material = await getAllChunksText(courseId);

    if (!material || material.trim().length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No course material found. Upload a PDF first.',
      });
    }

    // Truncate material if too long (Gemini context limit)
    const truncated = material.length > 30000 ? material.substring(0, 30000) : material;

    // Generate quiz via Gemini
    const questions = await generateQuiz(truncated, 5);

    // Save to DB
    const quiz = await createQuiz(courseId, questions);

    res.json({
      success: true,
      quizId: quiz.id,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        topic: q.topic,
        // Don't send correctIndex to client during quiz
      })),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

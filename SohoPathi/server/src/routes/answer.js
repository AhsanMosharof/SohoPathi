/**
 * Answer Route — POST /api/submit-answer
 * Log student's answer and check correctness
 */
const express = require('express');
const { checkAnswer } = require('../services/quizService');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { studentId, questionId, selected } = req.body;

    if (!studentId || !questionId || selected === undefined) {
      return res.status(400).json({
        success: false,
        error: 'studentId, questionId, and selected are required',
      });
    }

    const result = await checkAnswer(studentId, questionId, selected);

    res.json({
      success: true,
      correct: result.correct,
      correctIndex: result.correctIndex,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

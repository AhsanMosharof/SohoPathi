/**
 * Dashboard Route — GET /api/dashboard/:studentId
 * Weak-topic aggregation (deterministic, no AI)
 */
const express = require('express');
const { getWeakTopics } = require('../services/quizService');

const router = express.Router();

router.get('/:studentId', async (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ success: false, error: 'studentId is required' });
    }

    const weakTopics = await getWeakTopics(studentId);

    // Calculate overall stats
    const totalQuestions = weakTopics.reduce((sum, t) => sum + t.total, 0);
    const totalCorrect = weakTopics.reduce((sum, t) => sum + t.correct, 0);
    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    res.json({
      success: true,
      studentId,
      overallAccuracy,
      totalQuestions,
      totalCorrect,
      weakTopics,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

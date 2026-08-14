/**
 * Explain Route — POST /api/explain
 * "Explain again, simpler" — Gemini re-explains weak topic
 */
const express = require('express');
const { retrieveChunks } = require('../services/ragService');
const { explainSimpler } = require('../services/geminiService');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { courseId, topic } = req.body;

    if (!courseId || !topic) {
      return res.status(400).json({
        success: false,
        error: 'courseId and topic are required',
      });
    }

    // Retrieve chunks relevant to the topic
    const chunks = await retrieveChunks(courseId, topic, 5);
    const context = chunks.map((c) => c.text).join('\n\n---\n\n');

    // Get simplified explanation from Gemini
    const explanation = await explainSimpler(context, topic);

    res.json({
      success: true,
      topic,
      explanation,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

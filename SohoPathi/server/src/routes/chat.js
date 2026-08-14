/**
 * Chat Route — POST /api/chat
 * RAG-based Q&A grounded in course material
 */
const express = require('express');
const { retrieveChunks } = require('../services/ragService');
const { chatWithContext } = require('../services/geminiService');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { courseId, question } = req.body;

    if (!courseId || !question) {
      return res.status(400).json({
        success: false,
        error: 'courseId and question are required',
      });
    }

    // Retrieve relevant chunks
    const chunks = await retrieveChunks(courseId, question, 4);

    if (chunks.length === 0) {
      return res.json({
        success: true,
        answer: 'No course material found. Please upload a PDF first.',
        sources: [],
      });
    }

    // Build context from chunks
    const context = chunks
      .map((c, i) => `[Source ${i + 1}] (Chunk ${c.index + 1}):\n${c.text}`)
      .join('\n\n---\n\n');

    // Get AI answer
    const answer = await chatWithContext(context, question);

    res.json({
      success: true,
      answer,
      sources: chunks.map((c) => ({
        chunkIndex: c.index,
        preview: c.text.substring(0, 150) + '...',
      })),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

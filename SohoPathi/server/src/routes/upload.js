/**
 * Upload Route — POST /api/upload
 * Accept PDF file + courseName, extract text, chunk, and save to DB
 */
const express = require('express');
const multer = require('multer');
const prisma = require('../prismaClient');
const { extractAndChunk } = require('../services/pdfService');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const { courseName } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No PDF file uploaded' });
    }

    if (!courseName || courseName.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Course name is required' });
    }

    // Extract text and chunk it
    const { chunks } = await extractAndChunk(file.buffer, 500);

    if (chunks.length === 0) {
      return res.status(400).json({ success: false, error: 'Could not extract text from PDF' });
    }

    // Create course and chunks in DB
    const course = await prisma.course.create({
      data: {
        name: courseName.trim(),
        chunks: {
          create: chunks.map((text, index) => ({
            text,
            index,
          })),
        },
      },
    });

    res.json({
      success: true,
      courseId: course.id,
      courseName: course.name,
      chunkCount: chunks.length,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/upload/courses — list all courses
router.get('/courses', async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: { select: { chunks: true } },
      },
    });

    res.json({ success: true, courses });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

/**
 * PDF Service — Extract text from PDF using Gemini (inline data)
 * and image files too. Falls back to chunking for downstream use.
 */
const { chunkText } = require('../utils/chunker');
const { extractTextFromImage } = require('./geminiService');

/**
 * Extract text from a PDF buffer using Gemini's vision capability
 */
async function extractTextFromPDF(buffer) {
  return await extractTextFromImage(buffer, 'application/pdf');
}

/**
 * Extract raw text from a buffer (PDF or Image) using Gemini
 */
async function extractText(buffer, mimeType = 'application/pdf') {
  return await extractTextFromImage(buffer, mimeType);
}

/**
 * Extract and chunk PDF text in one step
 */
async function extractAndChunk(buffer, wordLimit = 500) {
  const text = await extractTextFromPDF(buffer);
  const chunks = chunkText(text, wordLimit);
  return { text, chunks };
}

module.exports = { extractText, extractAndChunk, chunkText };

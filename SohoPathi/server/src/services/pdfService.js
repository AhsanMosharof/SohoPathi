/**
 * PDF Service — Extract text from PDF using pdf-parse (CJS v1.1.1)
 * For images, falls back to Gemini vision.
 */
const pdfParse = require('pdf-parse');
const { chunkText } = require('../utils/chunker');

/**
 * Extract raw text from a PDF buffer
 */
async function extractTextFromPDF(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

/**
 * Extract and chunk PDF text in one step
 */
async function extractAndChunk(buffer, wordLimit = 500) {
  const text = await extractTextFromPDF(buffer);
  const chunks = chunkText(text, wordLimit);
  return { text, chunks };
}

module.exports = { extractTextFromPDF, extractAndChunk, chunkText };

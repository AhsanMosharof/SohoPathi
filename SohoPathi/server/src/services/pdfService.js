/**
 * PDF Service — Extract text from PDF buffers and chunk them
 */
const pdf = require('pdf-parse');
const { chunkText } = require('../utils/chunker');

/**
 * Extract raw text from a PDF buffer
 */
async function extractText(buffer) {
  const data = await pdf(buffer);
  return data.text;
}

/**
 * Extract and chunk PDF text in one step
 */
async function extractAndChunk(buffer, wordLimit = 500) {
  const text = await extractText(buffer);
  const chunks = chunkText(text, wordLimit);
  return { text, chunks };
}

module.exports = { extractText, extractAndChunk, chunkText };

/**
 * Text chunking utility for splitting PDF text into manageable pieces
 */

/**
 * Split text into chunks of approximately `wordLimit` words
 * Uses a sliding window approach with overlap for better context preservation
 */
function chunkText(text, wordLimit = 500) {
  if (!text || text.trim().length === 0) return [];

  // Clean the text
  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim();

  const words = cleaned.split(/\s+/);

  if (words.length <= wordLimit) {
    return [cleaned];
  }

  const chunks = [];
  const overlap = Math.floor(wordLimit * 0.1); // 10% overlap
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + wordLimit, words.length);
    const chunk = words.slice(start, end).join(' ');
    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }
    start = end - overlap;
    if (start >= words.length - overlap) break;
  }

  return chunks;
}

module.exports = { chunkText };

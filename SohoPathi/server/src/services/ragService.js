/**
 * RAG Service — Retrieve relevant chunks using keyword overlap scoring
 */
const prisma = require('../prismaClient');

/**
 * Tokenize text into lowercase words, removing stop words
 */
function tokenize(text) {
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
    'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
    'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
    'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
    'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
    'and', 'but', 'or', 'nor', 'if', 'that', 'which', 'what', 'this',
    'these', 'those', 'it', 'its', 'i', 'me', 'my', 'we', 'our', 'you',
    'your', 'he', 'him', 'his', 'she', 'her', 'they', 'them', 'their',
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1 && !stopWords.has(word));
}

/**
 * Score a chunk by term overlap with the query
 */
function scoreChunk(queryTokens, chunkText) {
  const chunkTokens = new Set(tokenize(chunkText));
  let score = 0;
  for (const token of queryTokens) {
    if (chunkTokens.has(token)) {
      score += 1;
    }
  }
  return score;
}

/**
 * Retrieve the top-k most relevant chunks for a question
 */
async function retrieveChunks(courseId, question, k = 4) {
  const chunks = await prisma.chunk.findMany({
    where: { courseId },
    orderBy: { index: 'asc' },
  });

  if (chunks.length === 0) return [];

  const queryTokens = tokenize(question);

  const scored = chunks
    .map((chunk) => ({
      ...chunk,
      score: scoreChunk(queryTokens, chunk.text),
    }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  // If no keyword matches, return first k chunks as fallback
  if (scored.length === 0) {
    return chunks.slice(0, k);
  }

  return scored;
}

/**
 * Get all chunk text for a course (for quiz generation)
 */
async function getAllChunksText(courseId) {
  const chunks = await prisma.chunk.findMany({
    where: { courseId },
    orderBy: { index: 'asc' },
  });
  return chunks.map((c) => c.text).join('\n\n---\n\n');
}

module.exports = { retrieveChunks, getAllChunksText, tokenize };

/**
 * Quiz Service — Create quizzes and check answers via Prisma
 */
const prisma = require('../prismaClient');

/**
 * Save a generated quiz and its questions to the database
 */
async function createQuiz(courseId, questions) {
  const quiz = await prisma.quiz.create({
    data: {
      courseId,
      questions: {
        create: questions.map((q) => ({
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          topic: q.topic,
        })),
      },
    },
    include: {
      questions: true,
    },
  });

  return quiz;
}

/**
 * Check a student's answer and log it
 */
async function checkAnswer(studentId, questionId, selected) {
  const question = await prisma.quizQuestion.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    throw Object.assign(new Error('Question not found'), { statusCode: 404 });
  }

  const correct = selected === question.correctIndex;

  await prisma.answerLog.create({
    data: {
      studentId,
      questionId,
      selected,
      correct,
      topic: question.topic,
    },
  });

  return { correct, correctIndex: question.correctIndex };
}

/**
 * Get weak topics for a student (dashboard data)
 */
async function getWeakTopics(studentId) {
  const logs = await prisma.answerLog.findMany({
    where: { studentId },
  });

  if (logs.length === 0) return [];

  // Group by topic
  const topicMap = {};
  for (const log of logs) {
    if (!topicMap[log.topic]) {
      topicMap[log.topic] = { total: 0, correct: 0 };
    }
    topicMap[log.topic].total += 1;
    if (log.correct) topicMap[log.topic].correct += 1;
  }

  // Convert to array sorted by accuracy ascending (weakest first)
  const weakTopics = Object.entries(topicMap)
    .map(([topic, stats]) => ({
      topic,
      accuracy: Math.round((stats.correct / stats.total) * 100),
      total: stats.total,
      correct: stats.correct,
      wrong: stats.total - stats.correct,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  return weakTopics;
}

module.exports = { createQuiz, checkAnswer, getWeakTopics };

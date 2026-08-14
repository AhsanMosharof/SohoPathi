"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Brain, Loader2 } from "lucide-react";
import QuizCard from "@/components/QuizCard";
import QuizResult from "@/components/QuizResult";
import { generateQuiz, submitAnswer } from "@/lib/api";

const STUDENT_ID = "student-demo-001"; // Simple ID for hackathon

export default function QuizPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const [loading, setLoading] = useState(false);
  const [quizId, setQuizId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [completed, setCompleted] = useState(false);

  // Generate quiz on mount
  useEffect(() => {
    if (courseId) handleGenerate();
  }, [courseId]);

  const handleGenerate = async () => {
    if (!courseId) {
      toast.error("No course selected. Go to Upload first.");
      return;
    }

    setLoading(true);
    setCompleted(false);
    setAnswers([]);
    setCurrentIndex(0);
    setCurrentResult(null);

    try {
      const res = await generateQuiz(courseId);
      setQuizId(res.data.quizId);
      setQuestions(res.data.questions);
      toast.success("Quiz generated! Good luck 🎯");
    } catch (err) {
      toast.error("Failed to generate quiz. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (selectedIndex) => {
    const question = questions[currentIndex];

    try {
      const res = await submitAnswer(STUDENT_ID, question.id, selectedIndex);
      const result = {
        selected: selectedIndex,
        correct: res.data.correct,
        correctIndex: res.data.correctIndex,
      };

      setCurrentResult(result);
      setAnswers((prev) => [...prev, result]);

      // Move to next question after 1.5s
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setCurrentResult(null);
        } else {
          setCompleted(true);
        }
      }, 1500);
    } catch (err) {
      toast.error("Failed to submit answer");
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="orb orb-2" />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Practice Quiz</h1>
          <p className="text-[var(--color-muted-foreground)]">
            AI-generated questions from your course material
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="glass rounded-xl p-12 text-center animate-fade-in">
            <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Generating your quiz...</p>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Gemini is creating questions from your course material
            </p>
          </div>
        )}

        {/* No course selected */}
        {!courseId && !loading && (
          <div className="glass rounded-xl p-12 text-center">
            <p className="text-[var(--color-muted-foreground)]">
              No course selected. <a href="/upload" className="text-[var(--color-primary)] hover:underline">Upload a PDF first</a>.
            </p>
          </div>
        )}

        {/* Quiz in progress */}
        {!loading && !completed && questions.length > 0 && (
          <QuizCard
            question={questions[currentIndex]}
            questionIndex={currentIndex}
            totalQuestions={questions.length}
            onAnswer={handleAnswer}
            answered={!!currentResult}
            result={currentResult}
          />
        )}

        {/* Quiz completed */}
        {completed && (
          <QuizResult
            answers={answers}
            totalQuestions={questions.length}
            onRetry={handleGenerate}
          />
        )}
      </div>
    </div>
  );
}

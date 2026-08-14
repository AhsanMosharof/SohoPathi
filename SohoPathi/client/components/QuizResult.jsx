"use client";

import Link from "next/link";
import { Trophy, Target, BarChart3, RotateCcw } from "lucide-react";

export default function QuizResult({ answers, totalQuestions, onRetry }) {
  const correct = answers.filter((a) => a.correct).length;
  const percentage = Math.round((correct / totalQuestions) * 100);

  const getGrade = () => {
    if (percentage >= 80) return { label: "Excellent! 🎉", color: "oklch(0.7 0.2 150)" };
    if (percentage >= 60) return { label: "Good job! 👍", color: "oklch(0.7 0.15 90)" };
    if (percentage >= 40) return { label: "Keep trying! 💪", color: "oklch(0.7 0.15 60)" };
    return { label: "Need more practice 📚", color: "oklch(0.7 0.18 25)" };
  };

  const grade = getGrade();

  return (
    <div className="glass rounded-xl p-8 text-center animate-slide-up">
      {/* Score circle */}
      <div className="relative w-32 h-32 mx-auto mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-secondary)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="42" fill="none"
            stroke={grade.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.64} 264`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{percentage}%</span>
          <span className="text-xs text-[var(--color-muted-foreground)]">{correct}/{totalQuestions}</span>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-2">{grade.label}</h2>
      <p className="text-sm text-[var(--color-muted-foreground)] mb-8">
        You answered {correct} out of {totalQuestions} questions correctly
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-secondary)] text-sm font-medium hover:bg-[var(--color-muted)] transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Try Again
        </button>
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 transition-all"
        >
          <BarChart3 className="w-4 h-4" /> View Dashboard
        </Link>
      </div>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";

export default function QuizCard({ question, questionIndex, totalQuestions, onAnswer, answered, result }) {
  return (
    <div className="glass rounded-xl p-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium px-3 py-1 rounded-full bg-[var(--color-primary)] text-white">
          {question.topic}
        </span>
        <span className="text-sm text-[var(--color-muted-foreground)]">
          {questionIndex + 1} / {totalQuestions}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 rounded-full bg-[var(--color-secondary)] mb-6">
        <div
          className="h-1 rounded-full gradient-primary transition-all duration-500"
          style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question */}
      <h3 className="text-lg font-semibold mb-6 leading-relaxed">{question.question}</h3>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, i) => {
          const isSelected = answered && result?.selected === i;
          const isCorrect = answered && result?.correctIndex === i;
          const isWrong = isSelected && !result?.correct && result?.correctIndex !== i;

          return (
            <button
              key={i}
              onClick={() => !answered && onAnswer(i)}
              disabled={answered}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-xl text-left text-sm font-medium transition-all duration-300",
                !answered && "hover:bg-[var(--color-secondary)] hover:scale-[1.01] active:scale-[0.99]",
                !answered && "bg-[var(--color-input)] border border-[var(--color-border)]",
                isCorrect && "bg-[oklch(0.3_0.15_150)] border-[oklch(0.5_0.2_150)] text-[oklch(0.85_0.15_150)]",
                isWrong && "bg-[oklch(0.3_0.12_25)] border-[oklch(0.5_0.18_25)] text-[oklch(0.85_0.12_25)]",
                answered && !isCorrect && !isWrong && "opacity-50",
              )}
            >
              <span className="w-8 h-8 rounded-lg bg-[var(--color-secondary)] flex items-center justify-center text-xs shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{option}</span>
              {isCorrect && <CheckCircle className="w-5 h-5 text-[oklch(0.7_0.2_150)]" />}
              {isWrong && <XCircle className="w-5 h-5 text-[oklch(0.7_0.18_25)]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

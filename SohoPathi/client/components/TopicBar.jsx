"use client";

import { cn } from "@/lib/utils";

export default function TopicBar({ topic, accuracy, total, correct, wrong, onExplain }) {
  const getBarColor = () => {
    if (accuracy >= 80) return "from-[oklch(0.6_0.2_150)] to-[oklch(0.7_0.18_150)]";
    if (accuracy >= 50) return "from-[oklch(0.6_0.15_90)] to-[oklch(0.7_0.13_80)]";
    return "from-[oklch(0.55_0.2_25)] to-[oklch(0.65_0.18_30)]";
  };

  return (
    <div className="glass-light rounded-xl p-4 animate-fade-in hover:scale-[1.01] transition-transform">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold">{topic}</h4>
        <span className={cn(
          "text-sm font-bold",
          accuracy >= 80 ? "text-[oklch(0.7_0.2_150)]" :
          accuracy >= 50 ? "text-[oklch(0.7_0.15_90)]" :
          "text-[oklch(0.7_0.18_25)]"
        )}>
          {accuracy}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-[var(--color-secondary)] mb-3">
        <div
          className={cn("h-2 rounded-full bg-gradient-to-r transition-all duration-700", getBarColor())}
          style={{ width: `${accuracy}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--color-muted-foreground)]">
          {correct} correct · {wrong} wrong · {total} total
        </p>
        {accuracy < 70 && (
          <button
            onClick={() => onExplain(topic)}
            className="text-xs font-medium text-[var(--color-primary)] hover:underline transition-colors"
          >
            Explain Again ✨
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { X, Loader2, Lightbulb } from "lucide-react";
import { explainTopic } from "@/lib/api";

export default function ExplainModal({ isOpen, onClose, topic, courseId }) {
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleExplain = async () => {
    if (loaded) return;
    setLoading(true);
    try {
      const res = await explainTopic(courseId, topic);
      setExplanation(res.data.explanation);
      setLoaded(true);
    } catch (err) {
      setExplanation("Failed to get explanation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when opened
  if (isOpen && !loaded && !loading) {
    handleExplain();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[80vh] glass rounded-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Simplified Explanation</h3>
              <p className="text-sm text-[var(--color-muted-foreground)]">{topic}</p>
            </div>
          </div>
          <button
            onClick={() => { onClose(); setLoaded(false); setExplanation(""); }}
            className="p-2 rounded-lg hover:bg-[var(--color-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin mb-4" />
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Sohopathi is preparing a simpler explanation...
              </p>
            </div>
          ) : (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{explanation}</div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { User, Bot, BookOpen } from "lucide-react";

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 animate-fade-in", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 mt-1">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-[var(--color-primary)] text-white rounded-br-sm"
            : "glass rounded-bl-sm"
        )}
      >
        <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>

        {/* Source citations */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-2 border-t border-[oklch(0.3_0.03_270_/_0.3)]">
            <p className="text-xs text-[var(--color-muted-foreground)] mb-1 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Sources:
            </p>
            <div className="space-y-1">
              {message.sources.map((source, i) => (
                <p key={i} className="text-xs text-[var(--color-muted-foreground)] italic">
                  [{i + 1}] Chunk {source.chunkIndex + 1}: {source.preview}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-[var(--color-secondary)] flex items-center justify-center shrink-0 mt-1">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}

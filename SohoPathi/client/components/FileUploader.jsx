"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FileUploader({ onUpload, loading }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    }
  };

  const handleChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleRemove = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300",
          dragActive
            ? "border-[var(--color-primary)] bg-[oklch(0.65_0.22_280_/_0.1)] scale-[1.02]"
            : "border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-secondary)]",
          loading && "pointer-events-none opacity-60"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          onChange={handleChange}
          className="hidden"
        />
        {loading ? (
          <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin" />
        ) : (
          <Upload className="w-10 h-10 text-[var(--color-muted-foreground)] mb-3" />
        )}
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {loading ? "Uploading & processing..." : "Drag & drop a PDF here, or click to browse"}
        </p>
        <p className="text-xs text-[var(--color-muted-foreground)] mt-1">PDF files only</p>
      </div>

      {file && !loading && (
        <div className="flex items-center gap-3 p-3 rounded-lg glass-light animate-fade-in">
          <FileText className="w-5 h-5 text-[var(--color-primary)]" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button onClick={handleRemove} className="p-1 rounded hover:bg-[var(--color-secondary)]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

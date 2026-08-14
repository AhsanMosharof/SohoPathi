"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { Upload, BookOpen, FileText, Loader2 } from "lucide-react";
import FileUploader from "@/components/FileUploader";
import { uploadPDF, getCourses } from "@/lib/api";
import { addCourse, setActiveCourse } from "@/lib/store";

export default function UploadPage() {
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [file, setFile] = useState(null);
  const router = useRouter();
  const dispatch = useDispatch();

  // Fetch existing courses
  useEffect(() => {
    getCourses()
      .then((res) => setCourses(res.data.courses || []))
      .catch(() => {});
  }, []);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    // Auto-generate course name from filename if empty
    const finalCourseName = courseName.trim() || file.name.replace(/\.[^/.]+$/, "");

    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("courseName", finalCourseName);

      const res = await uploadPDF(formData);
      
      const { courseId, chunkCount } = res.data;
      
      // Store course in local storage context (or real auth context)
      localStorage.setItem("currentCourseId", courseId);
      
      dispatch(addCourse({ id: courseId, name: finalCourseName }));
      dispatch(setActiveCourse(courseId));

      toast.success(`Uploaded! ${chunkCount} chunks extracted from your file.`);
      router.push(`/chat?courseId=${courseId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen gradient-hero">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Upload Course Material</h1>
          <p className="text-[var(--color-muted-foreground)] max-w-xl mx-auto">
            Upload a PDF or Image (Handnotes/Slides) and start chatting with your study AI
          </p>
        </div>

        {/* Upload form */}
        <div className="glass rounded-xl p-6 mb-8 animate-slide-up">
          {/* Course name */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Course Name</label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g. CSE 201 — Data Structures"
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] transition-all"
            />
          </div>

          {/* File uploader */}
          <FileUploader loading={loading} file={file} setFile={setFile} />

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="w-full mt-6 py-3 rounded-xl gradient-primary text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" /> Upload & Start Learning
              </>
            )}
          </button>
        </div>

        {/* Previously uploaded courses */}
        {courses.length > 0 && (
          <div className="animate-slide-up">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Your Courses
            </h2>
            <div className="space-y-3">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => {
                    dispatch(setActiveCourse(course.id));
                    router.push(`/chat?courseId=${course.id}`);
                  }}
                  className="w-full flex items-center gap-4 p-4 glass-light rounded-xl hover:scale-[1.01] transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-secondary)] flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{course.name}</p>
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      {course._count?.chunks || 0} chunks · {new Date(course.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

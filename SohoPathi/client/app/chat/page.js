"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Brain, MessageSquare } from "lucide-react";
import ChatWindow from "@/components/ChatWindow";
import { sendChat, getCourses } from "@/lib/api";
import { addMessage, setLoading, setActiveCourse, setCourses } from "@/lib/store";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const router = useRouter();
  const dispatch = useDispatch();

  const { messages, loading } = useSelector((state) => state.chat);
  const { courses } = useSelector((state) => state.course);

  const [localCourses, setLocalCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(courseId || "");

  // Fetch courses
  useEffect(() => {
    getCourses()
      .then((res) => {
        const courseList = res.data.courses || [];
        setLocalCourses(courseList);
        dispatch(setCourses(courseList));
        if (!selectedCourseId && courseList.length > 0) {
          setSelectedCourseId(courseList[0].id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (courseId) {
      setSelectedCourseId(courseId);
      dispatch(setActiveCourse(courseId));
    }
  }, [courseId]);

  const handleSend = async (question) => {
    if (!selectedCourseId) {
      toast.error("Please select a course first");
      return;
    }

    dispatch(addMessage({ role: "user", content: question }));
    dispatch(setLoading(true));

    try {
      const res = await sendChat(selectedCourseId, question);
      dispatch(
        addMessage({
          role: "assistant",
          content: res.data.answer,
          sources: res.data.sources,
        })
      );
    } catch (err) {
      dispatch(
        addMessage({
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        })
      );
      toast.error("Failed to get response");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const selectedCourseName = localCourses.find((c) => c.id === selectedCourseId)?.name || "Select a course";

  return (
    <div className="relative min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Course Chat</h1>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Ask questions about your course material
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Course selector */}
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
            >
              <option value="">Select course...</option>
              {localCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>

            {/* Quiz CTA */}
            {selectedCourseId && (
              <button
                onClick={() => router.push(`/quiz?courseId=${selectedCourseId}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium hover:opacity-90 transition-all"
              >
                <Brain className="w-4 h-4" /> Quiz
              </button>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <ChatWindow messages={messages} onSend={handleSend} loading={loading} />
      </div>
    </div>
  );
}

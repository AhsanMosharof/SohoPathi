"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BarChart3, TrendingDown, Award, Loader2 } from "lucide-react";
import TopicBar from "@/components/TopicBar";
import ExplainModal from "@/components/ExplainModal";
import { getDashboard, getCourses } from "@/lib/api";

const STUDENT_ID = "student-demo-001";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const courseIdParam = searchParams.get("courseId");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(courseIdParam || "");
  const [explainModal, setExplainModal] = useState({ open: false, topic: "" });

  useEffect(() => {
    getCourses()
      .then((res) => {
        const courseList = res.data.courses || [];
        setCourses(courseList);
        if (!selectedCourseId && courseList.length > 0) {
          setSelectedCourseId(courseList[0].id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await getDashboard(STUDENT_ID);
      setData(res.data);
    } catch (err) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = (topic) => {
    setExplainModal({ open: true, topic });
  };

  return (
    <div className="relative min-h-screen">
      <div className="orb orb-3" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
          <p className="text-[var(--color-muted-foreground)]">
            Track your weak topics and improve with personalized explanations
          </p>
        </div>

        {loading ? (
          <div className="glass rounded-xl p-12 text-center">
            <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
            <p className="text-sm text-[var(--color-muted-foreground)]">Loading your performance data...</p>
          </div>
        ) : !data || data.totalQuestions === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <TrendingDown className="w-12 h-12 text-[var(--color-muted-foreground)] mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No quiz data yet</p>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Take a quiz first to see your weak topics here.{" "}
              <a href="/upload" className="text-[var(--color-primary)] hover:underline">
                Upload materials
              </a>
            </p>
          </div>
        ) : (
          <div className="space-y-6 animate-slide-up">
            {/* Overall stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-[var(--color-primary)]">{data.overallAccuracy}%</p>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-1">Overall Accuracy</p>
              </div>
              <div className="glass rounded-xl p-5 text-center">
                <p className="text-3xl font-bold">{data.totalQuestions}</p>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-1">Questions Answered</p>
              </div>
              <div className="glass rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-[oklch(0.7_0.2_150)]">{data.totalCorrect}</p>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-1">Correct Answers</p>
              </div>
            </div>

            {/* Topic breakdown */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-[oklch(0.7_0.18_25)]" />
                Topics (Weakest First)
              </h2>
              <div className="space-y-3">
                {data.weakTopics.map((topic) => (
                  <TopicBar
                    key={topic.topic}
                    topic={topic.topic}
                    accuracy={topic.accuracy}
                    total={topic.total}
                    correct={topic.correct}
                    wrong={topic.wrong}
                    onExplain={handleExplain}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Explain Modal */}
        <ExplainModal
          isOpen={explainModal.open}
          onClose={() => setExplainModal({ open: false, topic: "" })}
          topic={explainModal.topic}
          courseId={selectedCourseId}
        />
      </div>
    </div>
  );
}

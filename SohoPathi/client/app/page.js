import Link from "next/link";
import { ArrowRight, BookOpen, Brain, Target, MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
          <span className="text-blue-600">Sohopathi</span> <br/>
          Your AI Study Companion
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mb-10">
          Upload your course materials, and let AI turn them into a personal tutor that knows exactly what you're weak at.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/upload" 
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm"
          >
            View Dashboard
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">How it works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<BookOpen className="h-8 w-8 text-blue-500" />}
              title="1. Upload"
              description="Upload your PDFs, slide decks, or handwritten notes."
            />
            <FeatureCard 
              icon={<MessageSquare className="h-8 w-8 text-indigo-500" />}
              title="2. Chat"
              description="Ask questions and get answers grounded only in your materials."
            />
            <FeatureCard 
              icon={<Target className="h-8 w-8 text-rose-500" />}
              title="3. Practice"
              description="Take AI-generated quizzes to test your knowledge."
            />
            <FeatureCard 
              icon={<Brain className="h-8 w-8 text-emerald-500" />}
              title="4. Master"
              description="Identify your weak topics and get them explained simply."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
      <div className="p-4 bg-white rounded-full shadow-sm mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

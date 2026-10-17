
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  question: string;
  options: string[];
  answer: string;
  skill: string;
};

type ResumeResult = {
  skills?: string[];
  experienceLevel?: string;
  overallScore?: number;
};

function Navbar() {
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 flex flex-col justify-between gap-3 bg-[#A67B5B] px-4 py-3 shadow-md sm:px-6 lg:flex-row lg:items-center lg:px-8">
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-left"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 font-bold text-[#A67B5B]">
          AI
        </div>

        <div>
          <h1 className="text-lg font-bold text-amber-100">
            Career Compass
          </h1>
          <p className="text-xs text-gray-200">
            AI POWERED
          </p>
        </div>
      </button>

      <div className="flex flex-wrap items-center justify-center gap-4 font-medium sm:gap-7">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="text-gray-100 transition hover:text-white"
        >
          ⚡ Dashboard
        </button>

        <button
          type="button"
          onClick={() => router.push("/interview")}
          className="text-gray-100 transition hover:text-white"
        >
          🎯 Practice
        </button>

        <button
          type="button"
          onClick={() => router.push("/history")}
          className="text-gray-100 transition hover:text-white"
        >
          📊 My Sessions
        </button>
      </div>

      <div className="flex items-center justify-center gap-3">
       

        
      </div>
    </nav>
  );
}

export default function SkillsPage() {
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);

  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // GENERATE QUESTIONS
  useEffect(() => {
    generateQuestions();
  }, []);

  const generateQuestions = async () => {
    try {
      setLoading(true);
      setError("");
      setFinished(false);
      setCurrent(0);
      setScore(0);
      setQuestions([]);

      const resumeResponse = await fetch(
        "https://career-compass-backend-v8sv.onrender.com/api/resume-analysis/latest",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const resumeText = await resumeResponse.text();

      if (!resumeResponse.ok) {
        throw new Error(
          `Failed to load resume analysis. Server returned ${resumeResponse.status}.`
        );
      }

      let resumeData;

      try {
        resumeData = JSON.parse(resumeText);
      } catch {
        throw new Error(
          "Resume analysis API returned invalid JSON."
        );
      }

      if (
        !resumeData.success ||
        !resumeData.resumeAnalysis?.analysis
      ) {
        throw new Error(
          "No resume analysis found in MongoDB. Please analyze your resume first."
        );
      }

      const result: ResumeResult =
        resumeData.resumeAnalysis.analysis;

      const skills = result.skills || [];

      if (!Array.isArray(skills) || skills.length === 0) {
        throw new Error(
          "No skills were found in your resume. Please analyze your resume again."
        );
      }

      const response = await fetch("/api/interview/skill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills,
          experienceLevel: result.experienceLevel || "Fresher",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to generate skill assessment."
        );
      }

      if (
        !Array.isArray(data.questions) ||
        data.questions.length === 0
      ) {
        throw new Error("AI did not return any questions.");
      }

      setQuestions(data.questions);
    } catch (error) {
      console.error("SKILLS ASSESSMENT ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate AI assessment."
      );
    } finally {
      setLoading(false);
    }
  };

  // SAVE FINAL SCORE TO MONGODB
  const saveAssessment = async (finalScore: number) => {
    try {
      setSaving(true);
      setError("");

      const resumeResponse = await fetch(
        "https://career-compass-backend-v8sv.onrender.com/api/resume-analysis/latest",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const resumeText = await resumeResponse.text();

      if (!resumeResponse.ok) {
        throw new Error(
          `Failed to fetch resume analysis. Server returned ${resumeResponse.status}.`
        );
      }

      let resumeData;

      try {
        resumeData = JSON.parse(resumeText);
      } catch {
        throw new Error(
          "Resume analysis API returned invalid JSON."
        );
      }

      if (
        !resumeData.success ||
        !resumeData.resumeAnalysis?.analysis
      ) {
        throw new Error(
          "Resume analysis was not found in MongoDB."
        );
      }

      const resumeResult: ResumeResult =
        resumeData.resumeAnalysis.analysis;

      const percentage =
        questions.length > 0
          ? Math.round(
              (finalScore / questions.length) * 100
            )
          : 0;

      const assessmentData = {
        score: finalScore,
        percentage,
        totalQuestions: questions.length,
        skills: Array.isArray(resumeResult.skills)
          ? resumeResult.skills
          : [],
        experienceLevel:
          resumeResult.experienceLevel || "Fresher",
        date: new Date().toISOString(),
      };

      const response = await fetch(
        "https://career-compass-backend-v8sv.onrender.com/api/skill-assessment/save",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(assessmentData),
        }
      );

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "Skill assessment server returned invalid JSON."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Failed to save assessment score."
        );
      }

      return true;
    } catch (error) {
      console.error("SAVE SCORE ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to save assessment score."
      );

      return false;
    } finally {
      setSaving(false);
    }
  };

  // HANDLE ANSWER
  const handleAnswer = async (option: string) => {
    if (saving) return;

    const question = questions[current];

    if (!question) return;

    const isCorrect =
      option.trim().toLowerCase() ===
      question.answer.trim().toLowerCase();

    const newScore = isCorrect ? score + 1 : score;

    setScore(newScore);

    if (current === questions.length - 1) {
      const saved = await saveAssessment(newScore);

      if (saved) {
        setFinished(true);
      }

      return;
    }

    setCurrent((previous) => previous + 1);
  };

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="min-h-screen bg-amber-100">
        <Navbar />

        <main className="flex min-h-[80vh] items-center justify-center px-4">
          <div className="rounded-2xl bg-white p-10 text-center shadow-lg">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[#A67B5B] border-t-transparent" />

            <h2 className="text-2xl font-bold text-[#49382a]">
              Generating Your Assessment
            </h2>

            <p className="mt-2 text-gray-600">
              AI is creating questions based on your resume skills...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ERROR SCREEN
  if (error && !finished) {
    return (
      <div className="min-h-screen bg-amber-100">
        <Navbar />

        <main className="flex min-h-[80vh] items-center justify-center px-5 py-10">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg sm:p-10">
            <div className="mb-5 text-5xl text-[#A67B5B]">
              !
            </div>

            <h2 className="mb-3 text-2xl font-bold text-[#49382a]">
              Assessment Error
            </h2>

            <p className="mb-7 break-words text-gray-600">
              {error}
            </p>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={generateQuestions}
                className="rounded-lg bg-[#A67B5B] px-6 py-3 font-semibold text-white transition hover:bg-[#8B6247]"
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // RESULT SCREEN
  if (finished) {
    const percentage =
      questions.length > 0
        ? Math.round(
            (score / questions.length) * 100
          )
        : 0;

    return (
      <div className="min-h-screen bg-amber-100 text-[#49382a]">
        <Navbar />

        <main className="flex min-h-[80vh] items-center justify-center px-5 py-10">
          <div className="w-full max-w-xl rounded-3xl bg-white p-8 text-center shadow-xl sm:p-10">
            <div className="mb-5 text-6xl text-[#A67B5B]">
              ✓
            </div>

            <h2 className="text-3xl font-bold">
              Assessment Completed!
            </h2>

            <p className="mt-3 text-gray-600">
              Your AI-powered skill assessment has been completed.
            </p>

            <div className="mt-8 rounded-2xl bg-amber-100 p-8">
              <p className="text-sm text-gray-600">
                Your Skill Assessment Score
              </p>

              <p className="mt-2 text-6xl font-bold text-[#A67B5B]">
                {percentage}%
              </p>

              <p className="mt-3 text-gray-700">
                You scored{" "}
                <span className="font-bold">{score}</span> out of{" "}
                <span className="font-bold">
                  {questions.length}
                </span>
              </p>
            </div>

            <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Your assessment score has been saved successfully.
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/placement")}
                className="flex-1 rounded-lg bg-[#A67B5B] px-6 py-3 font-semibold text-white transition hover:bg-[#8B6247]"
              >
                Check Placement Score
              </button>

              <button
                type="button"
                onClick={generateQuestions}
                className="flex-1 rounded-lg border-2 border-[#A67B5B] px-6 py-3 font-semibold text-[#A67B5B] transition hover:bg-amber-50"
              >
                Retake Assessment
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // QUESTION SCREEN
  const question = questions[current];

  if (!question) {
    return (
      <div className="min-h-screen bg-amber-100">
        <Navbar />

        <div className="p-10 text-center text-[#49382a]">
          No question is available.
          <button
            type="button"
            onClick={generateQuestions}
            className="ml-3 font-semibold text-[#A67B5B] underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const progress =
    ((current + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-amber-100 text-[#49382a]">
      <Navbar />

      <main className="mx-auto max-w-4xl px-5 py-10">
        <div className="mb-8 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A67B5B]">
            Test Your Knowledge
          </p>

          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            AI Skill Assessment
          </h2>

          <p className="mt-2 text-gray-600">
            Questions are generated from the skills detected in your resume.
          </p>
        </div>

        {/* PROGRESS */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-md">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              Question {current + 1} of {questions.length}
            </span>

            <span className="text-sm font-semibold text-[#A67B5B]">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-[#A67B5B] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* QUESTION CARD */}
        <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-8 md:p-10">
          <div className="mb-6 inline-block rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-[#795638]">
            Skill: {question.skill}
          </div>

          <h3 className="mb-8 text-xl font-bold leading-relaxed text-[#49382a] md:text-2xl">
            {question.question}
          </h3>

          <div className="space-y-4">
            {question.options.map((option, index) => (
              <button
                key={`${current}-${index}`}
                type="button"
                onClick={() => handleAnswer(option)}
                disabled={saving}
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-5 py-4 text-left transition hover:border-[#A67B5B] hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-[#795638]">
                    {String.fromCharCode(65 + index)}
                  </span>

                  <span className="font-medium text-gray-800">
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {saving && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-3 rounded-lg bg-amber-50 px-5 py-3 font-semibold text-[#8B6247]">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#A67B5B] border-t-transparent" />
                Saving your assessment score...
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Current Score:{" "}
            <span className="font-bold text-[#49382a]">
              {score}
            </span>
          </p>
        </div>
      </main>

      <footer className="px-4 py-6 text-center text-sm text-[#806b58]">
        Career Compass — Build your skills and prepare for placements.
      </footer>
    </div>
  );
}


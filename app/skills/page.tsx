"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  question: string;
  options: string[];
  answer: string;
  skill: string;
};

export default function SkillsPage() {
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Generate questions when page opens
  useEffect(() => {
    generateQuestions();
  }, []);

  const generateQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const resumeData = localStorage.getItem("resumeAnalysis");

      console.log("RESUME DATA:", resumeData);

      if (!resumeData) {
        throw new Error("Please analyze your resume first.");
      }

      const parsed = JSON.parse(resumeData);

      const result =
        typeof parsed === "string"
          ? JSON.parse(parsed)
          : parsed;

      console.log("RESUME ANALYSIS:", result);

      const skills = result.skills || [];

      console.log("SKILLS:", skills);

      if (!Array.isArray(skills) || skills.length === 0) {
        throw new Error("No skills were found in your resume.");
      }

      const response = await fetch("/api/interview/skill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills,
          experienceLevel:
            result.experienceLevel || "Fresher",
        }),
      });

      const data = await response.json();

      console.log("SKILL API STATUS:", response.status);
      console.log("SKILL API RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to generate questions"
        );
      }

      if (
        !data.questions ||
        !Array.isArray(data.questions) ||
        data.questions.length === 0
      ) {
        throw new Error("AI did not return any questions.");
      }

      setQuestions(data.questions);
      setCurrent(0);
      setScore(0);
      setFinished(false);

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

  const handleAnswer = (option: string) => {
    const question = questions[current];

    const isCorrect =
      option.trim().toLowerCase() ===
      question.answer.trim().toLowerCase();

    const newScore = isCorrect
      ? score + 1
      : score;

    setScore(newScore);

    if (current === questions.length - 1) {
      const percentage = Math.round(
        (newScore / questions.length) * 100
      );

      // Current assessment result
      const assessmentResult = {
        score: newScore,
        percentage: percentage,
        totalQuestions: questions.length,
        date: new Date().toISOString(),
      };

      // Get previous assessments
      const existingAssessments = JSON.parse(
        localStorage.getItem("skillAssessments") || "[]"
      );

      // Add current assessment
      existingAssessments.push(assessmentResult);

      // Save all assessments
      localStorage.setItem(
        "skillAssessments",
        JSON.stringify(existingAssessments)
      );

      console.log(
        "ALL SKILL ASSESSMENTS:",
        existingAssessments
      );

      setFinished(true);

    } else {
      setCurrent(current + 1);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow rounded-2xl p-10 text-center">

          <div className="text-5xl mb-5">
            🤖
          </div>

          <h2 className="text-2xl font-bold text-gray-800">
            AI is preparing your assessment...
          </h2>

          <p className="text-gray-500 mt-3">
            Questions are being generated based on
            your resume skills.
          </p>

        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">

        <div className="bg-white shadow rounded-2xl p-10 text-center max-w-md">

          <div className="text-5xl mb-5">
            ⚠️
          </div>

          <h2 className="text-2xl font-bold text-gray-800">
            Assessment Error
          </h2>

          <p className="text-gray-500 mt-3">
            {error}
          </p>

          <button
            onClick={() => router.push("/resume")}
            className="mt-6 bg-blue-500 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold"
          >
            Analyze Resume
          </button>

        </div>
      </div>
    );
  }

  // Result screen
  if (finished) {
    const percentage = Math.round(
      (score / questions.length) * 100
    );

    return (
      <div className="min-h-screen bg-amber-100">

        {/* Navbar */}
        <nav className="bg-[#A67B5B] shadow-sm px-8 py-4 flex justify-between items-center">

          <div className="flex items-center gap-2">

            <div className="text-[#A67B5B] w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center font-bold">
              AI
            </div>

            <div>
              <h1 className="font-bold text-amber-100 text-lg">
                MockInterview
              </h1>

              <p className="text-xs text-white">
                AI POWERED
              </p>
            </div>

          </div>

          <div className="flex gap-8 font-medium">

            <button
              onClick={() => router.push("/dashboard")}
              className="text-gray-200 hover:text-white"
            >
              ⚡ Dashboard
            </button>

            <button
              onClick={() => router.push("/interview")}
              className="text-gray-200 hover:text-white"
            >
              🎯 Practice
            </button>

            <button
              onClick={() => router.push("/history")}
              className="text-gray-200 hover:text-white"
            >
              📊 My Sessions
            </button>

          </div>
        </nav>

        {/* Result */}
        <main className="max-w-3xl mx-auto px-6 py-12">

          <div className="bg-white rounded-2xl shadow p-10 text-center">

            <h2 className="text-3xl font-bold text-gray-800">
              AI Skill Assessment Completed
            </h2>

            <p className="text-gray-500 mt-3">
              Your AI-generated technical assessment result
            </p>

            <div className="text-6xl font-bold text-[#A67B5B] mt-8">
              {percentage}%
            </div>

            <p className="text-gray-600 mt-3">
              You scored {score} out of{" "}
              {questions.length}
            </p>

            <div className="flex gap-4 mt-8">

              <button
                onClick={() => router.push("/placement")}
                className="flex-1 bg-[#A67B5B] hover:bg-[#8B6247] text-white py-3 rounded-xl font-bold"
              >
                🎯 Placement Readiness
              </button>

              <button
                onClick={() => window.location.reload()}
                className="flex-1 border border-[#A67B5B] text-[#A67B5B] py-3 rounded-xl font-bold hover:bg-amber-50"
              >
                Try Again
              </button>

            </div>

          </div>
        </main>

      </div>
    );
  }

  // Safety check
  if (questions.length === 0) {
    return null;
  }

  const question = questions[current];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">

        <div className="flex items-center gap-2">

          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold">
            AI
          </div>

          <div>
            <h1 className="font-bold text-blue-700 text-lg">
              MockInterview
            </h1>

            <p className="text-xs text-gray-500">
              AI POWERED
            </p>
          </div>

        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="text-gray-600 hover:text-blue-500 font-medium"
        >
          ⚡ Dashboard
        </button>

      </nav>

      {/* Assessment */}
      <main className="max-w-3xl mx-auto px-6 py-12">

        <div className="bg-white rounded-2xl shadow p-8">

          <div className="flex justify-between mb-6">

            <h2 className="text-2xl font-bold text-gray-800">
              AI Skill Assessment
            </h2>

            <span className="text-blue-600 font-semibold">
              Question {current + 1} /{" "}
              {questions.length}
            </span>

          </div>

          {/* Progress */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-8">

            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{
                width: `${
                  ((current + 1) / questions.length) * 100
                }%`,
              }}
            />

          </div>

          {/* Skill */}
          <p className="text-sm text-blue-600 font-semibold mb-3">
            Skill: {question.skill}
          </p>

          {/* Question */}
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            {question.question}
          </h3>

          {/* Options */}
          <div className="space-y-4">

            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="w-full text-left border border-gray-300 rounded-xl p-4 text-gray-700 hover:border-blue-500 hover:bg-blue-50 transition"
              >
                {option}
              </button>
            ))}

          </div>

        </div>
      </main>

    </div>
  );
}
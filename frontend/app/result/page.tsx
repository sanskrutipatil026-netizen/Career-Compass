"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type HistoryItem = {
  question: string;
  answer: string;
  topic: string;
  difficulty: string;
  score: number;
  feedback: string;
  status: "Answered" | "Skipped";
};

type InterviewData = {
  _id?: string;
  resumeScore?: number;
  questions?: HistoryItem[];
  totalScore?: number;
  totalQuestions?: number;
  answered?: number;
  skipped?: number;
  difficulty?: string;
  time?: string;
  createdAt?: string;
  date?: string;
};

type ResultType = {
  score: number;
  answered: number;
  skipped: number;
  difficulty: string;
  time: string;
  history: HistoryItem[];
};

export default function ResultPage() {
  const router = useRouter();

  const [result, setResult] = useState<ResultType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      // Read the result saved by the interview page.
      const savedResult = localStorage.getItem("interviewResult");

      if (!savedResult) {
        setError(
          "No interview result was found. Please complete an interview first."
        );
        return;
      }

      const interview: InterviewData = JSON.parse(savedResult);

      const savedInterview = interview as InterviewData & {
  history?: HistoryItem[];
};

const questions = Array.isArray(savedInterview.history)
  ? savedInterview.history
  : Array.isArray(savedInterview.questions)
    ? savedInterview.questions
    : [];

      // Normalize each question without losing its original score or feedback.
      const normalizedHistory: HistoryItem[] = questions.map((item) => {
        const answer = String(item.answer ?? "").trim();

        const isSkipped =
          item.status === "Skipped" ||
          answer.toLowerCase() === "skipped" ||
          answer.length === 0;

        return {
          question: item.question || "",
          answer,
          topic: item.topic || "Resume-based",
          difficulty: item.difficulty || interview.difficulty || "Medium",
          score: isSkipped ? 0 : Math.max(0, Number(item.score) || 0),
          feedback: item.feedback || "",
          status: isSkipped ? "Skipped" : "Answered",
        };
      });

      // Calculate totals from the individual question records.
      const answeredCount = normalizedHistory.filter(
        (item) => item.status === "Answered"
      ).length;

      const skippedCount = normalizedHistory.filter(
        (item) => item.status === "Skipped"
      ).length;

      const calculatedScore = normalizedHistory.reduce(
        (total, item) => total + item.score,
        0
      );

      const finalResult: ResultType = {
        score: calculatedScore,
        answered: answeredCount,
        skipped: skippedCount,
        difficulty: interview.difficulty || "Medium",
        time: interview.time || "00:00",
        history: normalizedHistory,
      };

      setResult(finalResult);

      // Keep the normalized version available to the history page.
      localStorage.setItem(
        "interviewResult",
        JSON.stringify({
          ...finalResult,
          date: interview.date || new Date().toLocaleString(),
          history: normalizedHistory,
        })
      );

      localStorage.setItem(
        "interviewHistory",
        JSON.stringify(normalizedHistory)
      );
    } catch (err) {
      console.error("Failed to load interview result:", err);
      setError("Unable to read your interview result. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-100 text-[#A67B5B] text-xl font-bold">
        Loading interview result...
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-amber-100 px-4">
        <h1 className="text-3xl font-bold text-[#A67B5B]">
          Interview Result
        </h1>

        <p className="text-center text-gray-700">
          {error || "No interview result is available."}
        </p>

        <button
          onClick={() => router.push("/interview")}
          className="bg-[#A67B5B] text-white px-8 py-3 rounded-lg hover:bg-[#8f674a]"
        >
          Start Interview
        </button>

        <button
          onClick={() => router.push("/history")}
          className="bg-white text-[#A67B5B] px-8 py-3 rounded-lg shadow"
        >
          View History
        </button>
      </div>
    );
  }

  const interviewPercentage = Math.round(
    (result.score / 50) * 100
  );

  let verdict = "";
  let color = "";

  if (result.score >= 40) {
    verdict = "Excellent";
    color = "text-green-600";
  } else if (result.score >= 30) {
    verdict = "Good";
    color = "text-blue-600";
  } else if (result.score >= 20) {
    verdict = "Average";
    color = "text-yellow-600";
  } else {
    verdict = "Needs Improvement";
    color = "text-red-600";
  }

  return (
    <div className="min-h-screen bg-amber-100">
      <nav className="bg-[#A67B5B] shadow px-8 py-4 grid grid-cols-3 items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#A67B5B] flex items-center justify-center font-bold">
            AI
          </div>

          <div>
            <h1 className="font-bold text-amber-100 text-lg">
              Career Compass
            </h1>

            <p className="text-xs text-amber-100">
              AI POWERED
            </p>
          </div>
        </div>
        
       <div className="flex flex-wrap items-center justify-center gap-4 font-medium sm:gap-8">
          <button
            type="button"
            className="text-gray-200 transition-colors hover:text-white"
            onClick={() => router.push("/dashboard")}
          >
            ⚡ Dashboard
          </button>

          <button
            type="button"
            className="text-gray-200 transition-colors hover:text-white"
            onClick={() => router.push("/interview")}
          >
            🎯 Practice
          </button>

          <button
            type="button"
            className="text-gray-200 transition-colors hover:text-white"
            onClick={() => router.push("/history")}
          >
            📊 My Sessions
          </button>
        </div>


      </nav>

      <main className="p-6 md:p-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-[#A67B5B]">
          Interview Result
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
          <div className="bg-white rounded-xl shadow p-5 text-center">
            <p className="text-black">Score</p>
            <h2 className="text-3xl font-bold text-gray-700">
              {result.score}/50
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5 text-center">
            <p className="text-black">Answered</p>
            <h2 className="text-3xl font-bold text-green-600">
              {result.answered}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5 text-center">
            <p className="text-black">Skipped</p>
            <h2 className="text-3xl font-bold text-gray-700">
              {result.skipped}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5 text-center">
            <p className="text-black">Difficulty</p>
            <h2 className="text-2xl font-bold text-gray-700">
              {result.difficulty}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5 text-center">
            <p className="text-black">Time</p>
            <h2 className="text-3xl font-bold text-gray-700">
              {result.time}
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-5 text-gray-700">
            Candidate Progress
          </h2>

          {result.history.length === 0 ? (
            <p className="text-gray-500">
              No question details were saved for this interview.
            </p>
          ) : (
            result.history.map((item, index) => (
              <div
                key={index}
                className="border rounded-xl p-5 mb-5 text-gray-600"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-bold text-lg text-gray-700">
                    Question {index + 1}
                  </h3>

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      item.status === "Answered"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <p className="mt-3">
                  <b>Question:</b> {item.question || "Question unavailable."}
                </p>

                <p className="mt-2">
                  <b>Your Answer:</b>{" "}
                  {item.status === "Skipped"
                    ? "Question skipped."
                    : item.answer}
                </p>

                <p className="mt-2">
                  <b>Difficulty:</b> {item.difficulty}
                </p>

                <p className="mt-2">
                  <b>Score:</b> {item.score}/10
                </p>

                <p className="text-blue-600 mt-2">
                  <b>AI Feedback:</b>{" "}
                  {item.feedback || "No feedback available."}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">
            Interview Verdict
          </h2>

          <p className={`text-3xl font-bold ${color}`}>
            {verdict}
          </p>

          <div className="mt-5">
            <div className="flex justify-between text-gray-600 mb-2">
              <span>Interview Performance</span>
              <span>{interviewPercentage}%</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-[#A67B5B] h-3 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, interviewPercentage)
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-5 flex-wrap">
          <button
            onClick={() => router.push("/interview")}
            className="bg-[#A67B5B] text-white px-8 py-3 rounded-lg hover:bg-[#8f674a]"
          >
            Practice Again
          </button>

          <button
            onClick={() => router.push("/history")}
            className="bg-[#A67B5B] text-white px-8 py-3 rounded-lg hover:bg-[#8f674a]"
          >
            History
          </button>
        </div>
      </main>
    </div>
  );
}


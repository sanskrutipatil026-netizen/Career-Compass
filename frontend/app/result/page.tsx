"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const BACKEND_URL =
process.env.NEXT_PUBLIC_BACKEND_URL ||
"https://career-compass-backend-v8sv.onrender.com";

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
_id: string;
resumeScore: number;
questions: HistoryItem[];
totalScore: number;
totalQuestions: number;
answered: number;
skipped: number;
difficulty: string;
time: string;
createdAt: string;
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
async function fetchLatestInterview() {
try {
const response = await fetch(
`${BACKEND_URL}/api/interview/latest`,
{
method: "GET",
cache: "no-store",
}
);


    const data = await response.json();

    if (!response.ok || !data.success || !data.interview) {
      throw new Error(
        data.message || "No saved interview result was found."
      );
    }

    const interview: InterviewData = data.interview;

    setResult({
      score: Number(interview.totalScore) || 0,
      answered: Number(interview.answered) || 0,
      skipped: Number(interview.skipped) || 0,
      difficulty: interview.difficulty || "Medium",
      time: interview.time || "00:00",
      history: Array.isArray(interview.questions)
        ? interview.questions
        : [],
    });
  } catch (err) {
    console.error("Failed to fetch interview result:", err);

    setError(
      err instanceof Error
        ? err.message
        : "Unable to load your interview result."
    );
  } finally {
    setLoading(false);
  }
}

fetchLatestInterview();


}, []);

if (loading) {
return ( <div className="min-h-screen flex items-center justify-center bg-amber-100 text-[#A67B5B] text-xl font-bold">
Loading interview result... </div>
);
}

if (error || !result) {
return ( <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-amber-100 px-4"> <h1 className="text-3xl font-bold text-[#A67B5B]">
Interview Result </h1>


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

const interviewPercentage =
result.history.length > 0
? Math.round((result.score / (result.history.length * 10)) * 100)
: 0;

let verdict = "";
let color = "";

if (result.score >= 40) {
verdict = "🏆 Excellent";
color = "text-green-600";
} else if (result.score >= 30) {
verdict = "✔ Good";
color = "text-blue-600";
} else if (result.score >= 20) {
verdict = "Average";
color = "text-yellow-600";
} else {
verdict = "Needs Improvement";
color = "text-red-600";
}

return ( <div className="min-h-screen bg-amber-100"> <nav className="bg-[#A67B5B] shadow px-8 py-4 flex justify-between items-center"> <div className="flex items-center gap-2"> <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#A67B5B] flex items-center justify-center font-bold">
AI </div>


      <div>
        <h1 className="font-bold text-amber-100 text-lg">
          Career Compass
        </h1>

        <p className="text-xs text-amber-100">
          AI POWERED
        </p>
      </div>
    </div>

    <div className="flex gap-8 font-md justify-center">
      <button
        className="text-gray-200 hover:text-blue-500"
        onClick={() => router.push("/dashboard")}
      >
        ⚡Dashboard
      </button>

      <button
        onClick={() => router.push("/interview")}
        className="text-gray-200 hover:text-blue-500"
      >
        🎯Practice
      </button>

      <button
        onClick={() => router.push("/history")}
        className="text-gray-200 hover:text-blue-500"
      >
        📊My Sessions
      </button>
    </div>

    <div className="flex items-center justify-center gap-4"></div>
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
        <h2 className="text-3xl font-bold text-gray-700">
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
        <h2 className="text-3xl font-bold text-gray-700">
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
            className="border rounded-xl p-5 mb-5 text-gray-500"
          >
            <h3 className="font-bold text-lg text-gray-700">
              Question {index + 1}
            </h3>

            <p className="mt-2">
              <b>Question:</b> {item.question}
            </p>

            <p className="mt-2">
              <b>Your Answer:</b>{" "}
              {item.answer || "No answer provided."}
            </p>

            <p className="mt-2">
              <b>Status:</b> {item.status}
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
              width: `${Math.min(100, Math.max(0, interviewPercentage))}%`,
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

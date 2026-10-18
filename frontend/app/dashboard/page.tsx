"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Interview = {
  _id: string;
  totalScore?: number;
  score?: number;
  totalQuestions?: number;
  answered?: number;
  skipped?: number;
  difficulty?: string;
  time?: string;
  createdAt?: string;
};

export default function Dashboard() {
  const router = useRouter();

  const [totalSessions, setTotalSessions] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [totalPracticeTime, setTotalPracticeTime] = useState("00:00");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // LOAD INTERVIEW HISTORY FROM MONGODB

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("FETCHING INTERVIEW HISTORY FROM MONGODB...");

       const response = await fetch("/api/interview/history", {
method: "GET",
cache: "no-store",
});


        const responseText = await response.text();

        console.log("INTERVIEW HISTORY STATUS:", response.status);
        console.log("INTERVIEW HISTORY RESPONSE:", responseText);

        let data;

        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            "Interview history API returned invalid JSON."
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Failed to load interview history. Server returned ${response.status}.`
          );
        }

        const interviews: Interview[] = Array.isArray(data?.interviews)
          ? data.interviews
          : [];

        console.log("MONGODB INTERVIEWS:", interviews);

        // TOTAL SESSIONS

        setTotalSessions(interviews.length);

        // SCORE CALCULATIONS

        if (interviews.length > 0) {
          const scores = interviews.map((item) => {
            const totalScore = Number(
              item.totalScore ?? item.score ?? 0
            );

            const totalQuestions = Number(item.totalQuestions) || 5;
            const maximumScore = totalQuestions * 10;

            if (maximumScore <= 0) {
              return 0;
            }

            return Math.round(
              (totalScore / maximumScore) * 100
            );
          });

          // AVERAGE SCORE

          const totalPercentage = scores.reduce(
            (sum, score) => sum + score,
            0
          );

          setAverageScore(
            Math.round(totalPercentage / scores.length)
          );

          // BEST SCORE

          setBestScore(Math.max(...scores));

          // TOTAL PRACTICE TIME

          let totalSeconds = 0;

          interviews.forEach((item) => {
            if (!item.time) {
              return;
            }

            const parts = item.time.split(":").map(Number);

            if (
              parts.length === 2 &&
              !Number.isNaN(parts[0]) &&
              !Number.isNaN(parts[1])
            ) {
              const minutes = parts[0];
              const seconds = parts[1];

              totalSeconds += minutes * 60 + seconds;
            }
          });

          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;

          setTotalPracticeTime(
            `${String(minutes).padStart(2, "0")}:${String(
              seconds
            ).padStart(2, "0")}`
          );
        } else {
          setAverageScore(0);
          setBestScore(0);
          setTotalPracticeTime("00:00");
        }
      } catch (error) {
        console.error("DASHBOARD DATA ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data."
        );

        setTotalSessions(0);
        setAverageScore(0);
        setBestScore(0);
        setTotalPracticeTime("00:00");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-amber-100">
      {/* NAVBAR */}

      <nav className="bg-[#A67B5B] shadow-sm px-8 py-4 flex justify-between items-center">
        <div className="flex justify-center gap-2">
          <h1 className="text-[#A67B5B] w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center font-bold">
            AI
          </h1>

          <div>
            <h1 className="font-bold text-amber-100 text-lg">
              Career Compass
            </h1>

            <p className="text-xs text-white">
              AI POWERED
            </p>
          </div>
        </div>

        <div className="flex gap-8 font-medium">
          <button
            className="text-gray-200 hover:text-blue-500"
            onClick={() =>
              router.push("/dashboard")
            }
          >
            ⚡Dashboard
          </button>

          <button
            onClick={() =>
              router.push("/interview")
            }
            className="text-gray-200 hover:text-blue-500"
          >
            🎯Practice
          </button>

          <button
            onClick={() =>
              router.push("/history")
            }
            className="text-gray-200 hover:text-blue-500"
          >
            📊My Sessions
          </button>
        </div>

        <div className="flex items-center gap-4"></div>
      </nav>

      {/* MAIN CONTENT */}

      <div className="max-w-7xl mx-auto p-8">
        {/* HEADER */}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
          <div className="text-black">
            <p className="text-gray-500">
              Welcome Back 👋
            </p>

            <h2 className="text-4xl font-bold mt-2">
              Your Dashboard
            </h2>
          </div>

          <button
            onClick={() => router.push("/platforms")}
            className="bg-[#A67B5B] hover:bg-[#896345] text-white px-6 py-3 rounded-2xl transition-colors"
          >
            Explore Platforms
          </button>
        </div>

        {/* ERROR MESSAGE */}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
            {error}
          </div>
        )}

        {/* STAT CARDS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {/* TOTAL SESSIONS */}

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500">
              Total Sessions 📋
            </h3>

            <p className="text-4xl font-bold mt-3 text-black">
              {loading ? "..." : totalSessions}
            </p>

            <p className="text-gray-500 mt-2">
              {loading ? "Loading sessions..." : `${totalSessions} sessions`}
            </p>
          </div>

          {/* AVERAGE SCORE */}

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500">
              Average Score 📈
            </h3>

            <p className="text-4xl font-bold mt-3 text-black">
              {loading ? "..." : `${averageScore}%`}
            </p>

            <p className="text-gray-500 mt-2">
              Average Performance
            </p>
          </div>

          {/* BEST SCORE */}

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500">
              Best Score 🏆
            </h3>

            <p className="text-4xl font-bold mt-3 text-black">
              {loading ? "..." : `${bestScore}%`}
            </p>

            <p className="text-gray-500 mt-2">
              Highest Score
            </p>
          </div>

          {/* PRACTICE TIME */}

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500">
              Practice Time 🕛
            </h3>

            <p className="text-3xl font-bold mt-2 text-black">
              {loading ? "..." : totalPracticeTime}
            </p>

            <p className="text-gray-500 mt-2">
              Total Practice Time
            </p>
          </div>
        </div>

        {/* THREE DASHBOARD CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {/* INTERVIEW HISTORY */}

          <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-3xl">
              📊
            </div>

            <h2 className="text-2xl font-bold text-[#49382a] mt-5">
              Interview History
            </h2>

            <p className="text-gray-500 mt-4 min-h-[72px]">
              View your previous interview sessions and track your practice performance.
            </p>

            <div className="mt-4 text-[#A67B5B] font-semibold">
              {loading
                ? "Loading sessions..."
                : `${totalSessions} Interview Sessions`}
            </div>

            <button
              onClick={() => router.push("/history")}
              className="mt-6 w-full bg-[#A67B5B] hover:bg-[#896345] text-white px-5 py-3 rounded-xl transition-colors"
            >
              View Interview History
            </button>
          </div>

          {/* RESUME ANALYSIS */}

          <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-3xl">
              📄
            </div>

            <h2 className="text-2xl font-bold text-[#49382a] mt-5">
              Resume Analysis
            </h2>

            <p className="text-gray-500 mt-4 min-h-[72px]">
              Upload your resume to get an AI-powered score, feedback, and improvement roadmap.
            </p>

            <div className="mt-4 text-[#A67B5B] font-semibold">
              Improve Your Resume
            </div>

            <button
              onClick={() => router.push("/resume")}
              className="mt-6 w-full bg-[#A67B5B] hover:bg-[#896345] text-white px-5 py-3 rounded-xl transition-colors"
            >
              Analyze Resume
            </button>
          </div>

          {/* RESUME MAKER */}

          <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-3xl">
              📝
            </div>

            <h2 className="text-2xl font-bold text-[#49382a] mt-5">
              Resume Maker
            </h2>

            <p className="text-gray-500 mt-4 min-h-[72px]">
              Create a professional resume showcasing your skills, education, projects, and experience.
            </p>

            <div className="mt-4 text-[#A67B5B] font-semibold">
              Build Your Resume
            </div>

            <button
              onClick={() => router.push("/resume-maker")}
              className="mt-6 w-full bg-[#A67B5B] hover:bg-[#896345] text-white px-5 py-3 rounded-xl transition-colors"
            >
              Create Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
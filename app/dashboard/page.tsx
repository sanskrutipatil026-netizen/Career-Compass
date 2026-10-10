"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("history");
  const [totalSessions, setTotalSessions] = useState(0);
const [averageScore, setAverageScore] = useState(0);
const [bestScore, setBestScore] = useState(0);
const [totalPracticeTime, setTotalPracticeTime] = useState("00:00");
useEffect(() => {
  const interviews = JSON.parse(
    localStorage.getItem("allInterviews") || "[]"
  );

  setTotalSessions(interviews.length);

  if (interviews.length > 0) {
    const totalScore = interviews.reduce(
      (sum: number, item: any) => sum + item.score,
      0
    );

    setAverageScore(Math.round(totalScore / interviews.length));

    const highest = Math.max(
      ...interviews.map((item: any) => item.score)
    );

    setBestScore(highest);

    let totalSeconds = 0;

    interviews.forEach((item: any) => {
      const [m, s] = item.time.split(":").map(Number);
      totalSeconds += m * 60 + s;
    });

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    setTotalPracticeTime(
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    );
  }
}, []);

  return (
    <div className="min-h-screen bg-amber-100">
      
      <nav className="bg-[#A67B5B] shadow-sm px-8 py-4 flex justify-between items-center">
        <div className="flex justify-center gap-2">
        <h1 className="text-brown-500 font-bold text-[#A67B5B] w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center font-bold ">
          AI 
        </h1>
        <div>
            <h1 className="font-bold text-amber-100 text-lg ">
              Career Compass
            </h1>

            <p className="text-xs text-white-500">
              AI POWERED
            </p>
          </div>
        </div> 
<div className="flex gap-8 font -md">
  <button className="text-gray-200 hover:text-blue-500">⚡Dashboard</button>
  <button onClick={() => router.push("/interview")} className="text-gray-200 hover:text-blue-500">🎯Practice</button>
  <button onClick={() => router.push("/history")} className="text-gray-200 hover:text-blue-500">📊My Sessions</button>

</div>
    
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
       <div className="w-8 h-8 rounded-full bg-[#A67B5B] text-white flex items-center justify-center font-bold">S</div>
      <span className="font-md text-black">Hi,</span>
      <span className="font-bold text-black">User</span>
      </div>
        <button className="bg-gray-100 text-black px-5 py-2 rounded-full">
          Logout
        </button>
        </div>
      </nav>

      
      <div className="max-w-7xl mx-auto p-8">

        <div className="flex justify-between items-center">
          <div className="text-black">
            <p className="text-gray-500">Welcome Back👋</p>
            <h2 className="text-4xl font-bold mt-2 ">
              Your Dashboard
            </h2>
          </div>

          <button
            onClick={() => router.push("/interview")}
            className="bg-[#A67B5B] text-white px-6 py-3 rounded-2xl"
          >
            ⚡New Interview
          </button>
        </div>

       
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500">Total Sessions 📋</h3>
            <p className="text-4xl font-bold mt-3 text-black">
  {totalSessions}
</p>
<p>{totalSessions} sessions</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500">Average Score 📈</h3>
            <p className="text-4xl font-bold mt-3 text-black">
  {averageScore}%
</p>
<p>Average Performance</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500">Best Score 🏆</h3>
            <p className="text-4xl font-bold mt-3 text-black">
  {bestScore}%
</p>
<p>Highest Score</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 ">
            <h3 className="text-gray-500">Practice Time 🕛</h3>
            <p className="text-3xl font-bold mt-2 text-black">
  {totalPracticeTime}
</p>
<p>Total Practice Time</p>

          </div>

        </div>

       

        <div className="bg-white rounded-xl shadow mt-10">

          <div className="flex border-b">

            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-4 ${
                activeTab === "history"
                  ? "border-b-4 border-[#A67B5B] text-[#A67B5B] font-semibold"
                  : ""
              }`}
            >
              Interview History
            </button>

            <button
              onClick={() => setActiveTab("resume")}
              className={`flex-1 py-4 ${
                activeTab === "resume"
                  ? "border-b-4 border-[#A67B5B] text-[#A67B5B] font-semibold"
                  : ""
              }`}
            >
              Resume Analysis
            </button>

          </div>

          <div className="p-12 text-center">

            {activeTab === "history" ? (
              <>
                <h2 className="text-2xl font-bold text-black">
                  No sessions yet
                </h2>

                <p className="text-gray-500 mt-3">
                  Start a practice interview or upload your resume for personalised domain suggestions .
                </p>

                <button
                  onClick={() => router.push("/interview")}
                  className="mt-8 bg-[#A67B5B] text-white px-6 py-3 rounded-lg"
                >
                  ⚡Start Interview
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-black">
                  Analyse Resume
                </h2>

                <p className="text-gray-500 mt-3">
                  Upload your resume and get AI-powered feedback.
                </p>

                <button
                  onClick={() => router.push("/resume")}
                  className="mt-8 bg-[#A67B5B] text-white px-6 py-3 rounded-lg"
                >
                  📄Analyze Resume
                </button>
              </>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
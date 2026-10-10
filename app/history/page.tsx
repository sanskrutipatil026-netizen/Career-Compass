"use client";

import { useEffect, useState } from "react";
import{ useRouter } from "next/navigation";

type Interview = {
  score: number;
  answered: number;
  skipped: number;
  difficulty: string;
  time: string;
  date:string;
  history:any[];
};

export default function HistoryPage() {
  
    const router=useRouter();
  const [history, setHistory] = useState<Interview[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("allInterviews");

    if (data) {
      setHistory(JSON.parse(data));
    }
  }, []);
  const deleteInterview = (index: number) => {
  const updatedHistory = history.filter((_, i) => i !== index);

  setHistory(updatedHistory);

  localStorage.setItem(
    "allInterviews",
    JSON.stringify(updatedHistory)
  );
};


  return (
    <div className="min-h-screen bg-amber-100">
    <nav className="bg-[#A67B5B] shadow px-8 py-4 flex justify-between items-center">

        
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#A67B5B] flex items-center justify-center font-bold">
            AI
          </div>

          <div>
            <h1 className="font-bold text-amber-100 text-lg">
              MockInterview
            </h1>

            <p className="text-xs text-amber-100">
              AI POWERED
            </p>
          </div>
        </div>
        
        <div className="flex gap-8 font-md justify-center">
  <button className="text-gray-200 hover:text-blue-500" onClick={()=> router.push("/dashboard")}>⚡Dashboard</button>
  <button onClick={() => router.push("/interview")} className="text-gray-200 hover:text-blue-500">🎯Practice</button>
  <button onClick={() => router.push("/history")} className="text-gray-200 hover:text-blue-500">📊My Sessions</button>

</div>
        


        
        <div className="flex items-center justify-center gap-4 ">
          <div className="flex justify-center gap-2 bg-gray-100 rounded-full px-3 py-2">
       <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">S</div>
      <span className="font-md text-black">Hi,</span>
      <span className="font-bold text-black">User</span>
      </div>
        <button className="bg-gray-100 text-black px-5 py-2 rounded-full">
          Logout
        </button>
      </div>
      
        
</nav>
    <div className="min-h-screen bg-gray-100 p-8">

      {/* Progress Overview */}
{history.length > 0 && (
  <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

    <h2 className="text-2xl font-bold text-gray-800 mb-5">
      📈 Progress Overview
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

      {/* Best Score */}
      <div className="bg-blue-50 rounded-xl p-5">
        <p className="text-gray-500">
          Best Interview Score
        </p>

        <p className="text-3xl font-bold text-blue-600 mt-2">
          {Math.max(...history.map(item => item.score))}%
        </p>
      </div>

      {/* Latest Score */}
      <div className="bg-green-50 rounded-xl p-5">
        <p className="text-gray-500">
          Latest Interview Score
        </p>

        <p className="text-3xl font-bold text-green-600 mt-2">
          {history[history.length - 1].score}%
        </p>
      </div>

      {/* Improvement */}
      <div className="bg-purple-50 rounded-xl p-5">
        <p className="text-gray-500">
          Improvement
        </p>

        <p className="text-3xl font-bold text-purple-600 mt-2">
          {history.length > 1
            ? `${history[history.length - 1].score - history[0].score >= 0 ? "+" : ""}${
                history[history.length - 1].score - history[0].score
              }%`
            : "0%"}
        </p>
      </div>

    </div>

  </div>
)}
      {history.length === 0 ? (
        <p className="text-gray-500">
          No interview history found.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {history.map((item, index) => (

   <div key={index}
    className="bg-white rounded-xl shadow-lg p-6 h-fit self-start"
  >
    <h2 className="text-xl font-bold text-[#A67B5B]">
      Interview #{index + 1}
    </h2>

    <p className="text-black">🗓 Interview Date: {item.date}</p>
    <p className="text-black">⭐ Score: {item.score}/50</p>
    <p className="text-black">✅ Answered: {item.answered}</p>
    <p className="text-black">⏩ Skipped: {item.skipped}</p>
    <p className="text-black">🎯 Difficulty: {item.difficulty}</p>
    <p className="text-black">🕛 Time: {item.time}</p>

    <p className="text-black font-semibold">
      🏆 Final Verdict:
      {item.score >= 40
        ? " Excellent"
        : item.score >= 30
        ? " Good"
        : item.score >= 20
        ? " Average"
        : " Needs Improvement"}
    </p>

    <div className="mt-4">
      <div className="flex justify-between text-sm mb-2">
        <span>Score Progress</span>
        <span>{item.score}%</span>
      </div>

      <div className="w-full bg-gray-300 rounded-full h-3">
        <div
          className={`${
            item.score >= 80
              ? "bg-green-500"
              : item.score >= 60
              ? "bg-blue-500"
              : item.score >= 40
              ? "bg-yellow-500"
              : "bg-red-500"
          } h-3 rounded-full`}
          style={{ width: `${item.score}%` }}
        ></div>
      </div>
    </div>

    <div className="flex gap-3 mt-5">
      <button
        onClick={() =>
          setOpenIndex(openIndex === index ? null : index)
        }
        className="bg-[#A67B5B] text-white px-4 py-2 rounded-lg"
      >
        📄 View Details
      </button>

      <button
        onClick={() => deleteInterview(index)}
        className="bg-red-500 text-white px-4 py-2 rounded-lg"
      >
        🗑 Delete
      </button>
    </div>

    {openIndex === index ? (
      <div className="mt-5 border-t pt-4">
        <h3 className="font-bold mb-3 text-green-500">
          Questions & Answers
        </h3>

        {item.history.map((q: any, i: number) => (
          <div
            key={i}
            className="bg-gray-700 rounded-lg p-3 mb-3"
          >
            <p>
              <b>Question:</b> {q.question}
            </p>

            <p>
              <b>Answer:</b> {q.answer}
            </p>

            <p>
              <b>Feedback:</b> {q.feedback}
            </p>

            <p>
              <b>Score:</b> {q.score}/10
            </p>

            <p>
              <b>Status:</b> {q.status}
            </p>
          </div>
          
        ))}
      </div>
    
    ):null}
    </div>
          ))}
          </div>
      )}
      {/* Progress Graph */}
{history.length > 0 && (
  <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

    <h2 className="text-2xl font-bold text-gray-800 mb-5">
      📈 Interview Progress
    </h2>

    <div className="flex items-end gap-4 h-64 border-b border-l border-gray-300 px-4">

      {history.map((item, index) => {
        const percentage = (item.score / 50) * 100;

        return (
          <div
            key={index}
            className="flex-1 flex flex-col items-center justify-end h-full"
          >

            {/* Score */}
            <span className="text-sm font-bold text-blue-600 mb-2">
              {Math.round(percentage)}%
            </span>

            {/* Bar */}
            <div
              className="w-full max-w-16 bg-[#A67B5B] rounded-t-lg"
              style={{
                height: `${Math.max(percentage, 5)}%`,
              }}
            />

            {/* Attempt */}
            <span className="text-xs text-gray-500 mt-2">
              #{index + 1}
            </span>

          </div>
        );
      })}

    </div>

    <p className="text-center text-gray-500 mt-4">
      Interview attempts
    </p>

  </div>
)}
{/* Potential Status */}
{history.length >= 2 && (
  <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

    <h2 className="text-2xl font-bold text-gray-800 mb-4">
      ⭐ Candidate Potential
    </h2>

    {(() => {
      const firstScore = (history[0].score / 50) * 100;
      const latestScore =
        (history[history.length - 1].score / 50) * 100;

      const improvement = latestScore - firstScore;

      if (improvement >= 15) {
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="text-xl font-bold text-blue-700">
              ⭐ High Potential Candidate
            </h3>

            <p className="text-gray-600 mt-2">
              Your performance has improved by{" "}
              <b>{Math.round(improvement)}%</b> since your first
              interview.
            </p>
          </div>
        );
      }

      return (
        <div className="bg-gray-50 border rounded-xl p-5">
          <h3 className="text-xl font-bold text-gray-700">
            📚 Keep Improving
          </h3>

          <p className="text-gray-600 mt-2">
            Continue practicing interviews to improve your
            placement readiness.
          </p>
        </div>
      );
    })()}

  </div>
)}
{/* Evolving Recommendations */}
{history.length > 0 && (
  <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

    <h2 className="text-2xl font-bold text-gray-800 mb-4">
      🤖 Personalized Recommendations
    </h2>

    {history.length === 1 ? (
      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-gray-700">
          Complete more interviews to receive personalized
          recommendations based on your progress.
        </p>
      </div>
    ) : (
      <div className="space-y-3">

        {history[history.length - 1].score <
        history[0].score && (
          <div className="border rounded-lg p-3 text-gray-700">
            ⚠️ Your interview score has decreased. Focus on
            practicing technical interview questions.
          </div>
        )}

        {history[history.length - 1].score >=
        history[0].score && (
          <div className="border rounded-lg p-3 text-gray-700">
            ✅ Your interview performance is improving. Continue
            practicing consistently.
          </div>
        )}

        {history[history.length - 1].score < 30 && (
          <div className="border rounded-lg p-3 text-gray-700">
            📚 Focus on fundamental technical concepts and
            problem-solving questions.
          </div>
        )}

        {history[history.length - 1].score >= 40 && (
          <div className="border rounded-lg p-3 text-gray-700">
            🚀 Your technical performance is strong. Start
            practicing advanced interview questions and real-world
            problems.
          </div>
        )}

      </div>
    )}

  </div>
)}
      </div>
    </div>
 );
}

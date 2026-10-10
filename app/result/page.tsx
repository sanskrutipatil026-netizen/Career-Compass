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
  const[interviewScore,setInterviewScore]=useState(0);

  useEffect(() => {
    const data = localStorage.getItem("interviewResult");

    if (data) {
      setResult(JSON.parse(data));
    }
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
  const interviewPercentage=Math.round(result.score/50)*100

  let verdict = "";
  let color = "";

  if (result.score >= 40) {
    verdict = "⭐ Excellent";
    color = "text-green-600";
  } else if (result.score >= 30) {
    verdict = "✅ Good";
    color = "text-blue-600";
  } else if (result.score >= 20) {
    verdict = "👍 Average";
    color = "text-yellow-600";
  } else {
    verdict = "📚 Needs Improvement";
    color = "text-red-600";
  }

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

            <p className="text-xs text-gray-500">
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
       <div className="w-8 h-8 rounded-full bg-[#A67B5B] text-white flex items-center justify-center font-bold">S</div>
      <span className="font-md text-black">Hi,</span>
      <span className="font-bold text-black">User</span>
      </div>
        <button className="bg-gray-100 text-black px-5 py-2 rounded-full">
          Logout
        </button>
        </div>
        
</nav>

      <h1 className="text-4xl font-bold text-center mb-8 text-[#A67B5B]">
        Interview Result
      </h1>

      <div className="grid grid-cols-5 gap-5 mb-10">

        <div className="bg-white rounded-xl shadow p-5 text-center">
          <p className="text-black">Score</p>
          <h2 className="text-3xl font-bold text-gray-700">{result.score}/50</h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5 text-center">
          <p className="text-black">Answered</p>
          <h2 className="text-3xl font-bold text-gray-700">{result.answered}</h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5 text-center">
          <p className="text-black">Skipped</p>
          <h2 className="text-3xl font-bold text-gray-700">{result.skipped}</h2>
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

        {result.history.map((item, index) => (

          <div
            key={index}
            className="border rounded-xl p-5 mb-5 text-gray-500"
          >

            <h3 className="font-bold text-lg text-gray-700">
              Question {index + 1}
            </h3>

            <p className="mt-2 text-gray-500">
              <b>Question:</b> {item.question}
            </p>

            <p>
              <b>Your Answer:</b> {item.answer}
            </p>

            <p>
              <b>Status:</b> {item.status}
            </p>

            <p>
              <b>Difficulty:</b> {item.difficulty}
            </p>

            <p>
              <b>Score:</b> {item.score}/10
            </p>

            <p className="text-blue-600">
              <b>AI Feedback:</b> {item.feedback}
            </p>

          </div>

        ))}

      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-8">

        <h2 className="text-2xl font-bold mb-4 text-gray-700">
          Interview Verdict
        </h2>

        <p className={`text-3xl font-bold ${color}`}>
          {verdict}
        </p>

      </div>

      <div className="flex justify-center gap-5">

        <button
          onClick={() => router.push("/interview")}
          className="bg-[#A67B5B] text-white px-8 py-3 rounded-lg hover:bg-blue-700"
        >
          Practice Again
        </button>
        <button
          onClick={() => router.push("/history")}
          className="bg-[#A67B5B] text-white px-8 py-3 rounded-lg hover:bg-blue-700"
        >
          History
        </button>


      </div>
</div>
   
  );
}
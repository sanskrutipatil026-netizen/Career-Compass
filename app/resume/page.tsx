"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResumePage() {
  const router = useRouter();

  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
const handleAnalyze = async () => {
  if (!resume) {
    alert("Please upload your resume.");
    return;
  }

  setLoading(true);

  try {
    const formData = new FormData();
    formData.append("resume", resume);

    const response = await fetch("/api/interview/resume-analysis", {
      method: "POST",
      body: formData,
    });

    const responseText = await response.text();

    console.log("STATUS:", response.status);
    console.log("RESPONSE:", responseText);

    if (!response.ok) {
      alert(`Server Error ${response.status}:\n${responseText}`);
      return;
    }
const data = JSON.parse(responseText);

console.log("API DATA:", data);

let analysisData =
  data.result ??
  data.analysis ??
  data;

if (typeof analysisData === "string") {
  analysisData = JSON.parse(analysisData);
}

console.log("FINAL ANALYSIS:", analysisData);

if (!analysisData) {
  throw new Error("Resume analysis data is empty.");
}

localStorage.setItem(
  "resumeAnalysis",
  JSON.stringify(analysisData)
);

console.log(
  "SAVED TO LOCAL STORAGE:",
  localStorage.getItem("resumeAnalysis")
);

router.push("/resume/result");
    
  } catch (error) {
    console.error("FRONTEND ERROR:", error);

    alert(
      error instanceof Error
        ? error.message
        : "Something went wrong."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-amber-100">


      <nav className="bg-[#A67B5B] shadow px-8 py-4 flex justify-between">

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-white flex items-center justify-center font-bold">
            AI
          </div>

          <div>
            <h1 className="font-bold text-amber-100 text-lg">
              Carrer Compass
            </h1>

            <p className="text-xs text-gray-500">
              AI POWERED
            </p>
          </div>
        </div>
        <div className="flex gap-8 font -md">
  <button className="text-gray-200 hover:text-blue-500" onClick={() => router.push("/dashboard")} >⚡Dashboard</button>
  <button onClick={() => router.push("/interview")} className="text-gray-200 hover:text-blue-500">🎯Practice</button>
  <button onClick={() => router.push("/history")} className="text-gray-200 hover:text-blue-500">📊My Sessions</button>

</div>
<div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
       <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">S</div>
      <span className="font-md text-black">Hi,</span>
      <span className="font-bold text-black">User</span>
      </div>
        <button className="bg-gray-100 text-black px-5 py-2 rounded-full">
          Logout
        </button>
        </div>

        

      </nav>

     

      <div className="max-w-5xl mx-auto mt-10 bg-white rounded-xl shadow p-8">

        <h2 className="text-2xl font-bold text-black">
          AI Resume Analysis
        </h2>

        <p className="text-gray-400 mb-8">
          Upload your resume-Get domain recommendations
        </p>

       

        <label className="border-2 border-dashed border-gray-300 rounded-xl h-64 flex flex-col justify-center items-center cursor-pointer hover:border-blue-500">

          <div className="text-6xl">☁️</div>

          <h2 className="font-semibold text-xl mt-4">
            Drop your resume here
          </h2>

          <p className="text-gray-500">
            or click to browse
          </p>

          <p className="text-gray-400 text-sm">
            PDF, DOC, DOCX,TXT(Max 5MB)
          </p>

          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                setResume(e.target.files[0]);
              }
            }}
          />

        </label>

        

        {resume && (

          <div className="mt-6 border rounded-xl p-4">

            <h2 className="font-semibold text-black">
              📄 {resume.name}
            </h2>

            <p className="text-gray-400">
              {(resume.size / 1024).toFixed(2)} KB
            </p>

          </div>

        )}

       

        <div className="grid grid-cols-2 gap-5 mt-8">

          <div className="border rounded-lg p-5">
            <h3 className="font-bold text-black">🔍Skills Detection</h3>
            <p className="text-gray-400">
              Frameworks, Languages, Tools
            </p>
          </div>

          <div className="border rounded-lg p-5">
            <h3 className="font-bold text-black">📊Experience Level</h3>
            <p className="text-gray-400">
              Junior / Mid / Senior
            </p>
          </div>

          <div className="border rounded-lg p-5">
            <h3 className="font-bold text-black">🎯Domain Matching</h3>
            <p className="text-gray-400">
              Best-fit Interview Areas
            </p>
          </div>

          <div className="border rounded-lg p-5">
            <h3 className="font-bold text-black">💪Strength Analysis</h3>
            <p className="text-gray-400">
              Your Competitive Edge
            </p>
          </div>

        </div>

        <button
          onClick={handleAnalyze}
          className="w-full mt-8 bg-blue-500 hover:bg-[#A67B5B] text-white py-3 rounded-xl font-bold"
        >
          {loading ? "Analyzing Resume..." : "Analyze Resume with AI"}
        </button>

      </div>

    </div>
  );
}
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

    if (resume.size > 5 * 1024 * 1024) {
      alert("Resume file must be less than 5 MB.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", resume);

      const response = await fetch(
        "/api/interview/resume-analysis",
        {
          method: "POST",
          body: formData,
        }
      );

      const responseText = await response.text();

      console.log("STATUS:", response.status);
      console.log("RESPONSE:", responseText);

      if (!response.ok) {
        let errorMessage = `Server Error ${response.status}`;

        try {
          const errorData = JSON.parse(responseText);

          if (errorData?.error) {
            errorMessage = errorData.error;
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Keep default error
        }

        alert(errorMessage);
        return;
      }

      const data = JSON.parse(responseText);

      console.log("API DATA:", data);

      if (!data) {
        throw new Error(
          "Resume analysis data is empty."
        );
      }

      alert(
        "Resume analyzed successfully!"
      );

      router.push("/resume/result");
    } catch (error) {
      console.error(
        "FRONTEND ERROR:",
        error
      );

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

      {/* NAVBAR */}

      <nav className="bg-[#A67B5B] shadow px-8 py-4 flex justify-between">

        <div className="flex items-center gap-2">

          <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#A67B5B] flex items-center justify-center font-bold">
            AI
          </div>

          <div>

            <h1 className="font-bold text-amber-100 text-lg">
              Career Compass
            </h1>

            <p className="text-xs text-gray-200">
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

        <div className="flex items-center gap-4">

          

          

        </div>

      </nav>

      {/* MAIN */}

      <div className="max-w-5xl mx-auto mt-10 bg-white rounded-xl shadow p-8">

        <h2 className="text-2xl font-bold text-black">
          AI Resume Analysis
        </h2>

        <p className="text-gray-400 mb-8">
          Upload your resume - Get domain recommendations
        </p>

        {/* UPLOAD */}

        <label className="border-2 border-dashed border-gray-300 rounded-xl h-64 flex flex-col justify-center items-center cursor-pointer hover:border-blue-500">

          <div className="text-6xl">
            ☁️
          </div>

          <h2 className="font-semibold text-xl mt-4">
            Drop your resume here
          </h2>

          <p className="text-gray-500">
            or click to browse
          </p>

          <p className="text-gray-400 text-sm">
            PDF, DOC, DOCX, TXT (Max 5MB)
          </p>

          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={(e) => {
              if (
                e.target.files &&
                e.target.files.length > 0
              ) {
                setResume(
                  e.target.files[0]
                );
              }
            }}
          />

        </label>

        {/* SELECTED FILE */}

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

        {/* FEATURES */}

        <div className="grid grid-cols-2 gap-5 mt-8">

          <div className="border rounded-lg p-5">

            <h3 className="font-bold text-black">
              🔍 Skills Detection
            </h3>

            <p className="text-gray-400">
              Frameworks, Languages, Tools
            </p>

          </div>

          <div className="border rounded-lg p-5">

            <h3 className="font-bold text-black">
              📊 Experience Level
            </h3>

            <p className="text-gray-400">
              Junior / Mid / Senior
            </p>

          </div>

          <div className="border rounded-lg p-5">

            <h3 className="font-bold text-black">
              🎯 Domain Matching
            </h3>

            <p className="text-gray-400">
              Best-fit Interview Areas
            </p>

          </div>

          <div className="border rounded-lg p-5">

            <h3 className="font-bold text-black">
              💪 Strength Analysis
            </h3>

            <p className="text-gray-400">
              Your Competitive Edge
            </p>

          </div>

        </div>

        {/* ANALYZE */}

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={`w-full mt-8 text-white py-3 rounded-xl font-bold ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#A67B5B] hover:bg-blue-600"
          }`}
        >
          {loading
            ? "Analyzing Resume..."
            : "Analyze Resume with AI"}
        </button>

      </div>

    </div>
  );
}
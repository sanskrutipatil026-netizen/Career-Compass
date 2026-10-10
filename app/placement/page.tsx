"use client";

import { useEffect, useState } from "react";

export default function PlacementPage() {
  const [resumeScore, setResumeScore] = useState(0);
const [skillScore, setSkillScore] = useState(0);
const [interviewScore, setInterviewScore] = useState(0);

useEffect(() => {

  // Resume
  const resumeData = localStorage.getItem("resumeAnalysis");

  if (resumeData) {
    try {
      const parsed = JSON.parse(resumeData);

      const result =
        typeof parsed === "string"
          ? JSON.parse(parsed)
          : parsed;

      setResumeScore(Number(result.overallScore) || 0);
    } catch (error) {
      console.error("Error reading resume score:", error);
    }
  }

  // Skills
  const skillData = localStorage.getItem("skillAssessment");

  if (skillData) {
    try {
      const parsedSkill = JSON.parse(skillData);

      setSkillScore(Number(parsedSkill.score) || 0);
    } catch (error) {
      console.error("Error reading skill score:", error);
    }
  }

  // Interview
  const interviewData = localStorage.getItem("interviewResult");

  if (interviewData) {
    try {
      const parsedInterview = JSON.parse(interviewData);

      const percentage = Math.round(
        (Number(parsedInterview.score) / 50) * 100
      );

      setInterviewScore(percentage);
    } catch (error) {
      console.error("Error reading interview score:", error);
    }
  }

}, []);
 // Configurable scoring weights
const RESUME_WEIGHT = 0.30;
const SKILL_WEIGHT = 0.30;
const INTERVIEW_WEIGHT = 0.40;

const overallScore = Math.round(
  resumeScore * RESUME_WEIGHT +
  skillScore * SKILL_WEIGHT +
  interviewScore * INTERVIEW_WEIGHT
);
let placementStatus = "";

if (overallScore >= 85) {
  placementStatus = "Placement Ready";
} else if (overallScore >= 70) {
  placementStatus = "High Potential Candidate";
} else {
  placementStatus = "Needs Improvement";
}




  return (
    <div className="min-h-screen bg-amber-100">

      {/* Navbar */}
      <nav className="bg-[#A67B5B] shadow px-8 py-4 flex justify-between items-center">

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#A67B5B] flex items-center justify-center font-bold">
            AI
          </div>

          <div>
            <h1 className="font-bold text-amber-100 text-lg">
              MockInterview
            </h1>

            <p className="text-xs text-gray-200">
              AI POWERED
            </p>
          </div>
        </div>

        <div className="flex gap-8 font-medium">

          <a
            href="/dashboard"
            className="text-gray-200 hover:text-blue-500"
          >
            ⚡ Dashboard
          </a>

          <a
            href="/interview"
            className="text-gray-200 hover:text-blue-500"
          >
            🎯 Practice
          </a>

          <a
            href="/history"
            className="text-gray-200 hover:text-blue-500"
          >
            📊 My Sessions
          </a>

        </div>
      </nav>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        <h2 className="text-3xl font-bold text-[#A67B5B] text-center">
          AI Placement Readiness
        </h2>

        <p className="text-gray-500 text-center mt-2">
          Evaluate your overall preparation for placements.
        </p>

        {/* Score */}
        <div className="bg-white rounded-xl shadow p-8 mt-8 text-center">

          <p className="text-gray-500 text-lg">
            Overall Placement Readiness
          </p>

          <h1 className="text-6xl font-bold text-blue-600 mt-4">
            {overallScore}%
          </h1>

          <div className="w-full bg-gray-200 rounded-full h-4 mt-6">
            <div
              className="bg-blue-500 h-4 rounded-full"
              style={{ width: `${overallScore}%` }}
            />
          </div>

          <p className="text-gray-500 mt-4">
            Complete your resume analysis, interviews and skill assessments.
          </p>

        </div>

        {/* Three data sources */}
        <div className="grid grid-cols-3 gap-6 mt-8">

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-bold text-gray-800">
              📄 Resume
            </h3>

            <p className="text-gray-500 mt-2">
              Resume analysis score
            </p>

            <p className="text-3xl font-bold text-blue-600 mt-4">
              {resumeScore}%
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-bold text-gray-800">
              🎤 Interviews
            </h3>

            <p className="text-gray-500 mt-2">
              Interview performance
            </p>

            <p className="text-3xl font-bold text-blue-600 mt-4">
              {interviewScore}%
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-bold text-gray-800">
              🧠 Skills
            </h3>

            <p className="text-gray-500 mt-2">
              Technical skill assessment
            </p>

            <p className="text-3xl font-bold text-blue-600 mt-4">
             {skillScore}%
            </p>
          </div>

        </div>

        {/* Category */}
        <div className="bg-white rounded-xl shadow p-6 mt-8">

          <h3 className="text-xl font-bold text-gray-800">
            🏆 Placement Status
          </h3>

          <div className="mt-4 bg-gray-100 rounded-lg p-4">
           <p className="text-2xl font-bold text-blue-600">
  {placementStatus}
</p>

<p className="text-gray-500 mt-2">
  Based on your resume, interview performance and technical skills.
</p>
          </div>

        </div>

      </main>
    </div>
  );
}
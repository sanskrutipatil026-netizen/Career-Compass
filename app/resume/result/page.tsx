"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Domain = {
  name: string;
  score: number;
};

type ResumeAnalysis = {
  summary: string;
  skills: string[];
  strengths: string[];
  weaknesses: string[];
  overallScore: number;
  experienceLevel: string;
  communicationGaps: string[];
  missingIndustrySkills: string[];
  roadmap: string[];

  contactInfo?: {
    name?: {
      present: boolean;
      value: string;
      suggestion: string;
    };
    email?: {
      present: boolean;
      value: string;
      suggestion: string;
    };
    phone?: {
      present: boolean;
      value: string;
      suggestion: string;
    };
    linkedin?: {
      present: boolean;
      value: string;
      suggestion: string;
    };
    github?: {
      present: boolean;
      value: string;
      suggestion: string;
    };
    portfolio?: {
      present: boolean;
      value: string;
      suggestion: string;
    };
  };

  education?: {
    present: boolean;
    items: string[];
    suggestion: string;
  };

  experience?: {
    present: boolean;
    items: string[];
    suggestion: string;
  };

  projects?: {
    present: boolean;
    items: string[];
    suggestion: string;
  };

  hobbies?: {
    present: boolean;
    items: string[];
    suggestion: string;
  };

  languages?: {
    present: boolean;
    items: string[];
    suggestion: string;
  };

  extracurricularActivities?: {
    present: boolean;
    items: string[];
    suggestion: string;
  };

  certifications?: {
    present: boolean;
    items: string[];
    suggestion: string;
  };

  achievements?: {
    present: boolean;
    items: string[];
    suggestion: string;
  };

  missingSections?: string[];

  resumeImprovements?: {
    section: string;
    issue: string;
    whatToAdd: string;
    suggestion: string;
    priority: string;
  }[];

  domains: Domain[];
};

export default function ResumeResultPage() {
  const router = useRouter();

  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
useEffect(() => {
  try {
    const storedData = localStorage.getItem("resumeAnalysis");

    console.log("LOCAL STORAGE:", storedData);

    if (!storedData || storedData === "undefined") {
      setAnalysis(null);
      return;
    }

    const parsedData = JSON.parse(storedData);

    console.log("PARSED DATA:", parsedData);

    setAnalysis(parsedData);
  } catch (error) {
    console.error("ERROR:", error);
    setAnalysis(null);
  } finally {
    setLoading(false);
  }
}, []);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <h2 className="text-xl font-semibold text-blue-600">
          Loading your analysis...
        </h2>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800">
          No analysis found
        </h2>

        <button
          onClick={() => router.push("/resume")}
          className="mt-5 bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Analyze Resume
        </button>
      </div>
    );
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

          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-200 hover:text-blue-500"
          >
            ⚡ Dashboard
          </button>

          <button
            onClick={() => router.push("/interview")}
            className="text-gray-200 hover:text-blue-500"
          >
            🎯 Practice
          </button>

          <button
            onClick={() => router.push("/history")}
            className="text-gray-200 hover:text-blue-500"
          >
            📊 My Sessions
          </button>

        </div>
      </nav>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-blue-600 text-center">
            AI Resume Analysis
          </h2>

          <p className="text-gray-500 mt-2">
            Here is your AI-powered resume evaluation.
          </p>
        </div>

        {/* Score + Experience */}
        <div className="grid grid-cols-2 gap-6">

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500">
              Overall Resume Score
            </p>

            <div className="text-5xl font-bold text-blue-600 mt-3">
              {analysis.overallScore}%
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 mt-5">
              <div
                className="bg-blue-500 h-3 rounded-full"
                style={{
                  width: `${analysis.overallScore}%`,
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500">
              Experience Level
            </p>

            <h3 className="text-3xl font-bold text-gray-800 mt-3">
              {analysis.experienceLevel}
            </h3>
          </div>

        </div>
              {/* Summary */}
        <div className="bg-white rounded-xl shadow p-6 mt-6">

          <h3 className="text-xl font-bold text-gray-800 mb-3">
            📄 Resume Summary
          </h3>

          <p className="text-gray-600 leading-7">
            {analysis.summary}
          </p>

        </div>

        {/* Skills */}
        <div className="bg-white rounded-xl shadow p-6 mt-6">

          <h3 className="text-xl font-bold text-gray-800 mb-4">
            🔍 Skills Detected
          </h3>

          <div className="flex flex-wrap gap-3">

            {analysis.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-medium"
              >
                {skill}
              </span>
            ))}

          </div>

        </div>

        {/* Strengths + Weaknesses */}
        <div className="grid grid-cols-2 gap-6 mt-6">

          <div className="bg-white rounded-xl shadow p-6">

            <h3 className="text-xl font-bold text-gray-800 mb-4">
              💪 Strengths
            </h3>

            <div className="space-y-3">

              {analysis.strengths.map((strength, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 text-gray-600"
                >
                  ✓ {strength}
                </div>
              ))}

            </div>

          </div>

          <div className="bg-white rounded-xl shadow p-6">

            <h3 className="text-xl font-bold text-gray-800 mb-4">
              ⚠️ Areas to Improve
            </h3>
        

            <div className="space-y-3">

              {analysis.weaknesses.map((weakness, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 text-gray-600"
                >
                  • {weakness}
                </div>
              ))}

            </div>

          </div>
          {/* Communication Gaps */}
<div className="bg-white rounded-xl shadow p-6 mt-6">

  <h3 className="text-xl font-bold text-gray-800 mb-4">
    🗣️ Communication Gaps
  </h3>

  <div className="flex flex-wrap gap-3">

    {analysis.communicationGaps &&
    analysis.communicationGaps.length > 0 ? (
      analysis.communicationGaps.map((gap, index) => (
        <span
          key={index}
          className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-medium"
        >
          {gap}
        </span>
      ))
    ) : (
      <p className="text-gray-500">
        No major communication gaps identified.
      </p>
    )}

  </div>

</div>

        </div>
       {/* Missing Industry Skills */}
<div className="bg-white rounded-xl shadow p-6 mt-6">

  <h3 className="text-xl font-bold text-gray-800 mb-4">
    🚀 Missing Industry Skills
  </h3>

  <div className="flex flex-wrap gap-3">

    {analysis.missingIndustrySkills &&
    analysis.missingIndustrySkills.length > 0 ? (
      analysis.missingIndustrySkills.map((skill, index) => (
        <span
          key={index}
          className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-medium"
        >
          {skill}
        </span>
      ))
    ) : (
      <p className="text-gray-500">
        No major missing industry skills identified.
      </p>
    )}

  </div>

</div> 
{/* Personalized Roadmap */}
<div className="bg-white rounded-xl shadow p-6 mt-6">

  <h3 className="text-xl font-bold text-gray-800 mb-4">
    🛣️ Personalized Roadmap
  </h3>

  <div className="space-y-3">

    {analysis.roadmap && analysis.roadmap.length > 0 ? (
      analysis.roadmap.map((step, index) => (
        <div
          key={index}
          className="flex items-center gap-3 border rounded-lg p-3"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            {index + 1}
          </div>

          <p className="text-gray-700">
            {step}
          </p>
        </div>
      ))
    ) : (
      <p className="text-gray-500">
        No roadmap available.
      </p>
    )}

  </div>

</div>

        {/* Domains */}
        <div className="bg-white rounded-xl shadow p-6 mt-6">

          <h3 className="text-xl font-bold text-gray-800 mb-5">
            🎯 Recommended Interview Domains
          </h3>

          <div className="space-y-6">

  {analysis.domains && analysis.domains.length > 0 ? (
    analysis.domains.map((domain, index) => (
      <div key={index}>

        <div className="flex justify-between mb-2">

          <span className="font-semibold text-gray-700">
            {domain.name}
          </span>

          <span className="font-bold text-blue-600">
            {domain.score}%
          </span>

        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">

          <div
            className="bg-blue-500 h-3 rounded-full"
            style={{
              width: `${domain.score}%`,
            }}
          />

        </div>

      </div>
    ))
  ) : (
    <p className="text-gray-500">
      No interview domain recommendations available.
    </p>
  )}

</div>

        </div>
        {/* Resume Details Check */}
<div className="bg-white rounded-xl shadow p-6 mt-6">
  <h3 className="text-xl font-bold text-gray-800 mb-5">
    📋 Resume Details Check
  </h3>

  <div className="grid md:grid-cols-2 gap-4">

    {/* Name */}
    <div className="border rounded-xl p-4">
      <h4 className="font-bold text-gray-800">👤 Name</h4>
      <p className="text-gray-600 mt-1">
        {analysis.contactInfo?.name?.present
          ? `Found: ${analysis.contactInfo.name.value}`
          : "Missing from resume"}
      </p>
      {!analysis.contactInfo?.name?.present && (
        <p className="text-sm text-orange-600 mt-2">
          {analysis.contactInfo?.name?.suggestion}
        </p>
      )}
    </div>

    {/* Email */}
    <div className="border rounded-xl p-4">
      <h4 className="font-bold text-gray-800">📧 Email</h4>
      <p className="text-gray-600 mt-1">
        {analysis.contactInfo?.email?.present
          ? `Found: ${analysis.contactInfo.email.value}`
          : "Missing from resume"}
      </p>
      {!analysis.contactInfo?.email?.present && (
        <p className="text-sm text-orange-600 mt-2">
          {analysis.contactInfo?.email?.suggestion}
        </p>
      )}
    </div>

    {/* Phone */}
    <div className="border rounded-xl p-4">
      <h4 className="font-bold text-gray-800">📱 Phone</h4>
      <p className="text-gray-600 mt-1">
        {analysis.contactInfo?.phone?.present
          ? `Found: ${analysis.contactInfo.phone.value}`
          : "Missing from resume"}
      </p>
      {!analysis.contactInfo?.phone?.present && (
        <p className="text-sm text-orange-600 mt-2">
          {analysis.contactInfo?.phone?.suggestion}
        </p>
      )}
    </div>

    {/* LinkedIn */}
    <div className="border rounded-xl p-4">
      <h4 className="font-bold text-gray-800">💼 LinkedIn</h4>
      <p className="text-gray-600 mt-1">
        {analysis.contactInfo?.linkedin?.present
          ? `Found: ${analysis.contactInfo.linkedin.value}`
          : "Missing from resume"}
      </p>
      {!analysis.contactInfo?.linkedin?.present && (
        <p className="text-sm text-orange-600 mt-2">
          {analysis.contactInfo?.linkedin?.suggestion}
        </p>
      )}
    </div>

    {/* GitHub */}
    <div className="border rounded-xl p-4">
      <h4 className="font-bold text-gray-800">💻 GitHub</h4>
      <p className="text-gray-600 mt-1">
        {analysis.contactInfo?.github?.present
          ? `Found: ${analysis.contactInfo.github.value}`
          : "Missing from resume"}
      </p>
      {!analysis.contactInfo?.github?.present && (
        <p className="text-sm text-orange-600 mt-2">
          {analysis.contactInfo?.github?.suggestion}
        </p>
      )}
    </div>

    {/* Portfolio */}
    <div className="border rounded-xl p-4">
      <h4 className="font-bold text-gray-800">🌐 Portfolio</h4>
      <p className="text-gray-600 mt-1">
        {analysis.contactInfo?.portfolio?.present
          ? `Found: ${analysis.contactInfo.portfolio.value}`
          : "Missing from resume"}
      </p>
      {!analysis.contactInfo?.portfolio?.present && (
        <p className="text-sm text-orange-600 mt-2">
          {analysis.contactInfo?.portfolio?.suggestion}
        </p>
      )}
    </div>

  </div>
</div>
{/* Additional Resume Sections */}
<div className="grid md:grid-cols-2 gap-6 mt-6">

  {/* Experience */}
  <div className="bg-white rounded-xl shadow p-6">
    <h3 className="text-xl font-bold text-gray-800 mb-3">
      💼 Experience
    </h3>

    {analysis.experience?.present ? (
      analysis.experience.items.map((item, index) => (
        <p key={index} className="border rounded-lg p-3 mb-2 text-gray-600">
          {item}
        </p>
      ))
    ) : (
      <p className="text-orange-600">
        Missing: {analysis.experience?.suggestion}
      </p>
    )}
  </div>

  {/* Hobbies */}
  <div className="bg-white rounded-xl shadow p-6">
    <h3 className="text-xl font-bold text-gray-800 mb-3">
      🎨 Hobbies & Interests
    </h3>

    {analysis.hobbies?.present ? (
      <div className="flex flex-wrap gap-2">
        {analysis.hobbies.items.map((item, index) => (
          <span
            key={index}
            className="bg-amber-100 px-3 py-2 rounded-full text-gray-700"
          >
            {item}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-orange-600">
        Missing: {analysis.hobbies?.suggestion}
      </p>
    )}
  </div>

  {/* Languages */}
  <div className="bg-white rounded-xl shadow p-6">
    <h3 className="text-xl font-bold text-gray-800 mb-3">
      🗣️ Languages
    </h3>

    {analysis.languages?.present ? (
      <div className="flex flex-wrap gap-2">
        {analysis.languages.items.map((item, index) => (
          <span
            key={index}
            className="bg-blue-100 px-3 py-2 rounded-full text-blue-700"
          >
            {item}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-orange-600">
        Missing: {analysis.languages?.suggestion}
      </p>
    )}
  </div>

  {/* Certifications */}
  <div className="bg-white rounded-xl shadow p-6">
    <h3 className="text-xl font-bold text-gray-800 mb-3">
      📜 Certifications
    </h3>

    {analysis.certifications?.present ? (
      analysis.certifications.items.map((item, index) => (
        <p key={index} className="border rounded-lg p-3 mb-2 text-gray-600">
          {item}
        </p>
      ))
    ) : (
      <p className="text-orange-600">
        Missing: {analysis.certifications?.suggestion}
      </p>
    )}
  </div>

  {/* Achievements */}
  <div className="bg-white rounded-xl shadow p-6">
    <h3 className="text-xl font-bold text-gray-800 mb-3">
      🏆 Achievements
    </h3>

    {analysis.achievements?.present ? (
      analysis.achievements.items.map((item, index) => (
        <p key={index} className="border rounded-lg p-3 mb-2 text-gray-600">
          {item}
        </p>
      ))
    ) : (
      <p className="text-orange-600">
        Missing: {analysis.achievements?.suggestion}
      </p>
    )}
  </div>

  {/* Extracurricular Activities */}
  <div className="bg-white rounded-xl shadow p-6">
    <h3 className="text-xl font-bold text-gray-800 mb-3">
      🎯 Activities
    </h3>

    {analysis.extracurricularActivities?.present ? (
      analysis.extracurricularActivities.items.map((item, index) => (
        <p key={index} className="border rounded-lg p-3 mb-2 text-gray-600">
          {item}
        </p>
      ))
    ) : (
      <p className="text-orange-600">
        Missing: {analysis.extracurricularActivities?.suggestion}
      </p>
    )}
  </div>

</div>
        
        
{/* Missing Resume Sections */}
<div className="bg-white rounded-xl shadow p-6 mt-6">
  <h3 className="text-xl font-bold text-gray-800 mb-4">
    ❗ Missing From Your Resume
  </h3>

  {analysis.missingSections &&
  analysis.missingSections.length > 0 ? (
    <div className="flex flex-wrap gap-3">
      {analysis.missingSections.map((section, index) => (
        <span
          key={index}
          className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-medium"
        >
          {section}
        </span>
      ))}
    </div>
  ) : (
    <p className="text-gray-500">
      No important sections are missing.
    </p>
  )}
</div>
{/* Resume Improvements */}
<div className="bg-white rounded-xl shadow p-6 mt-6">
  <h3 className="text-xl font-bold text-gray-800 mb-4">
    ✨ How to Improve Your Resume
  </h3>

  {analysis.resumeImprovements &&
  analysis.resumeImprovements.length > 0 ? (
    <div className="space-y-4">
      {analysis.resumeImprovements.map((item, index) => (
        <div
          key={index}
          className="border rounded-xl p-4"
        >
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-lg text-gray-800">
              {item.section}
            </h4>

            <span className="text-sm px-3 py-1 rounded-full bg-orange-100 text-orange-700">
              {item.priority}
            </span>
          </div>

          <p className="mt-2 text-gray-600">
            <b>Problem:</b> {item.issue}
          </p>

          <p className="mt-2 text-gray-600">
            <b>What to add:</b> {item.whatToAdd}
          </p>

          <p className="mt-2 text-gray-600">
            <b>Suggestion:</b> {item.suggestion}
          </p>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500">
      Your resume has no major improvement suggestions.
    </p>
  )}
</div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-5 mt-8">

          <button
            onClick={() => router.push("/resume")}
            className="border border-[#A67B5B] text-[#A67B5B] hover:bg-blue-50 py-3 rounded-xl font-bold"
          >
            ← Analyze Another Resume
          </button>

          <button
            onClick={() => router.push("/interview")}
            className="bg-[#A67B5B] hover:bg-blue-700 text-white py-3 rounded-xl font-bold"
          >
            🎯 Start Interview
          </button>
          <button
  onClick={() => router.push("/placement")}
  className="w-full mt-5 bg-[#A67B5B] hover:bg-blue-700 text-white py-3 rounded-xl font-bold"
>
  🎯 Check Placement Readiness
</button>
<button
  onClick={() => router.push("/skills")}
  className="w-full mt-5 bg-[#A67B5B] hover:bg-blue-700 text-white py-3 rounded-xl font-bold"
>
🧠Skills Assesment
</button>

        </div>

      </main>
    </div>
  );
}
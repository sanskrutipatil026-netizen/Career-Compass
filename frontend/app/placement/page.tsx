 "use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const RESUME_WEIGHT = 0.4;
const SKILL_WEIGHT = 0.3;
const INTERVIEW_WEIGHT = 0.3;

type PlacementData = {
  resumeScore: number;
  skillScore: number;
  interviewScore: number;
};

type SessionWithBackendToken = {
  user?: {
    backendToken?: string;
  } | null;
};

export default function PlacementPage() {
  const router = useRouter();

  const [data, setData] = useState<PlacementData>({
    resumeScore: 0,
    skillScore: 0,
    interviewScore: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { data: session, status } = useSession();

  const backendToken = (
    session as typeof session & SessionWithBackendToken
  )?.user?.backendToken;

  useEffect(() => {
    // Wait for NextAuth to finish loading the session before requesting data.
    if (status === "loading") {
      return;
    }

    const fetchPlacementData = async () => {
      try {
        setLoading(true);
        setError("");

        if (!backendToken) {
          throw new Error(
            "Your backend authentication token is missing from the NextAuth session. Please sign out and sign in again. If the issue continues, check the NextAuth session callback."
          );
        }

        const headers = {
          Authorization: `Bearer ${backendToken}`,
        };

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

console.log("Placement backend URL:", BACKEND_URL);
console.log("Backend token exists:", Boolean(backendToken));

const [
  resumeResponse,
  skillResponse,
  interviewResponse,
] = await Promise.all([
  fetch(`${BACKEND_URL}/api/resume-analysis/latest`, {
    method: "GET",
    headers,
    cache: "no-store",
  }),

  fetch(`${BACKEND_URL}/api/skill-assessment/latest`, {
    method: "GET",
    headers,
    cache: "no-store",
  }),

  fetch(`${BACKEND_URL}/api/interview/latest`, {
    method: "GET",
    headers,
    cache: "no-store",
  }),
]);




        // Read response bodies safely in case the backend returns HTML or empty content.
        const readResponse = async (response: Response) => {
          const contentType = response.headers.get("content-type") || "";

          if (!contentType.includes("application/json")) {
            const body = await response.text();
            throw new Error(
              `Backend returned a non-JSON response (HTTP ${response.status}): ${body.slice(0, 160)}`
            );
          }

          return response.json();
        };

        const [resumeData, skillData, interviewData] = await Promise.all([
          readResponse(resumeResponse),
          readResponse(skillResponse),
          readResponse(interviewResponse),
        ]);

        if (!resumeResponse.ok) {
          throw new Error(
            resumeData?.message || "Failed to fetch resume analysis."
          );
        }

        if (!skillResponse.ok) {
          throw new Error(
            skillData?.message || "Failed to fetch skill assessment."
          );
        }

        if (!interviewResponse.ok) {
          throw new Error(
            interviewData?.message || "Failed to fetch interview."
          );
        }

        const resumeScore =
          Number(resumeData?.resumeAnalysis?.analysis?.overallScore) || 0;

        const skillScore =
          Number(skillData?.assessment?.percentage) || 0;

        const interviewRawScore =
          Number(interviewData?.interview?.totalScore) || 0;

        const interviewTotalQuestions =
          Number(interviewData?.interview?.totalQuestions) || 5;

        const interviewMaxScore = interviewTotalQuestions * 10;

        const interviewScore =
          interviewMaxScore > 0
            ? Math.round((interviewRawScore / interviewMaxScore) * 100)
            : 0;

        setData({
          resumeScore,
          skillScore,
          interviewScore,
        });
      } catch (err) {
        console.error("PLACEMENT DATA ERROR:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load placement data."
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchPlacementData();
  }, [backendToken, status]);

  const resumeContribution = data.resumeScore * RESUME_WEIGHT;
  const skillContribution = data.skillScore * SKILL_WEIGHT;
  const interviewContribution = data.interviewScore * INTERVIEW_WEIGHT;

  const overallScore = Math.round(
    resumeContribution + skillContribution + interviewContribution
  );

  const getStatus = () => {
    if (overallScore >= 85) return "Placement Ready";
    if (overallScore >= 70) return "High Potential Candidate";
    return "Needs Improvement";
  };

  // LOADING STATE
  if (loading || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-100 px-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#d6c1ad] border-t-[#A67B5B]" />
          <h1 className="mt-5 text-2xl font-bold text-[#49382a]">
            Loading Placement Score...
          </h1>
          <p className="mt-3 text-[#806b58]">
            Fetching your latest scores from MongoDB.
          </p>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-100 px-4">
        <div className="w-full max-w-xl rounded-2xl border border-[#e7d9ca] bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-[#49382a]">
            Unable to Load Placement Score
          </h1>
          <p className="mt-4 break-words text-gray-700">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-[#A67B5B] px-6 py-3 font-semibold text-white transition hover:bg-[#8e6548]"
          >
            Try Again
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="ml-3 mt-6 rounded-lg border border-[#d6c1ad] px-6 py-3 font-semibold text-[#795638] transition hover:bg-amber-50"
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-100 text-[#49382a]">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 flex flex-col justify-between gap-3 bg-[#A67B5B] px-4 py-3 shadow-md sm:px-6 lg:flex-row lg:items-center lg:px-8">
        {/* LOGO AND BRAND */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 font-bold text-[#A67B5B]">
            AI
          </div>
          <div>
            <h1 className="text-lg font-bold text-amber-100">
              Career Compass
            </h1>
            <p className="text-xs text-gray-200">AI POWERED</p>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex flex-wrap items-center justify-center gap-4 font-medium sm:gap-8">
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

        {/* USER PROFILE AND LOGOUT */}
        <div className="flex items-center justify-center gap-3 sm:gap-4" />
      </nav>

      {/* PLACEMENT SCORE CONTENT */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* PAGE HEADING */}
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A67B5B]">
            Career Readiness Analysis
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#49382a] sm:text-4xl">
            Placement Score
          </h1>
          <p className="mx-auto mt-3 max-w-2xl leading-6 text-[#806b58]">
            Your placement readiness is calculated using your resume, skill
            assessment, and interview performance.
          </p>
        </div>

        {/* OVERALL PLACEMENT SCORE */}
        <section className="mb-8 rounded-3xl border border-[#e7d9ca] bg-white p-6 shadow-xl sm:p-8">
          <div className="text-center">
            <p className="text-lg text-gray-500">Overall Placement Score</p>
            <div className="mt-3 text-6xl font-bold text-[#A67B5B] sm:text-7xl">
              {overallScore}
              <span className="text-3xl">/100</span>
            </div>
            <div className="mt-4 inline-block rounded-full bg-amber-100 px-5 py-2 font-semibold text-[#7b5b42]">
              {getStatus()}
            </div>
            <p className="mt-4 text-sm text-[#806b58]">
              Based on your latest available assessment results.
            </p>
          </div>
        </section>

        {/* INDIVIDUAL SCORE CARDS */}
        <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* RESUME SCORE */}
          <div className="rounded-2xl border border-[#e7d9ca] bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-gray-500">Resume Score</p>
              <span className="rounded-lg bg-amber-100 px-3 py-2 text-sm font-bold text-[#795638]">
                40%
              </span>
            </div>
            <p className="mt-4 text-4xl font-bold text-[#49382a]">
              {data.resumeScore}
              <span className="text-xl text-gray-400">/100</span>
            </p>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-500">Weighted Contribution</span>
                <span className="font-semibold">
                  {resumeContribution.toFixed(1)}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-[#A67B5B] transition-all duration-500"
                  style={{
                    width: `${Math.min(Math.max(resumeContribution, 0), 100)}%`,
                  }}
                />
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#806b58]">
              Measures how effectively your resume presents your education,
              skills, projects, and experience.
            </p>
          </div>

          {/* SKILL ASSESSMENT SCORE */}
          <div className="rounded-2xl border border-[#e7d9ca] bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-gray-500">Skill Assessment</p>
              <span className="rounded-lg bg-amber-100 px-3 py-2 text-sm font-bold text-[#795638]">
                30%
              </span>
            </div>
            <p className="mt-4 text-4xl font-bold text-[#49382a]">
              {data.skillScore}
              <span className="text-xl text-gray-400">/100</span>
            </p>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-500">Weighted Contribution</span>
                <span className="font-semibold">
                  {skillContribution.toFixed(1)}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-[#A67B5B] transition-all duration-500"
                  style={{
                    width: `${Math.min(Math.max(skillContribution, 0), 100)}%`,
                  }}
                />
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#806b58]">
              Measures your demonstrated knowledge and performance in skill
              assessments.
            </p>
          </div>

          {/* INTERVIEW SCORE */}
          <div className="rounded-2xl border border-[#e7d9ca] bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-gray-500">Interview Score</p>
              <span className="rounded-lg bg-amber-100 px-3 py-2 text-sm font-bold text-[#795638]">
                30%
              </span>
            </div>
            <p className="mt-4 text-4xl font-bold text-[#49382a]">
              {data.interviewScore}
              <span className="text-xl text-gray-400">/100</span>
            </p>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-500">Weighted Contribution</span>
                <span className="font-semibold">
                  {interviewContribution.toFixed(1)}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-[#A67B5B] transition-all duration-500"
                  style={{
                    width: `${Math.min(Math.max(interviewContribution, 0), 100)}%`,
                  }}
                />
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#806b58]">
              Measures your performance in the interview practice recorded by
              the application.
            </p>
          </div>
        </section>

        {/* SCORE CALCULATION */}
        <section className="rounded-2xl border border-[#e7d9ca] bg-white p-6 shadow-lg sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#A67B5B]">
              Understand your result
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[#49382a]">
              Score Calculation
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#806b58]">
              Your overall score is calculated by applying a weight to each
              assessment result.
            </p>
          </div>

          <div className="space-y-5 text-gray-700">
            <div className="flex flex-col justify-between gap-2 rounded-xl bg-[#fcfaf7] p-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-semibold text-[#49382a]">
                  Resume Contribution
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Resume score × 40%
                </p>
              </div>
              <span className="font-bold text-[#795638]">
                {data.resumeScore} × 40% = {resumeContribution.toFixed(1)}
              </span>
            </div>

            <div className="flex flex-col justify-between gap-2 rounded-xl bg-[#fcfaf7] p-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-semibold text-[#49382a]">
                  Skill Assessment Contribution
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Skill score × 30%
                </p>
              </div>
              <span className="font-bold text-[#795638]">
                {data.skillScore} × 30% = {skillContribution.toFixed(1)}
              </span>
            </div>

            <div className="flex flex-col justify-between gap-2 rounded-xl bg-[#fcfaf7] p-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-semibold text-[#49382a]">
                  Interview Contribution
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Interview score × 30%
                </p>
              </div>
              <span className="font-bold text-[#795638]">
                {data.interviewScore} × 30% = {interviewContribution.toFixed(1)}
              </span>
            </div>

            <div className="flex flex-col justify-between gap-3 border-t border-[#e7d9ca] pt-5 sm:flex-row sm:items-center">
              <span className="text-lg font-bold text-[#49382a]">
                Overall Placement Score
              </span>
              <span className="text-2xl font-bold text-[#A67B5B]">
                {overallScore}/100
              </span>
            </div>

            <p className="text-sm leading-6 text-[#806b58]">
              Note: Your placement score is an indicator of your preparation
              based on the available assessment results. It does not guarantee a
              job or placement offer.
            </p>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="mt-8 rounded-2xl bg-[#A67B5B] p-6 text-white shadow-lg sm:p-8">
          <h2 className="text-2xl font-bold">
            Improve Your Placement Readiness
          </h2>
          <p className="mt-2 max-w-2xl leading-6 text-white/90">
            Continue practising interviews, strengthen your technical skills,
            and explore platforms to discover opportunities.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push("/platforms")}
              className="rounded-xl border border-white/60 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Explore Platforms
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-white/60 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Back to Dashboard
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-8 text-center text-sm text-[#806b58]">
          Career Compass — Monitor your progress and prepare for your placement
          journey.
        </footer>
      </main>
    </div>
  );
}

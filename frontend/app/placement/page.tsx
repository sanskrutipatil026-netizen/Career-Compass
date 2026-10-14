"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const RESUME_WEIGHT = 0.40;
const SKILL_WEIGHT = 0.50;
const INTERVIEW_WEIGHT = 0.10;

type PlacementData = {
  resumeScore: number;
  skillScore: number;
  interviewScore: number;
};

export default function PlacementPage() {
  const [data, setData] = useState<PlacementData>({
    resumeScore: 0,
    skillScore: 0,
    interviewScore: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchPlacementData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          resumeResponse,
          skillResponse,
          interviewResponse,
        ] = await Promise.all([
          fetch(
            "http://localhost:5000/api/resume-analysis/latest",
            {
              cache: "no-store",
            }
          ),

          fetch(
            "http://localhost:5000/api/skill-assessment/latest",
            {
              cache: "no-store",
            }
          ),

          fetch(
            "http://localhost:5000/api/interview/latest",
            {
              cache: "no-store",
            }
          ),
        ]);

        const resumeData =
          await resumeResponse.json();

        const skillData =
          await skillResponse.json();

        const interviewData =
          await interviewResponse.json();

        if (!resumeResponse.ok) {
          throw new Error(
            resumeData?.message ||
              "Failed to fetch resume analysis."
          );
        }

        if (!skillResponse.ok) {
          throw new Error(
            skillData?.message ||
              "Failed to fetch skill assessment."
          );
        }

        if (!interviewResponse.ok) {
          throw new Error(
            interviewData?.message ||
              "Failed to fetch interview."
          );
        }

        const resumeScore =
          Number(
            resumeData?.resumeAnalysis?.analysis
              ?.overallScore
          ) || 0;

        const skillScore =
          Number(
            skillData?.assessment?.percentage
          ) || 0;

        const interviewRawScore =
          Number(
            interviewData?.interview?.totalScore
          ) || 0;

        const interviewTotalQuestions =
          Number(
            interviewData?.interview?.totalQuestions
          ) || 5;

        const interviewMaxScore =
          interviewTotalQuestions * 10;

        const interviewScore =
          interviewMaxScore > 0
            ? Math.round(
                (interviewRawScore /
                  interviewMaxScore) *
                  100
              )
            : 0;

        setData({
          resumeScore,
          skillScore,
          interviewScore,
        });
      } catch (err) {
        console.error(
          "PLACEMENT DATA ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load placement data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPlacementData();
  }, []);

  const resumeContribution =
    data.resumeScore * RESUME_WEIGHT;

  const skillContribution =
    data.skillScore * SKILL_WEIGHT;

  const interviewContribution =
    data.interviewScore *
    INTERVIEW_WEIGHT;

  const overallScore = Math.round(
    resumeContribution +
      skillContribution +
      interviewContribution
  );

  const getStatus = () => {
    if (overallScore >= 85) {
      return "Placement Ready";
    }

    if (overallScore >= 70) {
      return "High Potential Candidate";
    }

    return "Needs Improvement";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-800">
            Loading Placement Score...
          </div>

          <p className="mt-3 text-gray-600">
            Fetching your latest scores from MongoDB.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-amber-100 flex items-center justify-center px-6">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Unable to Load Placement Score
          </h1>

          <p className="mt-4 text-gray-700">
            {error}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 px-6 py-3 rounded-lg bg-[#A67B5B] text-white font-semibold hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-100 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-end mb-6">
  <button
    onClick={() => router.push("/platforms")}
    className="bg-[#A67B5B] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90"
  >
    Platform
  </button>
</div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800">
            Placement Score
          </h1>

          <p className="mt-2 text-gray-600">
            Your placement readiness is calculated using
            your Resume, Skill Assessment and Interview.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="text-center">

            <p className="text-gray-500 text-lg">
              Overall Placement Score
            </p>

            <div className="text-7xl font-bold text-[#A67B5B] mt-3">
              {overallScore}
              <span className="text-3xl">
                /100
              </span>
            </div>

            <div className="mt-4 inline-block px-5 py-2 rounded-full bg-amber-100 text-[#7b5b42] font-semibold">
              {getStatus()}
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <p className="text-gray-500">
              Resume Score
            </p>

            <p className="text-4xl font-bold text-gray-800 mt-2">
              {data.resumeScore}
              <span className="text-xl">
                /100
              </span>
            </p>

            <div className="mt-5">
              <div className="flex justify-between text-sm mb-2">
                <span>
                  Contribution
                </span>

                <span className="font-semibold">
                  {Math.round(
                    resumeContribution
                  )}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-[#A67B5B] h-3 rounded-full"
                  style={{
                    width: `${Math.min(
                      resumeContribution,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Weight: 40%
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <p className="text-gray-500">
              Skill Assessment
            </p>

            <p className="text-4xl font-bold text-gray-800 mt-2">
              {data.skillScore}
              <span className="text-xl">
                /100
              </span>
            </p>

            <div className="mt-5">
              <div className="flex justify-between text-sm mb-2">
                <span>
                  Contribution
                </span>

                <span className="font-semibold">
                  {Math.round(
                    skillContribution
                  )}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-[#A67B5B] h-3 rounded-full"
                  style={{
                    width: `${Math.min(
                      skillContribution,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Weight: 50%
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <p className="text-gray-500">
              Interview Score
            </p>

            <p className="text-4xl font-bold text-gray-800 mt-2">
              {data.interviewScore}
              <span className="text-xl">
                /100
              </span>
            </p>

            <div className="mt-5">
              <div className="flex justify-between text-sm mb-2">
                <span>
                  Contribution
                </span>

                <span className="font-semibold">
                  {Math.round(
                    interviewContribution
                  )}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-[#A67B5B] h-3 rounded-full"
                  style={{
                    width: `${Math.min(
                      interviewContribution,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Weight: 10%
            </p>
          </div>

        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Score Calculation
          </h2>

          <div className="space-y-4 text-gray-700">

            <div className="flex justify-between">
              <span>
                Resume Contribution
              </span>

              <span className="font-semibold">
                {data.resumeScore} × 40% ={" "}
                {resumeContribution.toFixed(1)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>
                Skill Assessment Contribution
              </span>

              <span className="font-semibold">
                {data.skillScore} × 50% ={" "}
                {skillContribution.toFixed(1)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>
                Interview Contribution
              </span>

              <span className="font-semibold">
                {data.interviewScore} × 10% ={" "}
                {interviewContribution.toFixed(1)}
              </span>
            </div>

            <div className="border-t pt-4 flex justify-between text-xl">
              <span className="font-bold">
                Overall Placement Score
              </span>

              <span className="font-bold text-[#A67B5B]">
                {overallScore}/100
              </span>
            </div>
            

          </div>
        </div>

      </div>
    </div>
  );
}

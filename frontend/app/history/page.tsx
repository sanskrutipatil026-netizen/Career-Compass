
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  question?: string;
  answer?: string;
  feedback?: string;
  score?: number;
  status?: string;
  topic?: string;
  difficulty?: string;
};

type Interview = {
  _id: string;
  totalScore?: number;
  totalQuestions?: number;
  answered?: number;
  skipped?: number;
  difficulty: string;
  time: string;
  createdAt?: string;
  date?: string;
  questions?: Question[];
  history?: Question[];
  resumeScore?: number;
};

const API_URL = "/api/interview/history";

export default function HistoryPage() {
  const router = useRouter();

  const [history, setHistory] = useState<Interview[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        console.log("History API response:", data);

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch interview history."
          );
        }

        const interviews: Interview[] = Array.isArray(data.interviews)
          ? data.interviews
          : [];

        setHistory(interviews);
      } catch (err) {
        console.error("Error fetching interview history:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load interview history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getQuestions = (item: Interview): Question[] =>
    item.questions ?? item.history ?? [];

  const getScore = (item: Interview) => {
    const questions = getQuestions(item);

    const questionTotal = questions.reduce(
      (sum, question) =>
        sum + Math.max(0, Number(question.score) || 0),
      0
    );

    const totalQuestions =
      Number(item.totalQuestions) > 0
        ? Number(item.totalQuestions)
        : questions.length;

    if (totalQuestions === 0) return 0;

    const savedTotal = Number(item.totalScore);

    const totalScore =
      Number.isFinite(savedTotal) && savedTotal > 0
        ? savedTotal
        : questionTotal;

    return Math.min(
      100,
      Math.max(
        0,
        Math.round((totalScore / (totalQuestions * 10)) * 100)
      )
    );
  };

  const getAnswered = (item: Interview) => {
    const questions = getQuestions(item);

    if (typeof item.answered === "number") {
      return item.answered;
    }

    return questions.filter(
      (question) => question.status === "Answered"
    ).length;
  };

  const getSkipped = (item: Interview) => {
    const questions = getQuestions(item);

    if (typeof item.skipped === "number") {
      return item.skipped;
    }

    return questions.filter(
      (question) => question.status === "Skipped"
    ).length;
  };

  const getDate = (item: Interview) => {
    const value = item.createdAt ?? item.date;

    if (!value) return "Not available";

    const parsedDate = new Date(value);

    return Number.isNaN(parsedDate.getTime())
      ? "Not available"
      : parsedDate.toLocaleString();
  };

  const deleteInterview = async (item: Interview) => {
    if (!item._id) {
      setError("Cannot delete this interview because its ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this interview?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(item._id)}`,
        {
          method: "DELETE",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to delete interview.");
      }

      setHistory((previous) =>
        previous.filter((interview) => interview._id !== item._id)
      );

      setOpenIndex(null);
      setError("");
    } catch (err) {
      console.error("Error deleting interview:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete interview."
      );
    }
  };

  const sortedHistory = [...history].sort(
    (a, b) =>
      new Date(b.createdAt ?? b.date ?? 0).getTime() -
      new Date(a.createdAt ?? a.date ?? 0).getTime()
  );

  return (
    <div className="min-h-screen bg-amber-100">
      <nav className="bg-[#A67B5B] shadow px-8 py-4 grid grid-cols-3 items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#A67B5B] flex items-center justify-center font-bold">
            AI
          </div>

          <div>
            <h1 className="font-bold text-amber-100 text-lg">
              Career Compass
            </h1>

            <p className="text-xs text-amber-100">AI POWERED</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 font-medium sm:gap-8">
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

        <div />
      </nav>

      <div className="min-h-screen bg-gray-100 p-8">
        {loading ? (
          <p className="rounded-xl bg-white p-6 text-gray-600 shadow">
            Fetching interview history from MongoDB...
          </p>
        ) : error && history.length === 0 ? (
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-red-600">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-[#A67B5B] px-4 py-2 text-white"
            >
              Try Again
            </button>
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-gray-500">No interview history found.</p>

            {error && <p className="mt-3 text-red-600">{error}</p>}
          </div>
        ) : (
          <>
            {error && (
              <p className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
                {error}
              </p>
            )}

            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-5">
                Progress Overview
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-blue-50 rounded-xl p-5">
                  <p className="text-gray-500">Best Interview Score</p>

                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {Math.max(...history.map(getScore))}%
                  </p>
                </div>

                <div className="bg-green-50 rounded-xl p-5">
                  <p className="text-gray-500">Average Interview Score</p>

                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {Math.round(
                      history.reduce(
                        (sum, item) => sum + getScore(item),
                        0
                      ) / history.length
                    )}
                    %
                  </p>
                </div>

                <div className="bg-purple-50 rounded-xl p-5">
                  <p className="text-gray-500">Total Interviews</p>

                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {history.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {sortedHistory.map((item, index) => {
                const score = getScore(item);
                const questions = getQuestions(item);

                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl shadow-lg p-6 h-fit self-start"
                  >
                    <h2 className="text-xl font-bold text-[#A67B5B]">
                      Interview #{index + 1}
                    </h2>

                    <p className="text-black">
                      Interview Date: {getDate(item)}
                    </p>

                    <p className="text-black">Score: {score}%</p>

                    <p className="text-black">
                      Answered: {getAnswered(item)}
                    </p>

                    <p className="text-black">
                      Skipped: {getSkipped(item)}
                    </p>

                    <p className="text-black">
                      Difficulty: {item.difficulty}
                    </p>

                    <p className="text-black">Time: {item.time}</p>

                    <p className="text-black font-semibold">
                      Final Verdict:{" "}
                      {score >= 80
                        ? "Excellent"
                        : score >= 60
                          ? "Good"
                          : score >= 40
                            ? "Average"
                            : "Needs Improvement"}
                    </p>

                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Score Progress</span>
                        <span>{score}%</span>
                      </div>

                      <div className="w-full bg-gray-300 rounded-full h-3">
                        <div
                          className={`${
                            score >= 80
                              ? "bg-green-500"
                              : score >= 60
                                ? "bg-blue-500"
                                : score >= 40
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                          } h-3 rounded-full`}
                          style={{
                            width: `${score}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-5">
                      <button
                        onClick={() =>
                          setOpenIndex(openIndex === index ? null : index)
                        }
                        className="bg-[#A67B5B] text-white px-4 py-2 rounded-lg"
                      >
                        View Details
                      </button>

                      <button
                        onClick={() => deleteInterview(item)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>

                    {openIndex === index && (
                      <div className="mt-5 border-t pt-4">
                        <h3 className="font-bold mb-3 text-green-600">
                          Questions & Answers
                        </h3>

                        {questions.length === 0 ? (
                          <p className="text-gray-500">
                            No question details were saved.
                          </p>
                        ) : (
                          questions.map((q, i) => (
                            <div
                              key={i}
                              className="bg-gray-700 text-white rounded-lg p-3 mb-3"
                            >
                              <p>
                                <b>Question:</b>{" "}
                                {q.question ?? "Not available"}
                              </p>

                              <p>
                                <b>Answer:</b>{" "}
                                {q.answer ?? "Not available"}
                              </p>

                              <p>
                                <b>Feedback:</b>{" "}
                                {q.feedback ?? "Not available"}
                              </p>

                              <p>
                                <b>Score:</b> {q.score ?? 0}/10
                              </p>

                              <p>
                                <b>Status:</b>{" "}
                                {q.status ?? "Not available"}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mt-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-5">
                Interview Progress
              </h2>

              <div className="flex items-end gap-4 h-64 border-b border-l border-gray-300 px-4">
                {sortedHistory.map((item, index) => {
                  const score = getScore(item);

                  return (
                    <div
                      key={item._id}
                      className="flex-1 flex flex-col items-center justify-end h-full"
                    >
                      <span className="text-sm font-bold text-blue-600 mb-2">
                        {score}%
                      </span>

                      <div
                        className="w-full max-w-16 bg-[#A67B5B] rounded-t-lg"
                        style={{
                          height: `${Math.max(score, 5)}%`,
                        }}
                      />

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

            {sortedHistory.length >= 2 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Candidate Potential
                </h2>

                {getScore(sortedHistory[0]) >
                getScore(sortedHistory[sortedHistory.length - 1]) ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <h3 className="text-xl font-bold text-blue-700">
                      High Potential Candidate
                    </h3>

                    <p className="text-gray-600 mt-2">
                      Your latest interview score is higher than your earliest
                      interview score.
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border rounded-xl p-5">
                    <h3 className="text-xl font-bold text-gray-700">
                      Keep Improving
                    </h3>

                    <p className="text-gray-600 mt-2">
                      Continue practicing interviews to improve your placement
                      readiness.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Personalized Recommendations
              </h2>

              {sortedHistory.length === 1 ? (
                <div className="bg-blue-50 rounded-xl p-4 text-gray-700">
                  Complete more interviews to receive personalized
                  recommendations based on your progress.
                </div>
              ) : (
                <div className="space-y-3">
                  {getScore(sortedHistory[0]) <
                    getScore(sortedHistory[sortedHistory.length - 1]) && (
                    <div className="border rounded-lg p-3 text-gray-700">
                      Your interview performance is improving. Continue
                      practicing consistently.
                    </div>
                  )}

                  {getScore(sortedHistory[0]) >
                    getScore(sortedHistory[sortedHistory.length - 1]) && (
                    <div className="border rounded-lg p-3 text-gray-700">
                      Your interview score has decreased. Focus on practicing
                      technical interview questions.
                    </div>
                  )}

                  {getScore(sortedHistory[0]) < 60 && (
                    <div className="border rounded-lg p-3 text-gray-700">
                      Focus on fundamental technical concepts and
                      problem-solving questions.
                    </div>
                  )}

                  {getScore(sortedHistory[0]) >= 80 && (
                    <div className="border rounded-lg p-3 text-gray-700">
                      Your technical performance is strong. Start practicing
                      advanced interview questions and real-world problems.
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

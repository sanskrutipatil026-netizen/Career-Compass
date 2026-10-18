
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Message = {
  sender: "AI" | "You";
  text: string;
  type?: "question" | "feedback";
};

type InterviewItem = {
  question: string;
  answer: string;
  topic: string;
  difficulty: string;
  score: number;
  feedback: string;
  status: "Answered" | "Skipped";
};

type InterviewApiResult = {
  score: number;
  difficulty: string;
  feedback: string;
  nextQuestion: string;
};

type InterviewSummary = {
  score: number;
  answered: number;
  skipped: number;
  difficulty: string;
  time: string;
  date: string;
  history: InterviewItem[];
};

export default function InterviewPage() {
  const router = useRouter();

  const [answer, setAnswer] = useState("");
  const [questionCount, setQuestionCount] = useState(1);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState("Medium");
  const [answered, setAnswered] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [interviewHistory, setInterviewHistory] = useState<InterviewItem[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "AI",
      text: "Preparing your personalized interview from your latest saved resume...",
    },
  ]);
  const [seconds, setSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isInterviewReady, setIsInterviewReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((previous) => previous + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const startInterview = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await fetch("/api/interview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            history: [],
            askedQuestions: [],
            answer: "continue",
            difficulty: "Medium",
          }),
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Unable to start the resume-based interview."
          );
        }

        const result: InterviewApiResult | undefined = data?.result;

        if (!result?.nextQuestion) {
          throw new Error("The AI did not return the first interview question.");
        }

        if (cancelled) return;

        setCurrentQuestion(result.nextQuestion);
        setDifficulty(result.difficulty || "Medium");

        setMessages([
          {
            sender: "AI",
            text: `Welcome to your resume-based interview! I'll ask questions based on the skills, projects, and experience in your latest saved resume.\n\nQuestion 1: ${result.nextQuestion}`,
            type: "question",
          },
        ]);

        setIsInterviewReady(true);
      } catch (error) {
        console.error("START INTERVIEW ERROR:", error);

        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Failed to start the interview."
          );

          setMessages([
            {
              sender: "AI",
              text: "I couldn't load your resume-based interview. Please make sure you have analyzed a resume and that the backend is running.",
            },
          ]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    startInterview();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatTime = () => {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
    const remainingSeconds = String(seconds % 60).padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
  };

  const saveAndFinishInterview = async (
    updatedHistory: InterviewItem[],
    finalScore: number,
    finalAnswered: number,
    finalSkipped: number,
    finalDifficulty: string
  ) => {
    setIsSaving(true);
    setErrorMessage("");

    const latestResult: InterviewSummary = {
      score: finalScore,
      answered: finalAnswered,
      skipped: finalSkipped,
      difficulty: finalDifficulty,
      time: formatTime(),
      date: new Date().toLocaleString(),
      history: updatedHistory,
    };

    try {
      localStorage.setItem(
        "interviewHistory",
        JSON.stringify(updatedHistory)
      );

      localStorage.setItem(
        "interviewResult",
        JSON.stringify(latestResult)
      );

      const response = await fetch("/api/interview/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeScore: 0,
          questions: updatedHistory,
          totalScore: finalScore,
          totalQuestions: updatedHistory.length,
          answered: finalAnswered,
          skipped: finalSkipped,
          difficulty: finalDifficulty,
          time: latestResult.time,
        }),
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || data?.success !== true) {
        console.error("INTERVIEW SAVE FAILED:", {
          status: response.status,
          data,
        });

        throw new Error(
          data?.message ||
            data?.error ||
            `Could not save your interview. Server returned ${response.status}.`
        );
      }

      const oldHistory = JSON.parse(
        localStorage.getItem("allInterviews") || "[]"
      );

      oldHistory.push(latestResult);

      localStorage.setItem(
        "allInterviews",
        JSON.stringify(oldHistory)
      );

      router.push("/result");
    } catch (error) {
      console.error("FAILED TO SAVE INTERVIEW:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save the interview. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const submitInterviewTurn = async (
    userAnswer: string,
    status: "Answered" | "Skipped"
  ) => {
    if (
      isLoading ||
      isSaving ||
      !isInterviewReady ||
      !currentQuestion
    ) {
      return;
    }

    if (status === "Answered" && !userAnswer.trim()) {
      setErrorMessage("Please type your answer before sending.");
      return;
    }

    if (
      status === "Answered" &&
      interviewHistory.some(
        (item) =>
          item.status === "Answered" &&
          item.answer.trim().toLowerCase() ===
            userAnswer.trim().toLowerCase()
      )
    ) {
      setErrorMessage(
        "You already gave the same answer. Please explain it differently."
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const cleanAnswer =
      status === "Skipped" ? "Skipped" : userAnswer.trim();

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history: interviewHistory,
          askedQuestions: [
            ...interviewHistory.map((item) => item.question),
            currentQuestion,
          ],
          answer: cleanAnswer,
          difficulty,
        }),
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "The interview API request failed."
        );
      }

      const aiResult: InterviewApiResult | undefined = data?.result;

      if (
        !aiResult ||
        typeof aiResult.score !== "number" ||
        !aiResult.nextQuestion ||
        !aiResult.feedback
      ) {
        throw new Error("The AI returned an incomplete interview result.");
      }

      const itemScore =
        status === "Skipped" ? 0 : aiResult.score;

      const updatedHistory: InterviewItem[] = [
        ...interviewHistory,
        {
          question: currentQuestion,
          answer: cleanAnswer,
          topic: "Resume-based",
          difficulty,
          score: itemScore,
          feedback:
            status === "Skipped"
              ? "Question skipped by candidate."
              : aiResult.feedback,
          status,
        },
      ];

      const newScore = score + itemScore;

      const newAnswered =
        answered + (status === "Answered" ? 1 : 0);

      const newSkipped =
        skipped + (status === "Skipped" ? 1 : 0);

      setScore(newScore);
      setAnswered(newAnswered);
      setSkipped(newSkipped);
      setInterviewHistory(updatedHistory);
      setDifficulty(aiResult.difficulty || difficulty);
      setAnswer("");

      setMessages((previous) => [
        ...previous,
        {
          sender: "You",
          text:
            status === "Answered"
              ? cleanAnswer
              : "Skipped this question.",
        },
        {
          sender: "AI",
          text:
            status === "Skipped"
              ? "Feedback: Question skipped by candidate.\nScore: 0/10"
              : `Feedback: ${aiResult.feedback}\nScore: ${itemScore}/10`,
          type: "feedback",
        },
      ]);

      localStorage.setItem(
        "interviewHistory",
        JSON.stringify(updatedHistory)
      );

      if (updatedHistory.length >= 5) {
        setQuestionCount(5);
        setIsInterviewReady(false);

        setMessages((previous) => [
          ...previous,
          {
            sender: "AI",
            text: "You have completed all five questions. Saving your interview results...",
          },
        ]);

        await saveAndFinishInterview(
          updatedHistory,
          newScore,
          newAnswered,
          newSkipped,
          aiResult.difficulty || difficulty
        );

        return;
      }

      setCurrentQuestion(aiResult.nextQuestion);
      setQuestionCount(updatedHistory.length + 1);

      setMessages((previous) => [
        ...previous,
        {
          sender: "AI",
          text: `Question ${updatedHistory.length + 1}: ${aiResult.nextQuestion}`,
          type: "question",
        },
      ]);
    } catch (error) {
      console.error("INTERVIEW TURN ERROR:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to process your answer. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    await submitInterviewTurn(answer, "Answered");
  };

  const handleSkip = async () => {
    await submitInterviewTurn("Skipped", "Skipped");
  };

  return (
    <div className="min-h-screen bg-amber-100">
      <nav className="grid grid-cols-3 items-center gap-4 bg-[#A67B5B] px-4 py-4 shadow-sm md:px-8">
        <div className="flex items-center gap-2">
          <h1 className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 font-bold text-[#A67B5B]">
            AI
          </h1>

          <div>
            <h1 className="text-lg font-bold text-amber-100">
              Career Compass
            </h1>
            <p className="text-xs text-amber-100/80">AI POWERED</p>
          </div>
        </div>

        <div className="col-start-2 flex flex-wrap items-center justify-center gap-3 font-medium md:gap-8">
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

        <div className="flex justify-end">
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-full bg-gray-100 px-5 py-2 text-black transition-colors hover:bg-white"
          >
            Exit
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <section className="mb-6 rounded-2xl bg-white p-5 shadow md:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Personalized Resume Interview
              </h2>

              <p className="mt-1 text-gray-500">
                Questions are generated from your latest resume saved in MongoDB.
              </p>
            </div>

            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
              ●{" "}
              {isSaving
                ? "Saving"
                : isLoading
                  ? "Preparing"
                  : isInterviewReady
                    ? "Live"
                    : "Needs attention"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-blue-50 p-4 text-center">
              <p className="text-sm text-gray-500">Progress</p>

              <h3 className="mt-1 text-3xl font-bold text-blue-700">
                {Math.round(
                  (interviewHistory.length / 5) * 100
                )}
                %
              </h3>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${Math.min(
                      (interviewHistory.length / 5) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 p-4 text-center">
              <p className="text-sm text-gray-500">Difficulty</p>

              <h3 className="mt-1 text-2xl font-bold uppercase text-amber-700">
                {difficulty}
              </h3>
            </div>

            <div className="rounded-xl bg-green-50 p-4 text-center">
              <p className="text-sm text-gray-500">Score</p>

              <h3 className="mt-1 text-3xl font-bold text-green-700">
                {score}/50
              </h3>
            </div>

            <div className="rounded-xl bg-stone-100 p-4 text-center">
              <p className="text-sm text-gray-500">Elapsed time</p>

              <h3 className="mt-1 text-3xl font-bold text-stone-700">
                {formatTime()}
              </h3>
            </div>
          </div>
        </section>

        <section className="flex h-[min(62vh,620px)] min-h-[420px] flex-col overflow-hidden rounded-2xl bg-white shadow">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 md:px-6">
            <div>
              <h3 className="font-bold text-gray-900">
                Interview conversation
              </h3>

              <p className="text-sm text-gray-500">
                Question {Math.min(questionCount, 5)} of 5
              </p>
            </div>

            <span className="rounded-lg bg-amber-100 px-3 py-2 text-sm font-semibold text-[#805B3F]">
              Resume-based questions
            </span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-5 md:p-6">
            {messages.map((message, index) => (
              <div
                key={`${index}-${message.sender}`}
                className={`flex ${
                  message.sender === "AI"
                    ? "justify-start"
                    : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-3 md:max-w-[75%] ${
                    message.sender === "AI"
                      ? message.type === "feedback"
                        ? "border border-amber-200 bg-amber-50 text-gray-800"
                        : "bg-gray-100 text-gray-900"
                      : "bg-[#A67B5B] text-white"
                  }`}
                >
                  <p
                    className={`mb-1 text-xs font-bold uppercase tracking-wide ${
                      message.sender === "You"
                        ? "text-amber-100"
                        : "text-gray-500"
                    }`}
                  >
                    {message.sender === "AI"
                      ? "Career Compass AI"
                      : "You"}
                  </p>

                  <p className="leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}

            {(isLoading || isSaving) && (
              <p className="text-sm text-gray-500" role="status">
                {isSaving
                  ? "Saving your completed interview..."
                  : isInterviewReady
                    ? "Evaluating your response and preparing the next question..."
                    : "Loading your resume and preparing the first question..."}
              </p>
            )}
          </div>

          <div className="border-t border-gray-100 p-4 md:p-5">
            {errorMessage && (
              <div
                role="alert"
                className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <span>{errorMessage}</span>

                {!isInterviewReady && !isSaving && (
                  <button
                    onClick={() => window.location.reload()}
                    className="font-semibold underline"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleSend();
              }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <input
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder={
                  isInterviewReady
                    ? "Type your answer here..."
                    : "Waiting for your resume-based question..."
                }
                disabled={
                  isLoading ||
                  isSaving ||
                  !isInterviewReady
                }
                aria-label="Your interview answer"
                className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-[#A67B5B] focus:ring-2 focus:ring-amber-200 disabled:bg-gray-100"
              />

              <button
                type="submit"
                disabled={
                  isLoading ||
                  isSaving ||
                  !isInterviewReady ||
                  !answer.trim()
                }
                className="rounded-xl bg-[#A67B5B] px-7 py-3 font-semibold text-white transition hover:bg-[#8f684b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : isLoading
                    ? "Please wait..."
                    : "Send answer"}
              </button>

              <button
                type="button"
                onClick={() => void handleSkip()}
                disabled={
                  isLoading ||
                  isSaving ||
                  !isInterviewReady
                }
                className="rounded-xl border border-[#A67B5B] px-7 py-3 font-semibold text-[#805B3F] transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Skip
              </button>
            </form>

            <p className="mt-3 text-xs text-gray-500">
              Your interview contains five questions. Your answers are evaluated
              against the question and the technologies or projects in your resume.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}


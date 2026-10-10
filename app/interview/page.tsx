"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { questions } from "../data/questions";

import { set } from "mongoose";

type Message = {
  sender: "AI" | "You";
  text: string;
  type?: "question" | "feedback";
};

export default function InterviewPage() {
  const router = useRouter();

  const [previousAnswers, setPreviousAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [difficulty, setDifficulty] = useState("easy");
  const [answer, setAnswer] = useState("");
  const [questionCount, setQuestionCount] = useState(1);
  const [score, setScore] = useState(0);
  const [askedQuestions, setAskedQuestions] = useState([0]);
  const [answered, setAnswered] = useState(0);
  const [skipped, setSkipped] = useState(0);

  const [interviewHistory, setInterviewHistory] = useState<
    {
      question: string;
      answer: string;
      topic: string;
      difficulty: string;
      score: number;
      feedback: string;
      status: "Answered" | "Skipped";
    }[]
  >([]);

  const [currentQuestion, setCurrentQuestion] = useState(
    questions[0].question
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "AI",
      text: currentQuestion,
    },
  ]);

  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((p) => p + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const [isLoading, setIsLoading] = useState(false);

  const getUniqueQuestion = async () => {
    while (true) {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history: interviewHistory,
          askedQuestions: interviewHistory.map((q) => q.question),
          answer: "continue",
          difficulty,
        }),
      });

      const data = await response.json();

if (!response.ok) {
  alert("API Error: " + (data?.error || "Unknown error"));
  setIsLoading(false);
  return;
}

if (!data?.result) {
  alert("AI result is missing.");
  setIsLoading(false);
  return;
}

const result =
  typeof data.result === "string"
    ? JSON.parse(data.result)
    : data.result;

      const exists = interviewHistory.some(
        (q) =>
          q.question.trim().toLowerCase() ===
          result.nextQuestion.trim().toLowerCase()
      );

      if (!exists) {
        return result;
      }
    }
  };

  const handleSend = async () => {
    if (isLoading) return;

    setIsLoading(true);

    if (!answer.trim()) {
      setIsLoading(false);
      return;
    }

    try {
      const userAnswer = answer.trim();
const response = await fetch("/api/interview", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    history: interviewHistory,
    askedQuestions: interviewHistory.map(
      (item) => item.question
    ),
    answer: userAnswer,
    difficulty,
  }),
});

const data = await response.json();

console.log("SEND STATUS:", response.status);
console.log("SEND RESPONSE:", data);

if (!response.ok) {
  throw new Error(data?.error || "API request failed");
}

if (!data?.result) {
  throw new Error("AI did not return a result");
}

const aiResult = data.result;

console.log("AI RESULT:", aiResult);

      const newScore = score + Number(aiResult.score);

      setScore(newScore);

      const nextDifficulty = aiResult.difficulty;

      setDifficulty(nextDifficulty);

      const isRepeated = previousAnswers.some(
        (a) => a.toLowerCase() === userAnswer.toLowerCase()
      );

      if (isRepeated) {
        alert("You already gave the same answer. Try explaining differently.");
        setIsLoading(false);
        return;
      }

      setPreviousAnswers((prev) => [...prev, userAnswer]);

      setMessages((prev) => [
        ...prev,
        {
          sender: "You",
          text: userAnswer,
        },
      ]);

      const updatedHistory = [
        ...interviewHistory,
        {
          question: currentQuestion,
          answer: userAnswer,
          topic: questions[currentQuestionIndex].topic,
          difficulty: nextDifficulty,
          score: aiResult.score,
          feedback: aiResult.feedback,
          status: "Answered" as const,
        },
      ];

      setInterviewHistory(updatedHistory);

      localStorage.setItem(
        "interviewHistory",
        JSON.stringify(updatedHistory)
      );

      const newAnswered = answered + 1;
      setAnswered(newAnswered);

      setAnswer("");

      // Check if interview is finished
      if (updatedHistory.length >= 5) {
        const oldHistory = JSON.parse(
          localStorage.getItem("allInterviews") || "[]"
        );

        const latestResult = {
          score: newScore,
          answered: newAnswered,
          skipped,
          difficulty: nextDifficulty,
          time: formatTime(),
          date: new Date().toLocaleString(),
          history: updatedHistory,
        };

        oldHistory.push(latestResult);

        localStorage.setItem(
          "allInterviews",
          JSON.stringify(oldHistory)
        );

        localStorage.setItem(
          "interviewResult",
          JSON.stringify(latestResult)
        );

        router.push("/result");
        return;
      }

      const uniqueResult = await getUniqueQuestion();

      setTimeout(async () => {
        setMessages((prev) => [
          ...prev,

          {
            sender: "AI",
            text: `✅ Feedback: ${aiResult.feedback}\n⭐ Score: ${aiResult.score}/10`,
            type: "feedback",
          },

          {
            sender: "AI",
            text: uniqueResult.nextQuestion,
            type: "question",
          },
        ]);

        setCurrentQuestion(uniqueResult.nextQuestion);

        setQuestionCount((prev) => prev + 1);

        setIsLoading(false);
      }, 700);
    } catch (error) {
      console.error(error);
      alert("Failed to generate interview result.");
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    if (isLoading) return;

    setIsLoading(true);

    const newSkipped = skipped + 1;
    setSkipped(newSkipped);

    const response = await fetch("/api/interview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        history: interviewHistory,
        askedQuestions: interviewHistory.map((item) => item.question),
        answer: "Skipped",
        difficulty,
      }),
    });

    const data = await response.json();

console.log("SEND STATUS:", response.status);
console.log("SEND RESPONSE:", data);

if (!response.ok) {
  throw new Error(data?.error || "API request failed");
}

if (!data?.result) {
  throw new Error("AI did not return a result");
}

const aiResult =
  typeof data.result === "string"
    ? JSON.parse(data.result)
    : data.result;

console.log("AI RESULT:", aiResult);

    

    setDifficulty(aiResult.difficulty);

    const updatedHistory = [
      ...interviewHistory,
      {
        question: currentQuestion,
        answer: "Skipped",
        topic: questions[currentQuestionIndex].topic,
        difficulty: aiResult.difficulty,
        score: 0,
        feedback: "Question skipped by candidate.",
        status: "Skipped" as const,
      },
    ];

    setInterviewHistory(updatedHistory);

    localStorage.setItem(
      "interviewHistory",
      JSON.stringify(updatedHistory)
    );

    if (updatedHistory.length >= 5) {
      const finalScore = updatedHistory.reduce(
        (total, item) => total + Number(item.score),
        0
      );

      const finalAnswered = updatedHistory.filter(
        (item) => item.status === "Answered"
      ).length;

      const finalSkipped = updatedHistory.filter(
        (item) => item.status === "Skipped"
      ).length;

      const oldHistory = JSON.parse(
        localStorage.getItem("allInterviews") || "[]"
      );

      const latestResult = {
        score: finalScore,
        answered: finalAnswered,
        skipped: finalSkipped,
        difficulty: aiResult.difficulty,
        time: formatTime(),
        date: new Date().toLocaleString(),
        history: updatedHistory,
      };

      oldHistory.push(latestResult);

      localStorage.setItem(
        "allInterviews",
        JSON.stringify(oldHistory)
      );

      localStorage.setItem(
        "interviewResult",
        JSON.stringify(latestResult)
      );

      setTimeout(() => {
        router.push("/result");
      }, 300);

      return;
    }

    const uniqueResult = await getUniqueQuestion();

    setMessages((prev) => [
      ...prev,

      {
        sender: "AI",
        text: "❌ Feedback: Question skipped by candidate.\n⭐ Score: 0/10",
        type: "feedback",
      },

      {
        sender: "AI",
        text: uniqueResult.nextQuestion,
        type: "question",
      },
    ]);

    setCurrentQuestion(uniqueResult.nextQuestion);

    setQuestionCount((prev) => prev + 1);

    setIsLoading(false);
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

            <p className="text-xs text-gray-200">
              AI POWERED
            </p>
          </div>
        </div>

        <div className="flex gap-8 font-md justify-center">
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

        <div className="flex items-center justify-center gap-4">
          <div className="flex justify-center gap-2 bg-gray-100 rounded-full px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[#A67B5B] text-white flex items-center justify-center font-bold">
              S
            </div>

            <span className="font-md text-black">
              Hi,
            </span>

            <span className="font-bold text-black">
              User
            </span>
          </div>

          <button className="bg-gray-100 text-black px-5 py-2 rounded-full">
            Logout
          </button>
        </div>

      </nav>

      <div className="bg-white mx-10 mt-6 rounded-xl shadow p-6 flex justify-between">

        <div className="mx-10 mt-4 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4">
            Interview Status
          </h3>

          <div className="grid grid-cols-3 gap-6">

            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-gray-500">
                Progress
              </p>

              <h2 className="text-3xl font-bold text-blue-600">
                {Math.round((questionCount / 5) * 100)}%
              </h2>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <p className="text-gray-500">
                Difficulty
              </p>

              <h2 className="text-3xl font-bold text-yellow-600">
                {difficulty.toUpperCase()}
              </h2>
            </div>

            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-gray-500">
                Score
              </p>

              <h2 className="text-3xl font-bold text-green-600">
                {score}/100
              </h2>
            </div>

          </div>
        </div>

        <div className="mx-10 mt-2">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full"
              style={{
                width: `${(questionCount / 5) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div>
            <h2 className="text-2xl font-bold text-black">
              JavaScript/Node.js Interview
            </h2>

            <p className="text-gray-400">
              AI Mock Interview Session
            </p>
          </div>

          <p className="text-green-600 font-semibold mt-1 rounded-full bg-green-100 px-1 py-1">
            ● Live
          </p>
        </div>

        <div className="text-center">
          <p className="text-gray-500">
            Question {questionCount} of 5
          </p>
        </div>

        <div className="flex items-center gap-4">
          <p className="font-bold text-xl text-gray-400">
            {formatTime()}
          </p>

          <button
            onClick={() => router.push("/dashboard")}
            className="bg-[#A67B5B] text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Exit
          </button>
        </div>

      </div>

      <div className="mx-10 mt-6 bg-white rounded-xl shadow h-[520px] flex flex-col">

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {messages.map((msg, index) => (

            <div
              key={index}
              className={`flex ${
                msg.sender === "AI"
                  ? "justify-start"
                  : "justify-end"
              }`}
            >

              <div
                className={`max-w-xl rounded-xl px-5 py-3 ${
                  msg.sender === "AI"
                    ? "bg-gray-200 text-black"
                    : "bg-blue-500 text-white"
                }`}
              >

                <p className="font-bold mb-1 text-black">
                  {msg.sender}
                </p>

                <p>
                  {msg.text}
                </p>

              </div>

            </div>

          ))}

        </div>

        <div className="border-t p-5">

          <div className="flex gap-3">

            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="flex-1 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            />

            <button
              onClick={handleSend}
              disabled={isLoading}
              className="bg-[#A67B5B] text-white px-8 rounded-lg"
            >
              Send
            </button>

            <button
              onClick={handleSkip}
              disabled={isLoading}
              className="bg-[#A67B5B] text-white px-8 rounded-lg"
            >
              Skip
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
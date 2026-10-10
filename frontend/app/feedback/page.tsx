"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FeedbackPage() {
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [helpfulness, setHelpfulness] = useState("");
  const [experience, setExperience] = useState("");
  const [mostHelpful, setMostHelpful] = useState("");
  const [improvement, setImprovement] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const helpfulnessOptions = [
    "Not helpful",
    "Slightly helpful",
    "Moderately helpful",
    "Very helpful",
    "Extremely helpful",
  ];

  const helpfulFeatures = [
    "AI Mock Interviews",
    "Resume Analysis",
    "Placement Preparation",
    "Skills & Assessments",
    "Career Resources",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (rating === 0) {
    alert("Please select a rating.");
    return;
  }

  if (!helpfulness) {
    alert("Please tell us how helpful Career Compass was.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating,
        helpfulness,
        experience,
        mostHelpful,
        improvement,
      }),
    });


const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to submit feedback.");
      return;
    }

    setSubmitted(true);
  } catch (error) {
    console.error("Feedback submission error:", error);
    alert("Unable to submit feedback. Please try again.");
  }
};


  if (submitted) {
    return (
      <div className="min-h-screen bg-amber-100 flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl shadow-lg max-w-2xl w-full p-10 text-center">

          <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-4xl">
            ✓
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mt-6">
            Thank You for Your Feedback!
          </h1>

          <p className="text-gray-600 mt-4 leading-relaxed">
            Your experience matters to us. Your feedback will help us improve
            Career Compass and make the platform more useful for students and
            job seekers.
          </p>

          <button
            onClick={() => router.push("/dashboard")}
            className="mt-8 bg-[#A67B5B] hover:bg-[#8f6549] text-white px-8 py-3 rounded-2xl font-medium transition"
          >
            Back to Dashboard
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-100">

      {/* Header */}
      <nav className="bg-[#A67B5B] shadow-sm px-8 py-4 flex justify-between items-center">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#A67B5B] flex items-center justify-center font-bold">
            AI
          </div>

          <div>
            <h1 className="font-bold text-amber-100 text-lg">
              Career Compass
            </h1>

            <p className="text-xs text-white">
              AI POWERED
            </p>
          </div>

        </div>

        <div className="text-amber-100 font-medium">
          Your Feedback Matters
        </div>

      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">

        <div className="text-center mb-10">

          <p className="text-[#A67B5B] font-semibold">
            HELP US IMPROVE
          </p>

          <h1 className="text-4xl font-bold text-gray-900 mt-2">
            We’d Love to Hear From You
          </h1>

          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Tell us about your experience with Career Compass and how much
            the platform has helped you with your career preparation.
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-lg p-8 md:p-10"
        >

          {/* Rating */}
          <section>

            <h2 className="text-xl font-bold text-gray-900">
              How would you rate your overall experience?
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Select a rating from 1 to 5 stars.
            </p>

            <div className="flex gap-3 mt-5">

              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-4xl transition ${
                    star <= rating
                      ? "text-[#A67B5B]"
                      : "text-gray-300 hover:text-[#A67B5B]"
                  }`}
                  aria-label={`Rate ${star} out of 5`}
                >
                  ★
                </button>
              ))}

            </div>

            {rating > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                You selected {rating} out of 5
              </p>
            )}

          </section>

          <div className="border-t border-gray-200 my-8" />

          {/* Helpfulness */}
          <section>

            <h2 className="text-xl font-bold text-gray-900">
              How helpful was Career Compass for you?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">

              {helpfulnessOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setHelpfulness(option)}
                  className={`text-left px-5 py-3 rounded-xl border transition ${
                    helpfulness === option
                      ? "border-[#A67B5B] bg-amber-50 text-[#8f6549] font-semibold"
                      : "border-gray-200 text-gray-700 hover:border-[#A67B5B]"
                  }`}
                >
                  {option}
                </button>
              ))}

            </div>

          </section>

          <div className="border-t border-gray-200 my-8" />

          {/* Experience */}
          <section>

            <h2 className="text-xl font-bold text-gray-900">
              Tell us about your experience
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              What did you like about the platform? How did it help you?
            </p>

            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Share your experience with Career Compass..."
              rows={5}
              className="w-full mt-4 border border-gray-200 rounded-2xl p-4 text-gray-800 outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] resize-none"
            />

          </section>

          <div className="border-t border-gray-200 my-8" />

          {/* Most Helpful Feature */}
          <section>

            <h2 className="text-xl font-bold text-gray-900">
              What helped you the most?
            </h2>

            <div className="flex flex-wrap gap-3 mt-5">

              {helpfulFeatures.map((feature) => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => setMostHelpful(feature)}
                  className={`px-4 py-2 rounded-full border transition ${
                    mostHelpful === feature
                      ? "bg-[#A67B5B] text-white border-[#A67B5B]"
                      : "bg-white text-gray-700 border-gray-200 hover:border-[#A67B5B]"
                  }`}
                >
                  {feature}
                </button>
              ))}

            </div>

          </section>

          <div className="border-t border-gray-200 my-8" />

          {/* Improvement */}
          <section>

            <h2 className="text-xl font-bold text-gray-900">
              What could we improve?
            </h2>

            <textarea
              value={improvement}
              onChange={(e) => setImprovement(e.target.value)}
              placeholder="Tell us what we could do better..."
              rows={4}
              className="w-full mt-4 border border-gray-200 rounded-2xl p-4 text-gray-800 outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] resize-none"
            />

          </section>

          {/* Submit */}
          <div className="mt-10 flex justify-center">

            <button
              type="submit"
              className="bg-[#A67B5B] hover:bg-[#8f6549] text-white px-10 py-4 rounded-2xl font-semibold shadow-sm transition"
            >
              Submit Feedback →
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}
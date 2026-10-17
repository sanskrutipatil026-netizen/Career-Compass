"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
       "https://career-compass-backend-v8sv.onrender.com/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to send reset link.");
        return;
      }

      setMessage(
        "Password reset link has been sent to your email."
      );

    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#fef3c7] via-[#fff8e7] to-[#f5e6d3] text-[#3d2e22] flex items-center justify-center px-4">

      <section className="w-full max-w-md rounded-3xl border border-[#a67b5b]/20 bg-[#fffdf8]/95 p-8 shadow-2xl">

        {/* Heading */}
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a67b5b]">
            Career Compass
          </p>

          <h1 className="mt-3 font-serif text-4xl font-bold text-[#8b6347]">
            Forgot Password?
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-[#6b5344]">
            Enter the email address associated with your Career Compass
            account and we'll send you a password reset link.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-7 space-y-5">

          <div>
            <label className="mb-1 block text-sm font-medium text-[#6b5344]">
              Email
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#a67b5b]/25 bg-[#fff8e7] px-4 py-3 outline-none transition focus:border-[#a67b5b] focus:bg-white focus:ring-4 focus:ring-[#a67b5b]/15"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Success */}
          {message && (
            <div className="rounded-xl bg-green-100 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#a67b5b] px-4 py-3 font-semibold text-white shadow-lg shadow-[#a67b5b]/25 transition hover:bg-[#8b6347] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {/* Back to Login */}
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="mt-6 w-full text-center text-sm font-medium text-[#8b6347] hover:underline"
        >
          ← Back to Sign in
        </button>

      </section>
    </main>
  );
}